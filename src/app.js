import readline from "readline";
import process from "process";
import { printWelcome, printCurrentDir, printGoodbye } from "./cli/ui.js";
import { handleCommand } from "./commands/index.js";

export function startApp() {
  printWelcome();
  printCurrentDir();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", async (line) => {
    if (line.trim() === ".exit") {
      rl.close();
      return;
    }
    await handleCommand(line);
    printCurrentDir();
    rl.prompt();
  });

  rl.on("close", () => {
    printGoodbye();
    process.exit(0);
  });

  process.on("SIGINT", () => rl.close());
}
