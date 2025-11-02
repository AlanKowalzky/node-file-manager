import * as nwd from "./nwd.js";
import * as files from "./basic.js";
import * as osCmd from "./os.js";
import * as hashCmd from "./hash.js";
import * as compressCmd from "./compress.js";
import * as meta from "./meta.js";

import { printInvalidInput, printError } from "../cli/ui.js";

const commandMap = {
  up: nwd.goUp,
  cd: nwd.changeDirectory,
  ls: nwd.listDirectory,

  cat: files.readFileContent,
  add: files.createEmptyFile,
  mkdir: files.createDirectory,
  rn: files.renameFile,
  cp: files.copyFileCmd,
  mv: files.moveFile,
  rm: files.deleteFile,

  os: osCmd.handleOsCommand,

  hash: hashCmd.calculateHash,

  compress: compressCmd.compressFile,
  decompress: compressCmd.decompressFile,

  help: meta.showHelp,
};

export async function handleCommand(line) {
  const trimmed = line.trim();
  if (!trimmed) return;

  const [command, ...args] = trimmed.split(" ");
  const handler = commandMap[command];

  if (handler) {
    try {
      await handler(args);
    } catch (error) {
      printError();
    }
  } else {
    printInvalidInput();
  }
}
