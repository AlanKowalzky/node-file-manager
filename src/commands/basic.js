import path from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { get } from '../state.js';
import { printError } from '../cli/ui.js';

export async function readFileContent(args) {
  const filePathArg = args.join(' ').trim();
  if (!filePathArg) return printError('Invalid input: Missing file path');
  const filePath = path.resolve(get('currentDir'), filePathArg);
  // ... (przenieś logikę 'cat' tutaj, używając createReadStream i process.stdout.write)
  // Pamiętaj o obsłudze błędów i braku wywoływania printCurrentDir/rl.prompt
  try {
    const readableStream = createReadStream(filePath, { encoding: 'utf8' });
    readableStream.on('data', (chunk) => process.stdout.write(chunk));
    await new Promise((resolve, reject) => {
        readableStream.on('end', () => { console.log(); resolve(undefined); }); // Dodaj nową linię na końcu
        readableStream.on('error', reject);
    });
  } catch (err) {
      printError(); // Domyślny błąd 'Operation failed'
  }
}

export async function createEmptyFile(args) {
  // ... (przenieś logikę 'add' tutaj, używając fs.writeFile z flagą 'wx')
}

export async function createDirectory(args) {
  // ... (przenieś logikę 'mkdir' tutaj, używając fs.mkdir)
}

export async function renameFile(args) {
  // ... (przenieś logikę 'rn' tutaj, używając fs.rename)
}

export async function copyFileCmd(args) { // Zmieniona nazwa na copyFileCmd
  // ... (przenieś logikę 'cp' tutaj, używając pipeline)
}

export async function moveFile(args) {
  // ... (przenieś logikę 'mv' tutaj, używając pipeline i fs.unlink)
}

export async function deleteFile(args) {
  // ... (przenieś logikę 'rm' tutaj, używając fs.unlink)
}