const process = require("process");
const fs = require("fs");
const readline = require("readline");
const path = require("path");
const Stockfish = require("./stockfish.js");

const UCI_NNUE_FILE = process.env.UCI_NNUE_FILE;
const NNUE_ROOT = process.cwd();

async function runRepl(stockfish) {
  const iface = readline.createInterface({ input: process.stdin });
  for await (const command of iface) {
    if (command == "quit") {
      break;
    }
    stockfish.postMessage(command);
  }
  stockfish.postMessage("quit");
}

async function main(argv) {
  const stockfish = await Stockfish();
  const FS = stockfish.FS;
  if (UCI_NNUE_FILE) {
    const resolvedPath = path.resolve(NNUE_ROOT, UCI_NNUE_FILE);
    if (!resolvedPath.startsWith(NNUE_ROOT + path.sep) && resolvedPath !== NNUE_ROOT) {
      throw new Error("UCI_NNUE_FILE path is outside of allowed root directory");
    }
    const buffer = await fs.promises.readFile(resolvedPath);
    const filename = "/" + UCI_NNUE_FILE.replace(/^.*[\\\/]/, "");
    FS.writeFile(filename, buffer);
    stockfish.postMessage(`setoption name EvalFile value ${filename}`);
  }
  if (argv.length > 0) {
    const commands = argv.join(" ").split("++");
    for (const command of commands) {
      stockfish.postMessage(command);
    }
    stockfish.postMessage("quit");
    return;
  }
  runRepl(stockfish);
}

if (require.main === module) {
  main(process.argv.slice(2));
}
