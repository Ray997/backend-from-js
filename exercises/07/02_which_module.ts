// Exercise 2: ES module or CommonJS?
//
// Node decides, for every file, which module system it uses:
//
//     .mjs  .mts        always an ES module                       -> "esm"
//     .cjs  .cts        always CommonJS                           -> "commonjs"
//     .js   .ts         the "type" field of the nearest package.json:
//                           "module"                              -> "esm"
//                           "commonjs", or no "type" at all       -> "commonjs"
//
// 1. Give moduleSystem's parameters their types. file is a string. packageType is optional, and it can only be
//    "module" or "commonjs" (a union of two string literals, like in lesson 02). The return type is already there.
// 2. Write the rules above. (file.endsWith(".mjs") is true when the name ends in .mjs.)
//
// When it's done, it prints:
//
//     exercises/07/01_imports.ts esm
//     node_modules/dynafile/src/index.js commonjs
//     scripts/build.mjs esm
//     server.cjs commonjs
//
// Run it:      node exercises/07/02_which_module.ts
// Check it:    pnpm check 07

export type System = "esm" | "commonjs";

export function moduleSystem(file, packageType): System {
  return "esm"; // TODO
}

// this course's package.json says "type": "module"; dynafile's package.json has no "type"
console.log("exercises/07/01_imports.ts", moduleSystem("exercises/07/01_imports.ts", "module"));
console.log("node_modules/dynafile/src/index.js", moduleSystem("node_modules/dynafile/src/index.js"));
console.log("scripts/build.mjs", moduleSystem("scripts/build.mjs"));
console.log("server.cjs", moduleSystem("server.cjs", "module"));
