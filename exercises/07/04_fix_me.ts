// Exercise 4: Fix me
//
// This file was copied from an old CommonJS project into this course, where every .ts file is an ES module
// ("type": "module" in package.json). There are 4 mistakes, and tsc finds only 1 of them:
//
//     pnpm check 07
//
// The other 3 hide from tsc: @types/node declares require, __dirname and module for every file (some files in a
// project could be CommonJS). Node finds them, one crash at a time. Read the last line of each error first:
//
//     node exercises/07/04_fix_me.ts
//
// In an ES module:
//     require("x")          ->  import ... from "x"
//     __dirname             ->  import.meta.dirname
//     module.exports = ...  ->  export
//
// When it's fixed, it prints:
//
//     notes.txt: 3 lines
//     the longest: "types vanish at runtime"
//
// Run it:      node exercises/07/04_fix_me.ts
// Check it:    pnpm check 07

import { longest } from "./lib/lines";
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

function read(file: string): string {
  return readFileSync(join(__dirname, "lib", file), "utf8");
}

function countLines(file: string): number {
  return read(file).trim().split("\n").length;
}

console.log(`notes.txt: ${countLines("notes.txt")} lines`);
console.log(`the longest: "${longest(read("notes.txt"))}"`);

module.exports = { read, countLines };
