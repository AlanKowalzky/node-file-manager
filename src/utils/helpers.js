import { printError } from '../cli/ui.js';

// Helper function to parse arguments, respecting quotes
export function parseArgsWithQuotes(args, expectedCount, errorMsg) {
    const combinedArgs = args.join(' ');
    const parts = combinedArgs.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

    if (parts.length !== expectedCount) {
        printError(errorMsg);
        return null; // Indicate failure
    }

    // Remove quotes from each part
    const cleanedParts = parts.map(part => part.replace(/['"]/g, ''));

    // Check if any part became empty after removing quotes
    if (cleanedParts.some(part => !part)) {
         printError(errorMsg);
         return null;
    }

    return cleanedParts;    
}