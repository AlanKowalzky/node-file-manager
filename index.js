#!/usr/bin/env node

import os from 'os';
import path from 'path';
import process from 'process';
import readline from 'readline';

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

function handleInput(line) {
  const trimmed = line.trim();
  if (trimmed === '.exit') {
    printGoodbye();
    process.exit(0);
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