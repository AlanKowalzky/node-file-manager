import { get } from "../state.js";

export function printWelcome() {
  console.log(`Welcome to the File Manager, ${get("username")}!`);
}

export function printCurrentDir() {
  console.log(`You are currently in ${get("currentDir")}`);
}

export function printGoodbye() {
  console.log(`Thank you for using File Manager, ${get("username")}, goodbye!`);
}

export function printError(message = "Operation failed") {
  console.error(message);
}

export function printInvalidInput() {
  console.error("Invalid input");
}

const colors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
};

export function printAsciiTable(entries) {
  if (!entries.length) {
    console.log("Directory is empty.");
    return;
  }

  const maxIndexLen = entries.length.toString().length;

  const hasSize = entries.some((e) => e.size !== undefined && e.size !== null);

  const maxNameLen = Math.max(...entries.map((e) => e.name.length), 4);

  const maxSizeLen = hasSize
    ? Math.max(
        ...entries.map((e) => {
          if (e.size === null || e.size === undefined) return 0;

          if (e.size < 1024 * 1024) {
            const sizeInKb = (e.size / 1024).toFixed(1);
            return `${sizeInKb} KB`.length;
          } else {
            const sizeInMb = (e.size / (1024 * 1024)).toFixed(2);
            return `${sizeInMb} MB`.length;
          }
        }),
        4,
      )
    : 0;

  const header = hasSize
    ? `┌─${"─".repeat(maxIndexLen)}─┬─${"─".repeat(maxNameLen)}─┬──────┬─${"─".repeat(maxSizeLen)}─┐`
    : `┌─${"─".repeat(maxIndexLen)}─┬─${"─".repeat(maxNameLen)}─┬──────┐`;
  const titles = hasSize
    ? `│ ${"#".padEnd(maxIndexLen)} │ ${"Name".padEnd(maxNameLen)} │ Type │ ${"Size".padEnd(maxSizeLen)} │`
    : `│ ${"#".padEnd(maxIndexLen)} │ ${"Name".padEnd(maxNameLen)} │ Type │`;
  const divider = hasSize
    ? `├─${"─".repeat(maxIndexLen)}─┼─${"─".repeat(maxNameLen)}─┼──────┼─${"─".repeat(maxSizeLen)}─┤`
    : `├─${"─".repeat(maxIndexLen)}─┼─${"─".repeat(maxNameLen)}─┼──────┤`;
  const footer = hasSize
    ? `└─${"─".repeat(maxIndexLen)}─┴─${"─".repeat(maxNameLen)}─┴──────┴─${"─".repeat(maxSizeLen)}─┘`
    : `└─${"─".repeat(maxIndexLen)}─┴─${"─".repeat(maxNameLen)}─┴──────┘`;

  console.log(header);
  console.log(titles);
  console.log(divider);
  entries.forEach((e, index) => {
    const indexStr = (index + 1).toString().padStart(maxIndexLen);
    const nameColor = e.type === "DIR" ? colors.blue : colors.reset;
    const typeColor = e.type === "DIR" ? colors.blue : colors.cyan;
    const typeStr = `${typeColor}${e.type.padEnd(4)}${colors.reset}`;

    let sizeStr = "";
    if (hasSize) {
      let sizeContent = "";
      if (e.size !== undefined && e.size !== null) {
        if (e.size < 1024 * 1024) {
          sizeContent = `${(e.size / 1024).toFixed(1)} KB`;
        } else {
          sizeContent = `${(e.size / (1024 * 1024)).toFixed(2)} MB`;
        }
      }
      sizeStr = `${colors.yellow}${sizeContent.padStart(maxSizeLen)}${colors.reset}`;
    }

    let remainingName = e.name;
    let firstLine = true;
    while (remainingName.length > 0 || firstLine) {
      const nameChunk = remainingName.substring(0, maxNameLen);
      remainingName = remainingName.substring(maxNameLen);
      const nameStr = `${nameColor}${nameChunk.padEnd(maxNameLen)}${colors.reset}`;

      const currentLineIndex = firstLine ? indexStr : " ".repeat(maxIndexLen);
      const currentLineType = firstLine ? typeStr : " ".repeat(4);
      const currentLineSize =
        firstLine && hasSize ? sizeStr : hasSize ? " ".repeat(maxSizeLen) : "";

      console.log(
        hasSize
          ? `│ ${currentLineIndex} │ ${nameStr} │ ${currentLineType} │ ${currentLineSize} │`
          : `│ ${currentLineIndex} │ ${nameStr} │ ${currentLineType} │`,
      );

      firstLine = false;
    }
  });
  console.log(footer);
}
