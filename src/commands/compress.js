import path from "path";
import fs from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { createBrotliCompress, createBrotliDecompress } from "zlib";
import { pipeline } from "stream/promises";
import { get } from "../state.js";
import { printError } from "../cli/ui.js";
import { parseArgsWithQuotes } from "../utils/helpers.js";

async function handleCompression(args, compress) {
  const operation = compress ? "compress" : "decompress";
  const expectedArgs = compress
    ? "compress <path_to_file> <path_to_destination>"
    : "decompress <path_to_file> <path_to_destination>";

  const parsedArgs = parseArgsWithQuotes(
    args,
    2,
    `Invalid input: Expected ${expectedArgs}`,
  );
  if (!parsedArgs) return;

  const [sourcePathArg, destPathArg] = parsedArgs;

  if (!sourcePathArg || !destPathArg)
    return printError(`Invalid input: Missing arguments for ${operation}`);

  const sourcePath = path.resolve(get("currentDir"), sourcePathArg);

  let destPath = path.resolve(get("currentDir"), destPathArg);

  let readable;
  let writable;
  const brotliStream = compress
    ? createBrotliCompress()
    : createBrotliDecompress();

  try {
    await fs.access(sourcePath, fs.constants.R_OK);
    const sourceStat = await fs.stat(sourcePath);
    if (!sourceStat.isFile()) throw new Error("Source is not a file");

    let destStat = null;
    try {
      destStat = await fs.stat(destPath);
    } catch (statError) {}

    if (destStat && destStat.isDirectory()) {
      let baseName = path.basename(sourcePath);
      if (compress) {
        baseName += ".br";
      } else {
        baseName = baseName.replace(/\.(br|zip)$/i, "");
      }
      destPath = path.join(destPath, baseName);
    }

    await fs.access(sourcePath, fs.constants.R_OK);

    const destDir = path.dirname(destPath);
    await fs.mkdir(destDir, { recursive: true });

    readable = createReadStream(sourcePath);
    writable = createWriteStream(destPath, { flags: "wx" });

    await pipeline(readable, brotliStream, writable);
    console.log(`File ${operation}ed successfully to ${destPath}`);
  } catch (err) {
    readable?.destroy();
    writable?.destroy();
    brotliStream?.destroy();
    if (err.code !== "EEXIST") {
      try {
        await fs.unlink(destPath);
      } catch {
        /* Ignore unlink error */
      }
    }
    if (err.message === "Source is not a file") {
      printError("Operation failed: Source is not a file");
    } else if (err.code === "EEXIST") {
      printError("Operation failed: Destination file already exists");
    } else {
      printError(`Operation failed during ${operation}`);
    }
  }
}

export const compressFile = (args) => handleCompression(args, true);
export const decompressFile = (args) => handleCompression(args, false);
