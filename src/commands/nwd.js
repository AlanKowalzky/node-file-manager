// c:\progNodeJS\node-file-manager\src\commands\nwd.js
import path from 'path';
import fs from 'fs/promises';
import { get, set } from '../state.js';
import { printAsciiTable, printError } from '../cli/ui.js';

export function goUp() {
  const currentDir = get('currentDir');
  const homeDir = get('homeDir');
  const parent = path.dirname(currentDir);
  if (parent.length >= homeDir.length && parent !== currentDir) { // Ensure we don't go above home and actually move
    set('currentDir', parent);
  } else {
    // Optional: print message that we are at the top?
  }
  // No need to print current dir here, app.js does it
}

export async function changeDirectory(args) {
  const dest = args.join(' ').trim(); // Join args back in case path has spaces
  if (!dest) {
    printError('Invalid input: Missing directory path');
    return;
  }
  const currentDir = get('currentDir');
  const homeDir = get('homeDir');
  let newPath = dest;

  if (!path.isAbsolute(dest)) {
    newPath = path.resolve(currentDir, dest);
  }

  try {
    const stat = await fs.stat(newPath);
    if (stat.isDirectory()) {
      if (!newPath.startsWith(homeDir)) {
         printError('Operation failed: Cannot go outside home directory');
         return;
      }
      set('currentDir', newPath);
    } else {
      printError('Operation failed: Not a directory');
    }
  } catch {
    printError('Operation failed: Path does not exist or is inaccessible');
  }
}

export async function listDirectory() {
  const currentDir = get('currentDir');
  try {
    const files = await fs.readdir(currentDir, { withFileTypes: true });
    const entriesPromises = files.map(async (f) => {
        // ... (reszta logiki pobierania statystyk jak w oryginale)
        const entryPath = path.join(currentDir, f.name);
        let stats = null;
        try {
          stats = await fs.lstat(entryPath);
        } catch (statError) {}
        return {
          name: f.name,
          type: stats?.isDirectory() ? 'DIR' : stats?.isFile() ? 'FILE' : 'OTHER',
          size: stats?.isFile() ? stats.size : null
        };
    });
    const entriesWithStats = await Promise.all(entriesPromises);
    const entries = entriesWithStats
        .filter(e => e.type === 'DIR' || e.type === 'FILE')
        .sort((a, b) => {
            if (a.type !== b.type) return a.type === 'DIR' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    printAsciiTable(entries);
  } catch (err) {
    printError();
  }
}
