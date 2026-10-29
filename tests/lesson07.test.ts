// Checks for lesson 07: Modules and declaration files (ES modules and CommonJS, how Node decides which one,
// .d.ts files, @types, and types for a library that has none: dynafile).
//
// Every test is named after its exercise file. `pnpm check 07` runs tsc on the lesson's files AND these tests:
//   - lines marked  // @ts-expect-error  must be type errors (if one isn't, the checker prints the text after it)
//   - a  // hint:  comment explains the type check on the next line, if that line fails
//   - check(condition, hint) tests what your program does
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// hint: 03_dynafile.d.ts needs  declare module "dynafile" { class DynaFile { ... }  export = DynaFile; }
import DynaFile from "dynafile"; // typed by 03_dynafile.d.ts
import { expectTypeOf, test } from "vitest";
import { check, code, load, run, show, typeChecks } from "./helpers.ts";

const L = "07";

/** No `any`, no `as`, no `require`. */
function honest(file: string) {
  const src = code(L, file);
  check(!/\bany\b/.test(src), "There's still an `any` in your code. Give it a real type.");
  check(!/\bas\s+[A-Za-z{[(]/.test(src), "Don't use `as`: it only tells TypeScript to trust you.");
  check(!/\brequire\s*\(/.test(src), "No require( in an ES module: use  import ... from \"...\"  instead.");
}

/** A new, empty temporary folder. */
const tempFolder = () => mkdtempSync(join(tmpdir(), "bfj-07-"));

test("01_imports.ts", async () => {
  const src = code(L, "01_imports.ts");
  check(!/from\s+"\.\/lib\/money"/.test(src), "Write the full file name in the import:  from \"./lib/money.ts\"");
  check(/import\s+type\s*\{[^}]*\bMoney\b|\{[^}]*\btype\s+Money\b/.test(src),
    "Money is only a type: import it with the word type:  import type { Money } from \"./lib/money.ts\";");
  const { total } = await load(() => import("../exercises/07/01_imports.ts"));
  const sum = total([{ amount: 1.5, currency: "TRY" }, { amount: 2, currency: "TRY" }]);
  check(sum === "3.50 TRY", `total([1.5 TRY, 2 TRY]) should be "3.50 TRY". Got: ${JSON.stringify(sum)}`);
  const out = run(L, "01_imports.ts");
  const expected = "42.50 EUR\n0.00 EUR";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("02_which_module.ts", async () => {
  const { moduleSystem } = await load(() => import("../exercises/07/02_which_module.ts"));
  typeChecks(() => {
    // hint: moduleSystem(file: string, packageType?: "module" | "commonjs")
    expectTypeOf(moduleSystem).parameter(0).toEqualTypeOf<string>();
    // hint: packageType is optional: moduleSystem("index.js") must work too.
    moduleSystem("index.js");
    // @ts-expect-error packageType can only be "module" or "commonjs" (a union of two string literals).
    moduleSystem("index.js", "esm");
  });
  const cases: [string, "module" | "commonjs" | undefined, string][] = [
    ["app.mjs", undefined, "esm"],
    ["app.mjs", "commonjs", "esm"],
    ["app.mts", "commonjs", "esm"],
    ["app.cjs", "module", "commonjs"],
    ["app.cts", "module", "commonjs"],
    ["app.js", "module", "esm"],
    ["app.ts", "module", "esm"],
    ["src/index.js", "commonjs", "commonjs"],
    ["src/index.js", undefined, "commonjs"],
    ["play/peek.ts", undefined, "commonjs"],
  ];
  for (const [file, type, want] of cases) {
    const got = moduleSystem(file, type);
    check(got === want, `moduleSystem(${JSON.stringify(file)}${type ? `, "${type}"` : ""}) should be "${want}". Got: ${JSON.stringify(got)}`);
  }
  const out = run(L, "02_which_module.ts");
  const expected = "exercises/07/01_imports.ts esm\nnode_modules/dynafile/src/index.js commonjs\nscripts/build.mjs esm\nserver.cjs commonjs";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("03_dynafile.d.ts", async () => {
  typeChecks(() => {
    // hint: declare a class DynaFile inside  declare module "dynafile" { ... }, and end with  export = DynaFile;
    const files = new DynaFile("/tmp");
    // hint: the folder is optional:  constructor(projectPath?: string);
    new DynaFile();
    // @ts-expect-error the folder is a string: constructor(projectPath?: string);
    new DynaFile(42);
    // hint: directoryPath is a string.
    expectTypeOf(files.directoryPath).toEqualTypeOf<string>();
    // hint: current(customPath?: string) returns the names in the folder: string[]
    expectTypeOf(files.current()).toEqualTypeOf<string[]>();
    // hint: current takes an optional folder:  current(customPath?: string): string[];
    expectTypeOf(files.current("/tmp")).toEqualTypeOf<string[]>();
    // hint: change(fileName, currentContent, newContent, callback, filePath?) returns nothing: void
    expectTypeOf(files.change("a.txt", "old", "new", () => {})).toEqualTypeOf<void>();
    // hint: change(fileName, currentContent, newContent, callback: (err: Error | null, result?: string) => void, filePath?)
    files.change("a.txt", "old", "new", (err, result) => {
      // hint: change's callback gets (err: Error | null, result?: string)
      expectTypeOf(err).toEqualTypeOf<Error | null>();
      // hint: change's callback gets (err: Error | null, result?: string)
      expectTypeOf(result).toEqualTypeOf<string | undefined>();
    }, "/tmp");
    // @ts-expect-error change needs its callback: the code calls it every time, so it's not optional.
    files.change("a.txt", "old", "new");
    // hint: changeSync returns a Promise<string> (read its source), and its callback is optional.
    expectTypeOf(files.changeSync("a.txt", "old", "new")).toEqualTypeOf<Promise<string>>();
    // @ts-expect-error changeSync returns a Promise<string>, not a string (whatever its name says).
    const done: string = files.changeSync("a.txt", "old", "new");
    // hint: terminal(command: string): Promise<string>
    expectTypeOf(files.terminal).toEqualTypeOf<(command: string) => Promise<string>>();
    // @ts-expect-error terminal(command) takes a string.
    files.terminal(42);
    // hint: envChange(vary: Record<string, string | number>, fileName?: string): void
    expectTypeOf(files.envChange({ PORT: 3000, DB_HOST: "localhost" })).toEqualTypeOf<void>();
    // hint: envChange takes an optional file name:  envChange(vary, fileName?: string): void
    files.envChange({ PORT: 3000 }, "custom.env");
  });
  const src = code(L, "03_dynafile.d.ts");
  check(!/\bany\b/.test(src), "There's still an `any` in 03_dynafile.d.ts. Read the source, and write the real type.");
  check(/export\s*=\s*DynaFile/.test(src), "index.js puts the class on module.exports. Say it in the .d.ts:  export = DynaFile;");

  // your types are only as good as their match with the real package: try the real thing
  const folder = tempFolder();
  writeFileSync(join(folder, "a.txt"), "hello me");
  const files = new DynaFile(folder);
  check(files.directoryPath === folder, "directoryPath should be the folder you gave the constructor.");
  check(JSON.stringify(files.current()) === '["a.txt"]', `current() should list a.txt. Got: ${JSON.stringify(files.current())}`);
  const pending: unknown = files.changeSync("a.txt", "hello me", "hello world");
  check(pending instanceof Promise, "changeSync really returns a Promise.");
  check((await pending) === "File updated successfully.", "changeSync resolves with dynafile's message.");
  check(readFileSync(join(folder, "a.txt"), "utf8") === "hello world", "changeSync should have changed a.txt.");
  check((await files.terminal('node -e "console.log(40 + 2)"')) === "42", "terminal resolves with the command's output.");
});

test("04_fix_me.ts", async () => {
  const src = code(L, "04_fix_me.ts");
  check(!/\brequire\s*\(/.test(src), "require is not defined in an ES module: use  import { readFileSync } from \"node:fs\";");
  check(!/__dirname/.test(src), "__dirname is not defined in an ES module: use  import.meta.dirname");
  check(!/module\.exports/.test(src), "module is not defined in an ES module: export the functions instead.");
  // hint: export read and countLines (module.exports doesn't exist in an ES module)
  const { countLines, read } = await load(() => import("../exercises/07/04_fix_me.ts"));
  check(typeof countLines === "function", "Export countLines:  export function countLines(...)");
  check(typeof read === "function", "Export read:  export function read(...)");
  check(countLines("notes.txt") === 3, `countLines("notes.txt") should be 3. Got: ${countLines("notes.txt")}`);
  check(read("notes.txt").startsWith("import, not require"), "read(\"notes.txt\") should read exercises/07/lib/notes.txt.");
  const out = run(L, "04_fix_me.ts");
  const expected = 'notes.txt: 3 lines\nthe longest: "types vanish at runtime"';
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("05_release.ts", async () => {
  honest("05_release.ts");
  const src = code(L, "05_release.ts");
  check(!/new DynaFile\(\s*\)/.test(src), "Always pass the folder: new DynaFile(folder). Without it, dynafile uses require.main, which ESM doesn't have.");
  const { open, textFiles, bump, nodeVersion } = await load(() => import("../exercises/07/05_release.ts"));
  typeChecks(() => {
    // hint: open(folder: string): DynaFile
    expectTypeOf(open).returns.toEqualTypeOf<DynaFile>();
    // hint: textFiles(files: DynaFile): string[]
    expectTypeOf(textFiles).toEqualTypeOf<(files: DynaFile) => string[]>();
    // hint: bump(files: DynaFile, from: string, to: string): Promise<string>
    expectTypeOf(bump).toEqualTypeOf<(files: DynaFile, from: string, to: string) => Promise<string>>();
    // hint: nodeVersion(files: DynaFile): Promise<string>
    expectTypeOf(nodeVersion).toEqualTypeOf<(files: DynaFile) => Promise<string>>();
  });
  const folder = tempFolder();
  writeFileSync(join(folder, "version.txt"), "2.0.0");
  writeFileSync(join(folder, "notes.md"), "not a text file");
  const files = open(folder);
  check(files.directoryPath === folder, "open(folder) should make a DynaFile for that folder: new DynaFile(folder)");
  const names = textFiles(files);
  check(JSON.stringify(names) === '["version.txt"]', `textFiles should list only the .txt files. Got: ${JSON.stringify(names)}`);
  const message = await bump(files, "2.0.0", "2.1.0");
  check(readFileSync(join(folder, "version.txt"), "utf8") === "2.1.0",
    "After await bump(files, \"2.0.0\", \"2.1.0\"), version.txt should say 2.1.0. Did you await changeSync?");
  check(message === "File updated successfully.", `bump should return what changeSync resolves with. Got: ${JSON.stringify(message)}`);
  const version = await nodeVersion(files);
  check(/^v\d+\.\d+\.\d+$/.test(version), `nodeVersion should be the output of  node --version, like "v24.11.0". Got: ${JSON.stringify(version)}`);
  const out = run(L, "05_release.ts");
  const expected = "[ 'version.txt' ]\nFile updated successfully.\n1.1.0\nv…";
  const lines = out.split("\n");
  check(lines.length === 4 && lines.slice(0, 3).join("\n") === expected.slice(0, -3) && /^v\d+\.\d+\.\d+$/.test(lines[3]),
    `Expected:\n${expected}\nGot:\n${show(out)}`);
});
