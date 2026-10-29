// Exercise 5: Use your types
//
// Do exercise 3 first: this file uses dynafile, with the types you wrote in 03_dynafile.d.ts.
//
// A tiny release script. It works in a new temporary folder that holds one file: version.txt, with "1.0.0" in it.
//
// 1. open(folder): a new DynaFile for that folder. In an ES module, ALWAYS pass the folder. Without one, dynafile
//    falls back to require.main, which only exists when a program starts as CommonJS: here, it crashes.
// 2. textFiles(files): the names in the folder that end in ".txt" (current(), then filter).
// 3. bump(files, from, to): replaces from with to in version.txt, and waits until the file is written.
//    Use changeSync: despite its name, it returns a Promise. Return what it resolves with (dynafile's message).
// 4. nodeVersion(files): the output of the shell command  node --version  (terminal).
// Give every parameter and every function's result a type. DynaFile is also the type of its objects:
//     function open(folder: string): DynaFile
//
// When it's done, it prints (the last line is your Node version):
//
//     [ 'version.txt' ]
//     File updated successfully.
//     1.1.0
//     v26.12.1
//
// Rules: no `any`, no `as`, no require.
//
// Run it:      node exercises/07/05_release.ts
// Check it:    pnpm check 07

import DynaFile from "dynafile";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function open(folder: string): DynaFile {
  return new DynaFile(); // TODO: the folder
}

export function textFiles(files) {
  // TODO
}

export async function bump(files, from, to) {
  // TODO
}

export function nodeVersion(files) {
  // TODO
}

const folder = mkdtempSync(join(tmpdir(), "release-"));
writeFileSync(join(folder, "version.txt"), "1.0.0");
const files = open(folder);
console.log(textFiles(files));
console.log(await bump(files, "1.0.0", "1.1.0"));
console.log(readFileSync(join(folder, "version.txt"), "utf8"));
console.log(await nodeVersion(files));
