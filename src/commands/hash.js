import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { createHash } from 'crypto';
import { get } from '../state.js';
import { printError } from '../cli/ui.js';

export async function calculateHash(args) {
    const filePathArg = args.join(' ').trim();
    if (!filePathArg) return printError('Invalid input: Missing file path');

    const filePath = path.resolve(get('currentDir'), filePathArg);

    try {
        const readable = createReadStream(filePath);
        const hash = createHash('sha256'); // Użyjemy SHA256

        readable.on('data', (chunk) => hash.update(chunk));

        await new Promise((resolve, reject) => {
            readable.on('end', () => resolve()); // Nie potrzebujemy przekazywać nic do resolve
            readable.on('error', reject);
        });

        console.log(`SHA256 Hash: ${hash.digest('hex')}`);
    } catch (err) {
        // console.error(err); // Debugging
        printError();
    }
}