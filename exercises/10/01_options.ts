// Exercise 1: The tsconfig, line by line
//
// course/tsconfig.json is the settings file of tsc, the TypeScript checker. Four of its lines are rules for the way
// you write code. This file breaks each rule once, and tsc says so:
//
//     pnpm check 10
//
//   "module": "nodenext"            an ES module imports a file by its full name: "./lib/units.ts", not "./lib/units"
//   "verbatimModuleSyntax": true    a name that is only a type is imported with the word type:
//                                       import type { Bytes } from "./lib/units.ts";
//   "erasableSyntaxOnly": true      only TypeScript that Node can simply erase. Not allowed: an enum (use a union of
//                                   strings instead), and a parameter property: public name in a constructor's
//                                   parameters (write a normal field, and set it in the constructor).
//   "strict": true                  every parameter needs a type: no implied any
//
// Fix the four. What the program prints stays the same. Node runs the file only when the first two are fixed,
// and the enum too: Node can't erase an enum, so it stops with ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX.
//
// When it's done, it prints:
//
//     dist/index.js 1.2 kB (code)
//     dist/index.d.ts 380 B (types)
//     2 files
//
// Run it:      node exercises/10/01_options.ts
// Check it:    pnpm check 10

import { formatSize, Bytes } from "./lib/units";

enum Kind {
  Code = "code",
  Types = "types",
}

export class PackedFile {
  constructor(public name: string, public size: Bytes, public kind: Kind) {}

  line(): string {
    return `${this.name} ${formatSize(this.size)} (${this.kind})`;
  }
}

export function describe(files) {
  for (const file of files) console.log(file.line());
  console.log(`${files.length} files`);
}

describe([new PackedFile("dist/index.js", 1229, Kind.Code), new PackedFile("dist/index.d.ts", 380, Kind.Types)]);
