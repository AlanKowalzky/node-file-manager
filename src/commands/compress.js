import path from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { get } from '../state.js';
import { printError } from '../cli/ui.js';
import { parseArgsWithQuotes } from '../utils/helpers.js'; // Import helper

async function handleCompression(args, compress) {
    const operation = compress ? 'compress' : 'decompress';
    const expectedArgs = compress ? 'compress <path_to_file> <path_to_destination>' : 'decompress <path_to_file> <path_to_destination>';

    const parsedArgs = parseArgsWithQuotes(args, 2, `Invalid input: Expected ${expectedArgs}`);
    if (!parsedArgs) return; // Error already printed

    const [sourcePathArg, destPathArg] = parsedArgs;

    if (!sourcePathArg || !destPathArg) return printError(`Invalid input: Missing arguments for ${operation}`);

    const sourcePath = path.resolve(get('currentDir'), sourcePathArg);
    // Destination path should be treated as a full path including the desired output filename
    let destPath = path.resolve(get('currentDir'), destPathArg);

    let readable;
    let writable;
    const brotliStream = compress ? createBrotliCompress() : createBrotliDecompress();

    try {
        // Ensure source file exists and is readable
        await fs.access(sourcePath, fs.constants.R_OK);
        const sourceStat = await fs.stat(sourcePath); // Get source stats
        if (!sourceStat.isFile()) throw new Error('Source is not a file');

        // Check if resolved destination exists and is a directory
        let destStat = null;
        try {
            destStat = await fs.stat(destPath);
        } catch (statError) {
            // If stat fails, destination likely doesn't exist, proceed
        }

        if (destStat && destStat.isDirectory()) {
            // If destination is a directory, adjust the final destPath
            let baseName = path.basename(sourcePath);
            if (compress) {
                baseName += '.br'; // Standard Brotli extension for compression
            } else { // Decompression: try to remove known extensions
                baseName = baseName.replace(/\.(br|zip)$/i, ''); // Remove .br or .zip
            }
            destPath = path.join(destPath, baseName); // Final path is inside the directory
        }
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
        if (err.message === 'Source is not a file') {
             printError('Operation failed: Source is not a file');
        } else if (err.code === 'EEXIST') {
             printError('Operation failed: Destination file already exists');
        } else {
             // console.error(err); // Debugging
             printError(`Operation failed during ${operation}`);
        }
    }
}

export const compressFile = (args) => handleCompression(args, true);
export const decompressFile = (args) => handleCompression(args, false);