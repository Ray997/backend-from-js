// Shared tools for the lesson checks: run a student's program, read its source, explain failures kindly.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const EXERCISES = fileURLToPath(new URL("../exercises/", import.meta.url));

/** Fail the check with a friendly hint (the checker prints only this message). */
export function check(condition: unknown, hint: string): asserts condition {
  if (!condition) throw new Error(hint);
}

/** Lines that only tsc looks at: the function is never called, so nothing in it runs. */
export function typeChecks(_lines: () => void): void {}

/** Import an exercise; if its code crashes while loading, say so in plain words. */
export async function load<T>(importIt: () => Promise<T>): Promise<T> {
  try {
    return await importIt();
  } catch (error) {
    throw new Error(`Your file crashed when it ran:\n${String(error).split("\n")[0]}`);
  }
}

/** The source code of exercises/<lesson>/<file>. */
export function source(lesson: string, file: string): string {
  return readFileSync(`${EXERCISES}${lesson}/${file}`, "utf8");
}

/** The source without its comments, so words in the instructions don't count. */
export function code(lesson: string, file: string): string {
  return source(lesson, file)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

/** Run exercises/<lesson>/<file> with node, like you would, and return what it printed. */
export function run(lesson: string, file: string): string {
  const done = spawnSync(process.execPath, [`${EXERCISES}${lesson}/${file}`], { encoding: "utf8", timeout: 10_000 });
  if (done.error) throw new Error(`I couldn't run ${file}: ${done.error.message}`);
  if (done.status !== 0) {
    const lines = done.stderr.split("\n");
    const error = lines.find((line) => /^\w*(Error|Exception)\b/.test(line)) ?? lines.find((line) => line.trim()) ?? "";
    const where = lines[0]?.match(/:(\d+)$/);
    throw new Error(`Your program crashed: ${error.trim()}${where ? `  (line ${where[1]})` : ""}`);
  }
  return done.stdout.replace(/\r\n/g, "\n").trimEnd();
}

/** Show invisible things (an empty output) in a hint. */
export function show(text: string): string {
  return text === "" ? "(nothing)" : text;
}
