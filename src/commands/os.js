import os from "os";
import { printError } from "../cli/ui.js";

export async function handleOsCommand(args) {
  const flag = args[0];
  if (!flag) {
    return printError("Invalid input: Missing OS flag (e.g., --EOL, --cpus)");
  }

  try {
    switch (flag) {
      case "--EOL":
        console.log("Default End-Of-Line:", JSON.stringify(os.EOL));
        break;
      case "--cpus":
        const cpus = os.cpus();
        console.log(`Overall amount of CPUs: ${cpus.length}`);
        cpus.forEach((cpu, index) => {
          console.log(
            `CPU ${index + 1}: Model: ${cpu.model.trim()}, Clock rate: ${cpu.speed / 1000} GHz`,
          );
        });
        break;
      case "--homedir":
        console.log("Home directory:", os.homedir());
        break;
      case "--username":
        console.log("System username:", os.userInfo().username);
        break;
      case "--architecture":
        console.log("CPU Architecture:", os.arch());
        break;
      default:
        printError("Invalid input: Unknown OS flag");
    }
  } catch (err) {
    printError();
  }
}
