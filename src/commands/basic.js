import path from "path";
import fs from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { get } from "../state.js";
import { printError } from "../cli/ui.js";
import { parseArgsWithQuotes } from "../utils/helpers.js";

export async function readFileContent(args) {
  const filePathArg = args.join(" ").trim();
  if (!filePathArg) return printError("Invalid input: Missing file path");
  const filePath = path.resolve(get("currentDir"), filePathArg);

  try {
    let mightNotBeUtf8 = false;
    const readableStream = createReadStream(filePath, { encoding: "utf8" });
    readableStream.on("data", (chunk) => {
      if (chunk.includes("\uFFFD")) {
        mightNotBeUtf8 = true;
      }
      process.stdout.write(chunk);
    });
    await new Promise((resolve, reject) => {
      readableStream.on("end", () => {
        console.log();
        resolve(undefined);
      });
      readableStream.on("error", reject);
    });
    if (mightNotBeUtf8) {
      console.warn(
        "\nWarning: File might not be UTF-8 encoded or contains binary data.",
      );
    }
  } catch (err) {
    printError();
  }
}

export async function createEmptyFile(args) {
  const fileName = args.join(" ").trim();
  if (!fileName) return printError("Invalid input: Missing file name");

  const filePath = path.resolve(get("currentDir"), fileName);
  try {
    await fs.writeFile(filePath, "", { flag: "wx" });
  } catch (err) {
    printError();
  }
}

export async function createDirectory(args) {
  const dirName = args.join(" ").trim();
  if (!dirName) return printError("Invalid input: Missing directory name");

  const dirPath = path.resolve(get("currentDir"), dirName);
  try {
    await fs.mkdir(dirPath);
  } catch (err) {
    printError();
  }
}

export async function renameFile(args) {
  const parsedArgs = parseArgsWithQuotes(
    args,
    2,
    "Invalid input: Expected rn <path_to_file> <new_filename>",
  );
  if (!parsedArgs) return;

  const [oldPathArg, newName] = parsedArgs;

  if (!oldPathArg || !newName)
    return printError("Invalid input: Missing arguments for rn");

  const oldPath = path.resolve(get("currentDir"), oldPathArg);
  const newPath = path.resolve(path.dirname(oldPath), newName);

  try {
    await fs.rename(oldPath, newPath);
  } catch (err) {
    printError();
  }
}

export async function copyFileCmd(args) {
  const parsedArgs = parseArgsWithQuotes(
    args,
    2,
    "Invalid input: Expected cp <path_to_file> <path_to_new_directory>",
  );
  if (!parsedArgs) return;

  const [sourcePathArg, destArg] = parsedArgs;

  if (!sourcePathArg || !destArg)
    return printError("Invalid input: Missing arguments for cp");

  const sourcePath = path.resolve(get("currentDir"), sourcePathArg);
  let destPath = path.resolve(get("currentDir"), destArg);

  try {
    await fs.access(sourcePath, fs.constants.R_OK);
    const sourceStat = await fs.stat(sourcePath);
    if (!sourceStat.isFile()) throw new Error("Source is not a file");

    let destStat = null;
    try {
      destStat = await fs.stat(destPath);
    } catch (statError) {}

    if (destStat && destStat.isDirectory()) {
      destPath = path.join(destPath, path.basename(sourcePath));
    }

    const finalDestDir = path.dirname(destPath);
    await fs.mkdir(finalDestDir, { recursive: true });

    const readable = createReadStream(sourcePath);
    const writable = createWriteStream(destPath, { flags: "wx" });

    await pipeline(readable, writable);
  } catch (err) {
    if (err.message === "Source is not a file") {
      printError("Operation failed: Source is not a file");
    } else if (err.code === "EEXIST") {
      printError("Operation failed: Destination file already exists");
    } else {
      printError();
    }
  }
}

export async function moveFile(args) {
  const parsedArgs = parseArgsWithQuotes(
    args,
    2,
    "Invalid input: Expected mv <path_to_file> <path_to_new_directory>",
  );
  if (!parsedArgs) return;

  const [sourcePathArg, destDirArg] = parsedArgs;

  if (!sourcePathArg || !destDirArg)
    return printError("Invalid input: Missing arguments for mv");

  const sourcePath = path.resolve(get("currentDir"), sourcePathArg);
  const destDir = path.resolve(get("currentDir"), destDirArg);
  const destPath = path.resolve(destDir, path.basename(sourcePath));

  let readable;
  let writable;

  try {
    await fs.access(sourcePath, fs.constants.R_OK | fs.constants.W_OK);
    const destDirStat = await fs.stat(destDir);
    if (!destDirStat.isDirectory())
      throw new Error("Destination is not a directory");

    try {
      await fs.rename(sourcePath, destPath);

      return;
    } catch (renameError) {
      if (renameError.code !== "EXDEV") {
        throw renameError;
      }
    }

    readable = createReadStream(sourcePath);
    writable = createWriteStream(destPath, { flags: "wx" });

    await pipeline(readable, writable);
    await fs.unlink(sourcePath);
  } catch (err) {
    readable?.destroy();
    writable?.destroy();

    if (err.code !== "EEXIST") {
      try {
        await fs.unlink(destPath);
      } catch {
        /* Ignore unlink error */
      }
    }

    printError();
  }
}

export async function deleteFile(args) {
  const filePathArg = args.join(" ").trim();
  if (!filePathArg) return printError("Invalid input: Missing file path");

  const filePath = path.resolve(get("currentDir"), filePathArg);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    printError();
  }
}
