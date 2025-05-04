#!/usr/bin/env node

import os from 'os';
import path from 'path';
import process from 'process';
import readline from 'readline';
import fs from 'fs/promises';

// Pobierz username z argumentów CLI
const args = process.argv.slice(2);
let username = 'Anonymous';
for (const arg of args) {
  if (arg.startsWith('--username=')) {
    username = arg.split('=')[1];
    break;
  }
}

// Ustal katalog domowy użytkownika
const homeDir = os.homedir();
let currentDir = homeDir;

function printWelcome() {
  console.log(`Welcome to the File Manager, ${username}!`);
}

function printCurrentDir() {
  console.log(`You are currently in ${currentDir}`);
}

function printGoodbye() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
}

// Obsługa zakończenia programu
process.on('SIGINT', () => {
  printGoodbye();
  process.exit(0);
});

// Start programu
printWelcome();
printCurrentDir();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ''
});

async function handleInput(line) {
  const trimmed = line.trim();
  if (trimmed === '.exit') {
    printGoodbye();
    process.exit(0);
  } else if (trimmed === 'up') {
    const parent = path.dirname(currentDir);
    // Nie pozwalaj wyjść poza root
    if (parent.length < homeDir.length) {
      printCurrentDir();
      rl.prompt();
      return;
    }
    currentDir = parent;
    printCurrentDir();
    rl.prompt();
  } else if (trimmed.startsWith('cd ')) {
    const dest = trimmed.slice(3).trim();
    let newPath = dest;
    if (!path.isAbsolute(dest)) {
      newPath = path.resolve(currentDir, dest);
    }
    try {
      const stat = await fs.stat(newPath);
      if (stat.isDirectory()) {
        // Nie pozwalaj wyjść poza root
        if (!newPath.startsWith(homeDir)) {
          throw new Error();
        }
        currentDir = newPath;
        printCurrentDir();
      } else {
        console.log('Operation failed');
      }
    } catch {
      console.log('Operation failed');
    }
    rl.prompt();
  } else if (trimmed === 'ls') {
    try {
      const files = await fs.readdir(currentDir, { withFileTypes: true });
      const entries = files
        .map(f => ({
          name: f.name,
          type: f.isDirectory() ? 'DIR' : f.isFile() ? 'FILE' : 'OTHER'
        }))
        .filter(e => e.type === 'DIR' || e.type === 'FILE') // Pokaż tylko pliki i foldery
        .sort((a, b) => {
          // Najpierw foldery, potem pliki, alfabetycznie w każdej grupie
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === 'DIR' ? -1 : 1;
        });

      console.log('Type   Name');
      console.log('----   ----');
      entries.forEach(entry => console.log(`${entry.type.padEnd(4)}   ${entry.name}`));
    } catch {
      console.log('Operation failed');
    }
    printCurrentDir();
    rl.prompt();
  } else {
    console.log('Invalid input');
    printCurrentDir();
    rl.prompt();
  }
}

rl.on('line', handleInput);
rl.on('close', () => {
  printGoodbye();
  process.exit(0);
});

rl.prompt(); 