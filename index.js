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

// Funkcja do rysowania tabeli ASCII
function printAsciiTable(entries) {
  if (!entries.length) {
    console.log('Directory is empty.'); // Zmieniono wiadomość
    return;
  }

  // Sprawdź, czy jakikolwiek wpis ma rozmiar (czy to nie tylko katalogi)
  const hasSize = entries.some(e => e.size !== undefined && e.size !== null);
  // Oblicz maksymalne długości dla nazw i rozmiarów (minimum 4 znaki dla nagłówków)
  const maxNameLen = Math.max(...entries.map(e => e.name.length), 4);
  const maxSizeLen = hasSize ? Math.max(...entries.map(e => (e.size?.toString().length || 0)), 4) : 0;

  // Zbuduj linie tabeli
  const header = hasSize
    ? `┌──────┬─${'─'.repeat(maxSizeLen)}─┬─${'─'.repeat(maxNameLen)}─┐`
    : `┌──────┬─${'─'.repeat(maxNameLen)}─┐`;
  const titles = hasSize
    ? `│ Type │ Size${' '.repeat(maxSizeLen - 4)} │ Name${' '.repeat(maxNameLen - 4)} │`
    : `│ Type │ Name${' '.repeat(maxNameLen - 4)} │`;
  const divider = hasSize
    ? `├──────┼─${'─'.repeat(maxSizeLen)}─┼─${'─'.repeat(maxNameLen)}─┤`
    : `├──────┼─${'─'.repeat(maxNameLen)}─┤`;
  const footer = hasSize
    ? `└──────┴─${'─'.repeat(maxSizeLen)}─┴─${'─'.repeat(maxNameLen)}─┘`
    : `└──────┴─${'─'.repeat(maxNameLen)}─┘`;

  console.log(header);
  console.log(titles);
  console.log(divider);
  entries.forEach(e => {
    const paddedName = e.name.padEnd(maxNameLen);
    const paddedType = e.type.padEnd(4);
    const sizeStr = hasSize ? (e.size !== undefined && e.size !== null ? e.size.toString().padStart(maxSizeLen) : ''.padStart(maxSizeLen)) : '';
    console.log(hasSize ? `│ ${paddedType} │ ${sizeStr} │ ${paddedName} │` : `│ ${paddedType} │ ${paddedName} │`);
  });
  console.log(footer);
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

      // Pobierz statystyki dla wszystkich plików/katalogów, aby dodać rozmiar
      const entriesPromises = files.map(async (f) => {
        const entryPath = path.join(currentDir, f.name);
        let stats = null;
        try {
          // Użyj lstat, aby nie podążać za linkami symbolicznymi
          stats = await fs.lstat(entryPath);
        } catch (statError) {
          // Ignoruj błędy dla pojedynczych plików (np. brak uprawnień)
        }
        return {
          name: f.name,
          type: stats?.isDirectory() ? 'DIR' : stats?.isFile() ? 'FILE' : 'OTHER',
          size: stats?.isFile() ? stats.size : null // Rozmiar tylko dla plików
        };
      });

      const entriesWithStats = await Promise.all(entriesPromises);

      const entries = entriesWithStats
        .filter(e => e.type === 'DIR' || e.type === 'FILE') // Pokaż tylko pliki i foldery
        .sort((a, b) => {
          // Sortuj: Najpierw foldery, potem pliki, alfabetycznie w każdej grupie
          if (a.type !== b.type) {
            return a.type === 'DIR' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });

      // Użyj nowej funkcji do wyświetlenia tabeli
      printAsciiTable(entries);
    } catch (err) { // Złap potencjalne błędy readdir itp.
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