// `pnpm check 01` - checks the exercises of one lesson and prints a friendly summary.
//
// Two tools do the real work:
//   1. tsc, the TypeScript type checker, reads the lesson's exercise files and tests without running them.
//   2. Vitest runs the lesson's tests (tests/lessonNN.test.ts), which run your code.
// Their own output is long, so we hide it and print one line per exercise instead, with a hint when it's not done yet.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";

type Problem = { exercise: string; lines: string[] };

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: string) => (text: string) => (color ? `\x1b[${code}m${text}\x1b[0m` : text);
const green = paint("32"), red = paint("31"), dim = paint("2"), bold = paint("1");

function findCourseRoot(): string {
  let folder = process.cwd();
  while (true) {
    if (existsSync(join(folder, "exercises")) && existsSync(join(folder, "tests"))) return folder;
    const up = dirname(folder);
    if (up === folder) quit("Run this command inside the course folder (the one with 'exercises' in it).");
    folder = up;
  }
}

function quit(message: string): never {
  console.error(message);
  process.exit(2);
}

/** The JavaScript entry point of a tool in node_modules (works the same on Mac, Linux and Windows). */
function toolPath(pkg: string, bin: string, root: string): string {
  const require = createRequire(join(root, "package.json"));
  let manifest: string;
  try {
    manifest = require.resolve(`${pkg}/package.json`);
  } catch {
    quit(`I can't find ${pkg}. Run  pnpm install  in the course folder first.`);
  }
  const bins = JSON.parse(readFileSync(manifest, "utf8")).bin;
  return join(dirname(manifest), typeof bins === "string" ? bins : bins[bin]);
}

const arg = process.argv[2] ?? "";
if (!/^\d+$/.test(arg)) quit("Tell me which lesson to check, for example:  pnpm check 01");
const lesson = arg.padStart(2, "0");
const root = findCourseRoot();
const testFile = join("tests", `lesson${lesson}.test.ts`);
const exerciseDir = join("exercises", lesson);
if (!existsSync(join(root, testFile)) || !existsSync(join(root, exerciseDir))) quit(`There are no checks for lesson ${lesson} yet.`);

const exercises = readdirSync(join(root, exerciseDir)).filter((f) => f.endsWith(".ts")).sort();
const problems: Problem[] = [];
const testLines = readFileSync(join(root, testFile), "utf8").split("\n");
const unixPath = (p: string) => p.split(sep).join("/");

// Which exercise does a line of the test file belong to? The exercise named on that line, or the test it's in.
function exerciseOfTestLine(lineNo: number): string | undefined {
  const named = exercises.find((e) => testLines[lineNo - 1]?.includes(e));
  if (named) return named;
  for (let i = lineNo - 1; i >= 0; i--) {
    const m = testLines[i].match(/^test\("([^"]+)"/);
    if (m) return m[1];
  }
  return undefined;
}

// The friendly words for a failed type check in the test file: the text after @ts-expect-error or after "// hint:".
function hintForTestLine(lineNo: number, message: string): string {
  const here = testLines[lineNo - 1] ?? "";
  const expectError = here.match(/@ts-expect-error\s+(.*)$/);
  if (expectError) return expectError[1];
  for (let i = lineNo - 2; i >= Math.max(0, lineNo - 4); i--) {
    const hint = testLines[i].match(/\/\/\s*hint:\s*(.*)$/);
    if (hint) return hint[1];
    if (!testLines[i].trim().startsWith("//")) break;
  }
  return message;
}

// ---- 1. tsc: type-check this lesson's exercises and tests (and nothing else) ----
const cacheDir = join(root, "node_modules", ".cache", "backend-from-js");
mkdirSync(cacheDir, { recursive: true });
const config = join(cacheDir, `tsconfig.lesson${lesson}.json`);
const fromCache = (p: string) => unixPath(relative(cacheDir, join(root, p)));
writeFileSync(config, JSON.stringify({
  extends: fromCache("tsconfig.json"),
  files: [...exercises.map((e) => fromCache(join(exerciseDir, e))), fromCache(testFile)],
  include: [],
}, null, 2));
const tsc = spawnSync(process.execPath, [toolPath("typescript", "tsc", root), "-p", config, "--pretty", "false"],
  { cwd: root, encoding: "utf8" });
if (tsc.error) quit(`I couldn't start tsc: ${tsc.error.message}`);

const byExercise = new Map<string, string[]>();
const add = (exercise: string, line: string) => byExercise.set(exercise, [...(byExercise.get(exercise) ?? []), line]);
const tscOut = `${tsc.stdout}${tsc.stderr}`.split("\n");
for (const [i, raw] of tscOut.entries()) {
  const m = raw.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/);
  if (!m) continue;
  const [, file, lineText, , codeText, message] = m;
  const lineNo = Number(lineText);
  // a very long message (a whole object type) is explained in more detail on the indented lines below;
  // then the last of those is the most precise one
  let detail = "";
  if (message.length > 100) for (let j = i + 1; j < tscOut.length && /^\s+\S/.test(tscOut[j]); j++) detail = tscOut[j].trim();
  const path = unixPath(file);
  const exercise = exercises.find((e) => path.endsWith(`${unixPath(exerciseDir)}/${e}`));
  if (exercise) add(exercise, `line ${lineNo}: ${detail || message}`);
  else if (path.endsWith(unixPath(testFile))) {
    const owner = exerciseOfTestLine(lineNo);
    const hint = codeText === "TS2578" ? hintForTestLine(lineNo, message) : hintForTestLine(lineNo, detail || message);
    if (owner) add(owner, hint);
    else problems.push({ exercise: "(tests)", lines: [`line ${lineNo}: ${message}`] });
  } else problems.push({ exercise: path, lines: [`line ${lineNo}: ${message}`] });
}

// ---- 2. Vitest: run this lesson's tests ----
const scratch = mkdtempSync(join(tmpdir(), "bfj-check-"));
const report = join(scratch, "report.json");
const vitest = spawnSync(process.execPath, [toolPath("vitest", "vitest", root), "run", unixPath(testFile),
  "--reporter=json", `--outputFile=${report}`, "--no-color"], { cwd: root, encoding: "utf8", env: { ...process.env, CI: "1" } });
type Assertion = { title: string; status: string; failureMessages: string[] };
let assertions: Assertion[] = [];
let crashed = "";
if (existsSync(report)) {
  const results = JSON.parse(readFileSync(report, "utf8")).testResults ?? [];
  assertions = results.flatMap((r: { assertionResults: Assertion[] }) => r.assertionResults);
  crashed = results.find((r: { message?: string }) => r.message)?.message ?? "";
} else crashed = (vitest.stderr || vitest.stdout || "Vitest didn't run.").trim().split("\n").slice(0, 3).join("\n");
rmSync(scratch, { recursive: true, force: true });

for (const a of assertions) {
  if (a.status === "passed") continue;
  const message = (a.failureMessages[0] ?? "This check failed.").split("\n")
    .filter((line) => !/^\s+at /.test(line)).join("\n").replace(/^Error: /, "").trim();
  add(a.title, message);
}

// ---- 3. One line per exercise ----
console.log(`\nChecking lesson ${lesson}...\n`);
let passed = 0;
for (const exercise of exercises) {
  const ran = assertions.some((a) => a.title === exercise);
  const lines = [...new Set(byExercise.get(exercise) ?? [])];
  if (!ran) lines.push(crashed ? `The tests didn't run: ${crashed.split("\n")[0]}` : "This check did not run.");
  if (lines.length === 0) {
    passed++;
    console.log(`  ${green("✔")}  ${exercise}`);
    continue;
  }
  console.log(`  ${red("✘")}  ${bold(exercise)}`);
  const shown = lines.flatMap((l) => l.split("\n"));
  for (const line of shown.slice(0, 3)) console.log(`       ${dim(line)}`);
  if (shown.length > 3) console.log(`       ${dim(`... and ${shown.length - 3} more`)}`);
}
for (const p of problems) for (const line of p.lines) console.log(`  ${red("!")}  ${p.exercise} ${line}`);
const done = passed === exercises.length;
console.log(`\n${passed}/${exercises.length} passed. ${done ? green("All done!") : "Keep going."}`);
process.exit(0); // "not done yet" is not an error: pnpm would print a scary "Command failed" line
