import path from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { get } from '../state.js';
import { printError } from '../cli/ui.js';

async function handleCompression(args, compress) {
    const combinedArgs = args.join(' ');
    const parts = combinedArgs.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

    const operation = compress ? 'compress' : 'decompress';
    const expectedArgs = compress ? 'compress <path_to_file> <path_to_destination>' : 'decompress <path_to_file> <path_to_destination>';

    if (parts.length !== 2) {
        return printError(`Invalid input: Expected ${expectedArgs}`);
    }

    const sourcePathArg = parts[0].replace(/['"]/g, '');
    const destPathArg = parts[1].replace(/['"]/g, '');

    if (!sourcePathArg || !destPathArg) return printError(`Invalid input: Missing arguments for ${operation}`);

    const sourcePath = path.resolve(get('currentDir'), sourcePathArg);
    // Destination path should be treated as a full path including the desired output filename
    const destPath = path.resolve(get('currentDir'), destPathArg);

    let readable;
    let writable;
    const brotliStream = compress ? createBrotliCompress() : createBrotliDecompress();

    try {
        // Ensure source file exists and is readable
        await fs.access(sourcePath, fs.constants.R_OK);

        // Ensure destination directory exists (create if not)
        const destDir = path.dirname(destPath);
        await fs.mkdir(destDir, { recursive: true });

        readable = createReadStream(sourcePath);
        writable = createWriteStream(destPath, { flags: 'wx' }); // Fail if destination file exists

        await pipeline(
            readable,
            brotliStream,
            writable
        );
        console.log(`File ${operation}ed successfully to ${destPath}`);

    } catch (err) {
        // Clean up potentially created streams/files on error
        readable?.destroy();
        writable?.destroy();
        brotliStream?.destroy();
        if (err.code !== 'EEXIST') { // Don't try to remove if it failed because file exists
            try { await fs.unlink(destPath); } catch { /* Ignore unlink error */ }
        }
        // console.error(err); // Debugging
        printError(`Operation failed during ${operation}`);
    }
}

export const compressFile = (args) => handleCompression(args, true);
export const decompressFile = (args) => handleCompression(args, false);