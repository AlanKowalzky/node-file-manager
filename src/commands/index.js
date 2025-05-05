import * as nwd from './nwd.js'
import * as files from './basic.js';
import * as osCmd from './os.js';
import * as hashCmd from './hash.js'; // Odkomentowano import
import * as compressCmd from './compress.js';
import * as meta from './meta.js'; // Importuj nowy moduł meta

import { printInvalidInput, printError } from '../cli/ui.js';

const commandMap = {
  // NWD
  up: nwd.goUp,
  cd: nwd.changeDirectory,
  ls: nwd.listDirectory,
  // File operations
  cat: files.readFileContent,
  add: files.createEmptyFile,
  mkdir: files.createDirectory,
  rn: files.renameFile,
  cp: files.copyFileCmd,
  mv: files.moveFile,
  rm: files.deleteFile,
  // OS
  os: osCmd.handleOsCommand,
  // Hash
  hash: hashCmd.calculateHash, // Odkomentowano użycie
  // Compress/Decompress
  compress: compressCmd.compressFile,
  decompress: compressCmd.decompressFile,
  // Meta
  help: meta.showHelp,
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