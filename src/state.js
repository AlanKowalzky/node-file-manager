import os from "os";
import { getUsername } from "./cli/args.js";

const state = {
  username: getUsername(),
  homeDir: os.homedir(),
  currentDir: os.homedir(),
};

export const get = (key) => state[key];

export const set = (key, value) => {
  if (key === "currentDir") {
    state.currentDir = value;
  }
};
