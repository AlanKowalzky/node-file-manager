import path from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { get } from '../state.js';
import { printError } from '../cli/ui.js';
import { parseArgsWithQuotes } from '../utils/helpers.js'; // Import helper

export async function readFileContent(args) {
  const filePathArg = args.join(' ').trim();
  if (!filePathArg) return printError('Invalid input: Missing file path');
  const filePath = path.resolve(get('currentDir'), filePathArg);
  // ... (przenieś logikę 'cat' tutaj, używając createReadStream i process.stdout.write)
  // Pamiętaj o obsłudze błędów i braku wywoływania printCurrentDir/rl.prompt
  try {
    let mightNotBeUtf8 = false;
    const readableStream = createReadStream(filePath, { encoding: 'utf8' });
    readableStream.on('data', (chunk) => {
        if (chunk.includes('\uFFFD')) { // Sprawdź, czy jest znak zastępczy Unicode
            mightNotBeUtf8 = true;
        }
        process.stdout.write(chunk)
    });
    await new Promise((resolve, reject) => {
        readableStream.on('end', () => { console.log(); resolve(undefined); }); // Zawsze dodaj nową linię na końcu
        readableStream.on('error', reject);
    });
    if (mightNotBeUtf8) {
        console.warn('\nWarning: File might not be UTF-8 encoded or contains binary data.');
    }
  } catch (err) {
      printError(); // Domyślny błąd 'Operation failed'
  }
}

export async function createEmptyFile(args) {
  const fileName = args.join(' ').trim();
  if (!fileName) return printError('Invalid input: Missing file name');

  const filePath = path.resolve(get('currentDir'), fileName);
  try {
    await fs.writeFile(filePath, '', { flag: 'wx' }); // 'wx' fails if path exists
  } catch (err) {
    // console.error(err); // Debugging
    printError();
  }
}

export async function createDirectory(args) {
  const dirName = args.join(' ').trim();
  if (!dirName) return printError('Invalid input: Missing directory name');

  const dirPath = path.resolve(get('currentDir'), dirName);
  try {
    await fs.mkdir(dirPath);
  } catch (err) {
    // console.error(err); // Debugging
    printError();
  }
}

export async function renameFile(args) {
  const parsedArgs = parseArgsWithQuotes(args, 2, 'Invalid input: Expected rn <path_to_file> <new_filename>');
  if (!parsedArgs) return; // Error already printed by helper

  const [oldPathArg, newName] = parsedArgs;


  if (!oldPathArg || !newName) return printError('Invalid input: Missing arguments for rn');

  const oldPath = path.resolve(get('currentDir'), oldPathArg);
  const newPath = path.resolve(path.dirname(oldPath), newName); // Rename in the same directory

  try {
    await fs.rename(oldPath, newPath);
  } catch (err) {
    // console.error(err); // Debugging
    printError();
  }
}

export async function copyFileCmd(args) { // Zmieniona nazwa na copyFileCmd
  const parsedArgs = parseArgsWithQuotes(args, 2, 'Invalid input: Expected cp <path_to_file> <path_to_new_directory>');
  if (!parsedArgs) return;

  const [sourcePathArg, destArg] = parsedArgs; // Renamed second arg for clarity

  if (!sourcePathArg || !destArg) return printError('Invalid input: Missing arguments for cp');

  const sourcePath = path.resolve(get('currentDir'), sourcePathArg);
  let destPath = path.resolve(get('currentDir'), destArg); // Resolve potential destination path

  try {
    await fs.access(sourcePath, fs.constants.R_OK); // Check source exists and is readable
    const sourceStat = await fs.stat(sourcePath);
    if (!sourceStat.isFile()) throw new Error('Source is not a file');

    // Check if destination exists and is a directory
    let destStat = null;
    try {
        destStat = await fs.stat(destPath);
    } catch (statError) {
        // If stat fails, destination likely doesn't exist, proceed
    }

    if (destStat && destStat.isDirectory()) {
        // If destination is a directory, copy file inside it with original name
        destPath = path.join(destPath, path.basename(sourcePath));
    }
    // If destination doesn't exist, destPath remains as resolved earlier
    // If destination exists and is a file, createWriteStream with 'wx' will fail later

    // Ensure the final destination directory exists before creating the stream
    const finalDestDir = path.dirname(destPath);
    await fs.mkdir(finalDestDir, { recursive: true });

    const readable = createReadStream(sourcePath);
    const writable = createWriteStream(destPath, { flags: 'wx' }); // 'wx' fails if destination exists

    await pipeline(readable, writable);
  } catch (err) {
    // Provide more specific error if possible
    if (err.message === 'Source is not a file') {
        printError('Operation failed: Source is not a file');
    } else if (err.code === 'EEXIST') {
        printError('Operation failed: Destination file already exists');
    } else {
    // console.error(err); // Debugging
    printError();
    }
  }
}

export async function moveFile(args) {
  const parsedArgs = parseArgsWithQuotes(args, 2, 'Invalid input: Expected mv <path_to_file> <path_to_new_directory>');
  if (!parsedArgs) return;

  const [sourcePathArg, destDirArg] = parsedArgs;

  if (!sourcePathArg || !destDirArg) return printError('Invalid input: Missing arguments for mv');

  const sourcePath = path.resolve(get('currentDir'), sourcePathArg);
  const destDir = path.resolve(get('currentDir'), destDirArg);
  const destPath = path.resolve(destDir, path.basename(sourcePath));

  let readable;
  let writable;

  try {
    // Check source exists and is readable/writable (for unlink)
    await fs.access(sourcePath, fs.constants.R_OK | fs.constants.W_OK);
    const destDirStat = await fs.stat(destDir);
    if (!destDirStat.isDirectory()) throw new Error('Destination is not a directory');

    // Attempt using fs.rename first (more efficient on the same filesystem)
    try {
        await fs.rename(sourcePath, destPath);
        // If rename succeeds, we are done.
        return;
    } catch (renameError) {
        // If rename fails (e.g., across different filesystems), proceed with copy+delete
        if (renameError.code !== 'EXDEV') { // EXDEV is cross-device link error
            throw renameError; // Re-throw other rename errors
        }
        // console.log('Rename failed (likely cross-device), attempting copy+delete...');
    }

    // Fallback to copy + delete
    readable = createReadStream(sourcePath);
    writable = createWriteStream(destPath, { flags: 'wx' }); // Fail if destination exists

    await pipeline(readable, writable);
    await fs.unlink(sourcePath); // Delete original file after successful copy

  } catch (err) {
    // Clean up potentially created streams on error during copy+delete fallback
    readable?.destroy();
    writable?.destroy();
    // Attempt to remove partially created file if copy failed
    if (err.code !== 'EEXIST') { // Don't try to remove if it failed because file exists
        try { await fs.unlink(destPath); } catch { /* Ignore unlink error */ }
    }
    // console.error(err); // Debugging
    printError();
  }
}

export async function deleteFile(args) {
  const filePathArg = args.join(' ').trim();
  if (!filePathArg) return printError('Invalid input: Missing file path');

  const filePath = path.resolve(get('currentDir'), filePathArg);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    // console.error(err); // Debugging
    printError();
  }
}