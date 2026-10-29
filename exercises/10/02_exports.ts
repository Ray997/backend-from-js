// Exercise 2: Which file does a user get?
//
// When someone writes  import { countBy } from "@your-name/pulse",  the package's package.json says which of its
// files they get. The modern field for that is "exports". Node reads it like this (for the package's main entry):
//
//   "exports" is a string                  -> that file, for everyone
//   "exports" is an object of conditions   -> go through its keys IN THEIR ORDER. The first key that is one of the
//                                             user's conditions, or "default", wins: its file is the answer.
//                                             No key fits -> undefined (Node stops with ERR_PACKAGE_PATH_NOT_EXPORTED)
//   no "exports" at all                    -> "main", or "index.js" when there's no "main" either
//
// The conditions of a user:   an ES module (import)                       ["import", "node"]
//                             CommonJS (require)                          ["require", "node"]
//                             TypeScript (nodenext), for an ES module     ["types", "import", "node"]
//
// That's why "types" comes first in an exports object, and "default" last: a key after "default" is never reached.
//
// 1. Give entry's parameters their types: pkg is a PackageJson, conditions is an array of strings.
// 2. Write the rules above.
//    Object.entries(obj) gives an object's [key, value] pairs, in the object's order.
//    typeof pkg.exports === "string" narrows it (lesson 02).
//
// When it's done, it prints:
//
//     ./dist/index.d.ts ./dist/index.js
//     ./index.cjs ./index.cjs
//     ./src/index.js index.js
//     undefined
//
// Run it:      node exercises/10/02_exports.ts
// Check it:    pnpm check 10

export type Conditions = { [condition: string]: string };
export type PackageJson = { name: string; main?: string; exports?: string | Conditions };

export const TYPESCRIPT = ["types", "import", "node"];
export const IMPORT = ["import", "node"];
export const REQUIRE = ["require", "node"];

export function entry(pkg, conditions): string | undefined {
  return undefined; // TODO
}

const pulse: PackageJson = {
  name: "@your-name/pulse",
  exports: { types: "./dist/index.d.ts", default: "./dist/index.js" },
};
// "default" first: everything after it is never reached
const backwards: PackageJson = { name: "backwards", exports: { default: "./index.cjs", import: "./index.js" } };
const old: PackageJson = { name: "old", main: "./src/index.js" };
const older: PackageJson = { name: "older" };
const cjsOnly: PackageJson = { name: "cjs-only", exports: { require: "./index.cjs" } };

console.log(entry(pulse, TYPESCRIPT), entry(pulse, IMPORT));
console.log(entry(backwards, IMPORT), entry(backwards, REQUIRE));
console.log(entry(old, IMPORT), entry(older, IMPORT));
console.log(entry(cjsOnly, IMPORT));
