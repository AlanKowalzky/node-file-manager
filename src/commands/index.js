import * as nwd from './nwd.js';
import * as basic from './basic.js';
import * as osCmd from './os.js';
// Importuj inne moduły komend (hash, compress), gdy będą gotowe

import { printInvalidInput, printError } from '../cli/ui.js';

const commandMap = {
  // NWD
  up: nwd.goUp,
  cd: nwd.changeDirectory,
  ls: nwd.listDirectory,
  // Basic
  cat: basic.readFileContent,
  add: basic.createEmptyFile,
  mkdir: basic.createDirectory,
  rn: basic.renameFile,
  cp: basic.copyFileCmd, // Zmieniono nazwę, aby uniknąć konfliktu
  mv: basic.moveFile,
  rm: basic.deleteFile,
  // OS
  os: osCmd.handleOsCommand,
  // TODO: Hash
  // hash: hashCmd.calculateHash,
  // TODO: Compress/Decompress
  // compress: compressCmd.compressFile,
  // decompress: compressCmd.decompressFile,
};

export async function handleCommand(line) {
  const trimmed = line.trim();
  if (!trimmed) return; // Ignore empty lines

  const [command, ...args] = trimmed.split(' ');
  const handler = commandMap[command];

  if (handler) {
    try {
      await handler(args); // Przekaż argumenty do handlera
    } catch (error) {
      // console.error('Command execution error:', error); // For debugging
      printError(); // Print standard "Operation failed"
    }
  } else {
    printInvalidInput();
  }
}