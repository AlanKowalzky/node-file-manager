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

// Funkcja do rysowania tabeli ASCII (przeniesiona z index.js)
export function printAsciiTable(entries) {
  if (!entries.length) {
    console.log('Directory is empty.');
    return;
  }

  const hasSize = entries.some(e => e.size !== undefined && e.size !== null);
  const maxNameLen = Math.max(...entries.map(e => e.name.length), 4);
  const maxSizeLen = hasSize ? Math.max(...entries.map(e => (e.size?.toString().length || 0)), 4) : 0;

  const header = hasSize ? `┌──────┬─${'─'.repeat(maxSizeLen)}─┬─${'─'.repeat(maxNameLen)}─┐` : `┌──────┬─${'─'.repeat(maxNameLen)}─┐`;
  const titles = hasSize ? `│ Type │ Size${' '.repeat(maxSizeLen - 4)} │ Name${' '.repeat(maxNameLen - 4)} │` : `│ Type │ Name${' '.repeat(maxNameLen - 4)} │`;
  const divider = hasSize ? `├──────┼─${'─'.repeat(maxSizeLen)}─┼─${'─'.repeat(maxNameLen)}─┤` : `├──────┼─${'─'.repeat(maxNameLen)}─┤`;
  const footer = hasSize ? `└──────┴─${'─'.repeat(maxSizeLen)}─┴─${'─'.repeat(maxNameLen)}─┘` : `└──────┴─${'─'.repeat(maxNameLen)}─┘`;

  console.log(header);
  console.log(titles);
  console.log(divider);
  entries.forEach(e => {
    const paddedName = e.name.padEnd(maxNameLen);
    const paddedType = e.type.padEnd(4);
    const sizeStr = hasSize ? (e.size !== undefined && e.size !== null ? e.size.toString().padStart(maxSizeLen) : ''.padStart(maxSizeLen)) : '';
    console.log(hasSize ? `│ ${paddedType} │ ${sizeStr} │ ${paddedName} │` : `│ ${paddedType} │ ${paddedName} │`);
  });
  console.log(footer);
}
