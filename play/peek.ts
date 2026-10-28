// peek.ts: see what Node does to a .ts file before it runs it.
//
//   node peek.ts cart.ts
//
// Node erases every type and puts blank space where it was (so line and column numbers stay the same).
// This prints the result, with a · for every character that was a type. It uses the same eraser Node uses.
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

process.removeAllListeners("warning"); // stripTypeScriptTypes prints an "experimental" warning; we know.

const file = process.argv[2];
if (!file) {
  console.error("usage: node peek.ts <file.ts>");
  process.exit(1);
}
const code = readFileSync(file, "utf8");
const stripped = stripTypeScriptTypes(code);
let shown = "";
for (let i = 0; i < stripped.length; i++) {
  shown += stripped[i] !== code[i] && stripped[i] === " " ? "·" : stripped[i];
}
// a space inside an erased type (as in  ": number") was erased too: mark it as well
shown = shown.replace(/·( +)(?=·)/g, (_match, spaces: string) => "·".repeat(spaces.length + 1));
process.stdout.write(shown);
