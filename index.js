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
      const folders = files.filter(f => f.isDirectory()).map(f => f.name).sort();
      const regularFiles = files.filter(f => f.isFile()).map(f => f.name).sort();
      console.log('Type       Name');
      folders.forEach(name => console.log('DIR        ' + name));
      regularFiles.forEach(name => console.log('FILE       ' + name));
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