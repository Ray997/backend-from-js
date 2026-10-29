// Checks for lesson 10: tsconfig line by line, strict mode, building with tsc (dist/, .d.ts files), a typed package
// (package.json: name, version, type, exports, files), npm pack, and reading a library's types.
//
// Every test is named after its exercise file. `pnpm check 10` runs tsc on the lesson's files AND these tests:
//   - lines marked  // @ts-expect-error  must be type errors (if one isn't, the checker prints the text after it)
//   - a  // hint:  comment explains the type check on the next line, if that line fails
//   - check(condition, hint) tests what your program does
// The pulse test builds exercises/10/pulse with tsc and runs  npm pack --dry-run  there (on your machine, no account).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expectTypeOf, test } from "vitest";
import { z } from "zod";
import type { PackedFile } from "../exercises/10/01_options.ts";
import type { PackageJson } from "../exercises/10/02_exports.ts";
import type { A1, A2, A3, A4, A5, OrderSchema } from "../exercises/10/03_read_types.ts";
// hint: pulse/src/index.ts must export the type PulseEvent:  export type { CreateEvent, PulseEvent } from "./events.ts";
import type { PulseEvent } from "../exercises/10/pulse/src/index.ts"; // 05_pulse.ts
import { check, code, load, run, show, typeChecks } from "./helpers.ts";

const L = "10";
const PULSE = fileURLToPath(new URL("../exercises/10/pulse/", import.meta.url));

/** No `any`, no `as`. */
function honest(file: string) {
  const src = code(L, file);
  check(!/\bany\b/.test(src), "There's still an `any` in your code. Give it a real type.");
  check(!/\bas\s+[A-Za-z{[(]/.test(src), "Don't use `as`: it only tells TypeScript to trust you.");
}

/** The source of a file in exercises/10/pulse/, without its comments. */
function pulseCode(file: string): string {
  return readFileSync(join(PULSE, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

/** Run tsc (the course's TypeScript) with these arguments; its output, and whether it found no errors. */
function tsc(args: string[]): { ok: boolean; out: string } {
  const require = createRequire(import.meta.url);
  const manifest = require.resolve("typescript/package.json");
  const bin = join(dirname(manifest), JSON.parse(readFileSync(manifest, "utf8")).bin.tsc);
  const done = spawnSync(process.execPath, [bin, ...args, "--pretty", "false"], { encoding: "utf8", timeout: 60_000 });
  return { ok: done.status === 0, out: `${done.stdout}${done.stderr}`.trim() };
}

test("01_options.ts", async () => {
  const src = code(L, "01_options.ts");
  check(/from\s+"\.\/lib\/units\.ts"/.test(src) && !/from\s+"\.\/lib\/units"/.test(src),
    "module: nodenext: write the full file name in the import:  from \"./lib/units.ts\"");
  check(/import\s+type\s*\{[^}]*\bBytes\b|\{[^}]*\btype\s+Bytes\b/.test(src),
    "verbatimModuleSyntax: Bytes is only a type, import it with the word type:  import type { Bytes } from \"./lib/units.ts\";");
  check(!/\benum\b/.test(src), "erasableSyntaxOnly: no enum. Use a union of strings:  type Kind = \"code\" | \"types\";");
  check(!/constructor\s*\([^)]*\b(public|private|protected|readonly)\s/.test(src),
    "erasableSyntaxOnly: no public/private in the constructor's parameters. Write the fields, and set them with this.name = name.");
  const { describe } = await load(() => import("../exercises/10/01_options.ts"));
  typeChecks(() => {
    // hint: describe(files: PackedFile[]): every parameter needs a type (strict: no implied any)
    expectTypeOf(describe).parameter(0).toEqualTypeOf<PackedFile[]>();
  });
  const out = run(L, "01_options.ts");
  const expected = "dist/index.js 1.2 kB (code)\ndist/index.d.ts 380 B (types)\n2 files";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("02_exports.ts", async () => {
  const { entry, IMPORT, REQUIRE, TYPESCRIPT } = await load(() => import("../exercises/10/02_exports.ts"));
  typeChecks(() => {
    // hint: entry(pkg: PackageJson, conditions: string[]): string | undefined
    expectTypeOf(entry).toEqualTypeOf<(pkg: PackageJson, conditions: string[]) => string | undefined>();
  });
  const pulse: PackageJson = { name: "pulse", exports: { types: "./dist/index.d.ts", default: "./dist/index.js" } };
  const dual: PackageJson = { name: "dual", exports: { types: "./index.d.ts", import: "./index.js", require: "./index.cjs" } };
  const cases: [string, PackageJson, string[], string | undefined, string][] = [
    ["pulse, for TypeScript", pulse, TYPESCRIPT, "./dist/index.d.ts", "the first key that fits wins: types"],
    ["pulse, for an import", pulse, IMPORT, "./dist/index.js", "types isn't one of an import's conditions; default always fits"],
    ["dual, for an import", dual, IMPORT, "./index.js", "go through the keys in order"],
    ["dual, for require", dual, REQUIRE, "./index.cjs", "go through the keys in order"],
    ["dual, for TypeScript", dual, TYPESCRIPT, "./index.d.ts", "types comes first"],
    ["a string", { name: "s", exports: "./main.js" }, IMPORT, "./main.js", "a string: that file, for everyone"],
    ["backwards", { name: "b", exports: { default: "./index.cjs", import: "./index.js" } }, IMPORT, "./index.cjs",
      "default fits every user, so a key after it is never reached"],
    ["no exports", { name: "old", main: "./src/index.js" }, IMPORT, "./src/index.js", "no exports: main"],
    ["nothing", { name: "older" }, REQUIRE, "index.js", "no exports and no main: index.js"],
    ["require only", { name: "c", exports: { require: "./index.cjs" } }, IMPORT, undefined, "no key fits: undefined"],
  ];
  for (const [what, pkg, conditions, want, why] of cases) {
    const got = entry(pkg, conditions);
    check(got === want, `entry(${what}, ${JSON.stringify(conditions)}) should be ${JSON.stringify(want)} (${why}). Got: ${JSON.stringify(got)}`);
  }
  const out = run(L, "02_exports.ts");
  const expected = "./dist/index.d.ts ./dist/index.js\n./index.cjs ./index.cjs\n./src/index.js index.js\nundefined";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("03_read_types.ts", async () => {
  await load(() => import("../exercises/10/03_read_types.ts"));
  typeChecks(() => {
    // hint: A1: typeof OrderSchema fits { _zod: { output } }: the answer is that output, a plain object type
    expectTypeOf<A1>().toEqualTypeOf<z.output<typeof OrderSchema>>();
    // hint: A2: string doesn't fit { _zod: ... }: the answer is the part after the :
    expectTypeOf<A2>().toEqualTypeOf<unknown>();
    // hint: A3: "id/edit" fits the pattern: P is the text before the slash
    expectTypeOf<A3>().toEqualTypeOf<"id">();
    // hint: A4: "id" has no slash, so it doesn't fit: the answer is S itself
    expectTypeOf<A4>().toEqualTypeOf<"id">();
    // hint: A5: the same keys and types, each one optional (?)
    expectTypeOf<A5>().toEqualTypeOf<{ sku?: string; qty?: number }>();
  });
  const src = code(L, "03_read_types.ts");
  for (const name of ["A1", "A2", "A3", "A4", "A5"]) {
    const answer = src.match(new RegExp(`type\\s+${name}\\s*=\\s*([^;]*);`))?.[1] ?? "";
    check(!/\b(output|RemoveTail|MyPartial|z)\s*[<.]|\btypeof\b|\bnever\b/.test(answer),
      `Write ${name} as a plain type (string, number, unknown, "id", { ... }). Got: ${answer.trim() || "(nothing)"}`);
  }
});

test("04_fix_me.ts", async () => {
  honest("04_fix_me.ts");
  check(!/[\w)\]]!\s*[.[(;,)]/.test(code(L, "04_fix_me.ts")),
    "No ! after a name (found!.path): it only tells tsc to trust you. Check with if (!found) throw ...");
  const { events, revenue, pathOf } = await load(() => import("../exercises/10/04_fix_me.ts"));
  typeChecks(() => {
    // hint: revenue(list: PulseEvent[]): give list its type
    expectTypeOf(revenue).parameter(0).toEqualTypeOf<typeof events>();
  });
  check(revenue(events) === 49, `revenue(events) should be 49 (a click has no amount: count it as 0, with ??). Got: ${revenue(events)}`);
  check(revenue([]) === 0, `revenue([]) should be 0. Got: ${revenue([])}`);
  check(pathOf("e1") === "/pricing", `pathOf("e1") should be "/pricing". Got: ${JSON.stringify(pathOf("e1"))}`);
  let thrown: unknown;
  try {
    pathOf("e9");
  } catch (error) {
    thrown = error;
  }
  check(thrown instanceof Error && thrown.message === "no event e9",
    `pathOf("e9") should throw new Error("no event e9"). Got: ${thrown instanceof Error ? thrown.message : String(thrown)}`);
  const out = run(L, "04_fix_me.ts");
  const expected = "revenue: 49\nfailed: no event e9";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
}, 30_000);

test("05_pulse.ts", async () => {
  honest("05_pulse.ts");
  for (const file of ["src/stats.ts", "src/index.ts"]) {
    const src = pulseCode(file);
    check(!/\bany\b/.test(src) && !/\bas\s+[A-Za-z{[(]/.test(src), `pulse/${file}: no \`any\`, no \`as\`.`);
  }
  // hint: pulse/src/index.ts must export countBy and revenue:  export { countBy, revenue } from "./stats.ts";
  const { countBy, revenue } = await load(() => import("../exercises/10/pulse/src/index.ts"));
  check(typeof countBy === "function" && typeof revenue === "function",
    "pulse/src/index.ts should export countBy and revenue (step 2), and src/stats.ts should define them (step 1).");
  typeChecks(() => {
    const events: PulseEvent[] = [];
    // hint: countBy<K extends keyof PulseEvent>(events: PulseEvent[], key: K): Map<PulseEvent[K], number>
    expectTypeOf(countBy(events, "type")).toEqualTypeOf<Map<"pageview" | "click" | "signup" | "purchase", number>>();
    // @ts-expect-error countBy's key must be a key of PulseEvent: K extends keyof PulseEvent
    countBy(events, "nope");
    // hint: revenue(events: PulseEvent[]): number
    expectTypeOf(revenue).toEqualTypeOf<(events: PulseEvent[]) => number>();
  });
  const sample: PulseEvent[] = [
    { id: "e1", type: "click", path: "/a", userId: "u1" },
    { id: "e2", type: "click", path: "/b", userId: "u2" },
    { id: "e3", type: "purchase", path: "/c", userId: "u2", amount: 49 },
    { id: "e4", type: "purchase", path: "/c", userId: "u3", amount: 1 },
  ];
  const byType = countBy(sample, "type");
  check(byType instanceof Map && byType.get("click") === 2 && byType.get("purchase") === 2 && byType.size === 2,
    `countBy(events, "type") should be a Map: click => 2, purchase => 2. Got: ${byType instanceof Map ? JSON.stringify([...byType]) : String(byType)}`);
  check(countBy(sample, "userId").get("u2") === 2, 'countBy(events, "userId") should count u2 twice.');
  check(revenue(sample) === 50, `revenue(events) should add up every amount (49 + 1 = 50; no amount counts as 0). Got: ${revenue(sample)}`);

  // package.json
  const pkg = JSON.parse(readFileSync(join(PULSE, "package.json"), "utf8"));
  check(/^@[a-z0-9][a-z0-9._-]*\/pulse$/.test(pkg.name ?? ""),
    `package.json: "name" should be your scope and pulse, like "@your-name/pulse" ("pulse" alone is taken on npm). Got: ${JSON.stringify(pkg.name)}`);
  check(pkg.version === "0.1.0", `package.json: "version" should be "0.1.0". Got: ${JSON.stringify(pkg.version)}`);
  check(pkg.private === undefined, 'package.json: remove "private": true (npm refuses to publish a private package).');
  check(pkg.type === "module", 'package.json: keep "type": "module" (dist/ is ES modules).');
  const dot = pkg.exports?.["."];
  check(typeof dot === "object" && dot !== null,
    'package.json: "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } }');
  check(Object.keys(dot)[0] === "types" && dot.types === "./dist/index.d.ts",
    'package.json: the first key in exports["."] should be "types": "./dist/index.d.ts" (the first key that fits wins).');
  check(dot.default === "./dist/index.js" || dot.import === "./dist/index.js",
    'package.json: exports["."] should send everyone else to "./dist/index.js" ("default": "./dist/index.js").');
  check(Array.isArray(pkg.files) && pkg.files.includes("dist") && !pkg.files.some((f: string) => f.startsWith("src")),
    'package.json: "files": ["dist"] (only the built files go into the package).');
  check(typeof pkg.dependencies?.zod === "string", 'package.json: "dependencies": { "zod": "^4.6.7" } (dist/ imports zod, so users need it).');
  check(pkg.dependencies?.typescript === undefined, 'package.json: typescript belongs in "devDependencies": only you need tsc, not the users.');
  check(pkg.publishConfig?.access === "public", 'package.json: "publishConfig": { "access": "public" } (a scoped package is private on npm unless you say so).');
  check(typeof pkg.scripts?.build === "string" && /\btsc\b/.test(pkg.scripts.build), 'package.json: "scripts": { "build": "tsc", ... }');

  // the build
  rmSync(join(PULSE, "dist"), { recursive: true, force: true });
  const built = tsc(["-p", PULSE]);
  check(built.ok, `tsc -p exercises/10/pulse found errors:\n${built.out.split("\n").slice(0, 2).join("\n")}`);
  check(existsSync(join(PULSE, "dist/index.js")),
    'npx tsc in pulse wrote no dist/index.js. In pulse/tsconfig.json: remove "noEmit", add "rootDir": "src" and "outDir": "dist".');
  check(existsSync(join(PULSE, "dist/index.d.ts")) && existsSync(join(PULSE, "dist/stats.d.ts")),
    'No .d.ts files in dist/: add "declaration": true to pulse/tsconfig.json.');
  check(readFileSync(join(PULSE, "dist/index.js"), "utf8").includes('"./stats.js"'),
    'dist/index.js still imports "./stats.ts", a file the package doesn\'t have. Add "rewriteRelativeImportExtensions": true.');
  check(/export declare function countBy/.test(readFileSync(join(PULSE, "dist/stats.d.ts"), "utf8")),
    "dist/stats.d.ts should describe countBy:  export declare function countBy...");
  const lib = await load(() => import(`${pathToFileURL(join(PULSE, "dist/index.js")).href}?t=${Date.now()}`));
  check(lib.revenue(sample) === 50, "The built dist/index.js should work like the source: revenue(events) = 50.");

  // npm pack --dry-run: what would be uploaded
  const pack = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"],
    { cwd: PULSE, encoding: "utf8", timeout: 60_000, shell: process.platform === "win32" });
  check(pack.status === 0, `npm pack --dry-run failed: ${(pack.stderr || pack.stdout || "").trim().split("\n").slice(-1)[0]}`);
  const files: string[] = JSON.parse(pack.stdout)[0].files.map((f: { path: string }) => f.path).sort();
  check(files.includes("dist/index.d.ts") && files.includes("dist/index.js") && files.includes("package.json"),
    `npm pack --dry-run should list dist/index.js, dist/index.d.ts and package.json. Got: ${files.join(", ")}`);
  const extra = files.filter((f) => !f.startsWith("dist/") && f !== "package.json" && !/^readme/i.test(f) && !/^licen[cs]e/i.test(f));
  check(extra.length === 0, `Only dist/, package.json and README.md belong in the package. Also packed: ${extra.join(", ")}  ("files": ["dist"])`);

  const out = run(L, "05_pulse.ts");
  const expected = "Map(2) { 'click' => 2, 'purchase' => 1 }\nrevenue: 49";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
}, 120_000);
