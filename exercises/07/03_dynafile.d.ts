// Exercise 3 (project): Types for a library that has none
//
// dynafile is a small npm package, written in plain JavaScript (CommonJS), with no types at all. This lesson added
// it to the course: if node_modules/dynafile is missing, run  pnpm install  in the course folder first.
//
// Without types, `import DynaFile from "dynafile"` is an error (TS7016), and everything from it would be `any`.
// This file gives it types. It's a declaration file (.d.ts): types only, no code. `declare module "dynafile"`
// means: when someone imports "dynafile", this is what they get.
//
// Read the real source first, not the README: node_modules/dynafile/src/index.js and src/classes/*.js.
// Then write what the code really does, inside the block below:
//
// 1. A class DynaFile (index.js calls it Directory; inside your types, the name is up to you). Methods in a
//    declaration file have no body, only their parameters and return type:  current(customPath?: string): string[];
//    - constructor(projectPath?)   the folder to work in (optional)
//    - directoryPath               the folder, a string
//    - current(customPath?)        the names in a folder (fs.readdirSync)
//    - change(fileName, currentContent, newContent, callback, filePath?)
//                                  replaces text in a file. When it's done, or when it fails, it calls
//                                  callback(err, result): err is an Error or null, result a string. change calls
//                                  the callback every time, so it's NOT optional. change itself returns nothing.
//    - changeSync(fileName, currentContent, newContent, callback?, filePath?)
//                                  the same, but the callback is optional. Read what it returns: not what its
//                                  name promises.
//    - terminal(command)           runs a shell command; read what it resolves with
//    - envChange(vary, fileName?)  writes keys and values into a .env file. vary: an object with string keys, and
//                                  values that are strings or numbers. It returns nothing.
// 2. The class is what index.js puts on module.exports. A declaration file says that with:  export = DynaFile;
//
// Tip: name the callback's type once, inside the block:  type Callback = (err: Error | null, result?: string) => void;
//
// Rules: no `any`.
//
// Check it:    pnpm check 07   (it also tests your types against the real package)

declare module "dynafile" {
  // TODO
}
