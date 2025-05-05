import { get } from '../state.js';

export function printWelcome() {
  console.log(`Welcome to the File Manager, ${get('username')}!`);
}

export function printCurrentDir() {
  console.log(`You are currently in ${get('currentDir')}`);
}

export function printGoodbye() {
  console.log(`Thank you for using File Manager, ${get('username')}, goodbye!`);
}

export function printError(message = 'Operation failed') {
  console.error(message); // Use console.error for errors
}

export function printInvalidInput() {
  console.error('Invalid input');
}

// ANSI Color Codes
const colors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m", // For directories
  cyan: "\x1b[36m", // For type column
  yellow: "\x1b[33m", // For size column
};

// Funkcja do rysowania tabeli ASCII (przeniesiona z index.js)
export function printAsciiTable(entries) {
  if (!entries.length) {
    console.log('Directory is empty.');
    return;
  }

  // Calculate max width for line numbers
  const maxIndexLen = entries.length.toString().length;

  // Sprawdź, czy jakikolwiek wpis ma rozmiar (czy to nie tylko katalogi)
  const hasSize = entries.some(e => e.size !== undefined && e.size !== null);
  // Oblicz maksymalne długości dla nazw i rozmiarów (minimum 4 znaki dla nagłówków)
  const maxNameLen = Math.max(...entries.map(e => e.name.length), 4);
  // Calculate max size length considering " KB" suffix and potential decimal point
  const maxSizeLen = hasSize
    ? Math.max(...entries.map(e => {
        if (e.size === null || e.size === undefined) return 0;
        // Decide unit based on size
        if (e.size < 1024 * 1024) { // Less than 1 MB
            const sizeInKb = (e.size / 1024).toFixed(1);
            return `${sizeInKb} KB`.length;
        } else { // 1 MB or more
            const sizeInMb = (e.size / (1024 * 1024)).toFixed(2);
            return `${sizeInMb} MB`.length;
        }
      }), 4) // Minimum 4 for "Size" header
    : 0;

  // Zbuduj linie tabeli
  const header = hasSize
    ? `┌─${'─'.repeat(maxIndexLen)}─┬─${'─'.repeat(maxNameLen)}─┬──────┬─${'─'.repeat(maxSizeLen)}─┐` // # | Name | Type | Size
    : `┌─${'─'.repeat(maxIndexLen)}─┬─${'─'.repeat(maxNameLen)}─┬──────┐`; // # | Name | Type
  const titles = hasSize
    ? `│ ${'#'.padEnd(maxIndexLen)} │ ${'Name'.padEnd(maxNameLen)} │ Type │ ${'Size'.padEnd(maxSizeLen)} │`
    : `│ ${'#'.padEnd(maxIndexLen)} │ ${'Name'.padEnd(maxNameLen)} │ Type │`;
  const divider = hasSize
    ? `├─${'─'.repeat(maxIndexLen)}─┼─${'─'.repeat(maxNameLen)}─┼──────┼─${'─'.repeat(maxSizeLen)}─┤`
    : `├─${'─'.repeat(maxIndexLen)}─┼─${'─'.repeat(maxNameLen)}─┼──────┤`;
  const footer = hasSize
    ? `└─${'─'.repeat(maxIndexLen)}─┴─${'─'.repeat(maxNameLen)}─┴──────┴─${'─'.repeat(maxSizeLen)}─┘`
    : `└─${'─'.repeat(maxIndexLen)}─┴─${'─'.repeat(maxNameLen)}─┴──────┘`;

  console.log(header);
  console.log(titles);
  console.log(divider);
  entries.forEach((e, index) => {
    // --- Prepare static parts ---
    const indexStr = (index + 1).toString().padStart(maxIndexLen);
    const nameColor = e.type === 'DIR' ? colors.blue : colors.reset; // Blue for DIR names, reset (default) for FILE names
    const typeColor = e.type === 'DIR' ? colors.blue : colors.cyan; // Blue for DIR type, Cyan for FILE type
    const typeStr = `${typeColor}${e.type.padEnd(4)}${colors.reset}`; // Color for Type based on type

    let sizeStr = '';
    if (hasSize) {
        let sizeContent = '';
        if (e.size !== undefined && e.size !== null) {
            if (e.size < 1024 * 1024) { // Less than 1 MB -> KB
                sizeContent = `${(e.size / 1024).toFixed(1)} KB`;
            } else { // 1 MB or more -> MB
                sizeContent = `${(e.size / (1024 * 1024)).toFixed(2)} MB`;
            }
        }
        sizeStr = `${colors.yellow}${sizeContent.padStart(maxSizeLen)}${colors.reset}`; // Pad the MB content first, then add color
    }

    // --- Handle Name Wrapping ---
    let remainingName = e.name;
    let firstLine = true;
    while (remainingName.length > 0 || firstLine) {
        const nameChunk = remainingName.substring(0, maxNameLen);
        remainingName = remainingName.substring(maxNameLen);
        const nameStr = `${nameColor}${nameChunk.padEnd(maxNameLen)}${colors.reset}`;

        const currentLineIndex = firstLine ? indexStr : ' '.repeat(maxIndexLen);
        const currentLineType = firstLine ? typeStr : ' '.repeat(4); // Assuming type column width is 4
        const currentLineSize = firstLine && hasSize ? sizeStr : (hasSize ? ' '.repeat(maxSizeLen) : '');

        console.log(hasSize
            ? `│ ${currentLineIndex} │ ${nameStr} │ ${currentLineType} │ ${currentLineSize} │` // # | Name | Type | Size
            : `│ ${currentLineIndex} │ ${nameStr} │ ${currentLineType} │`); // # | Name | Type

        firstLine = false;
    }
  });
  console.log(footer);
}
