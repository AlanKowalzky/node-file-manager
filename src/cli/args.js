import process from "process";

export function getUsername() {
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith("--username=")) {
      const name = arg.split("=")[1];
      return name.trim() ? name.trim() : "Anonymous";
    }
  }
  return "Anonymous";
}
