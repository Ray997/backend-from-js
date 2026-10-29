// Checks for lesson 03: Function and object types, optional/default/rest, readonly, index signatures, satisfies.
//
// Every test is named after its exercise file. `pnpm check 03` runs tsc on the lesson's files AND these tests:
//   - lines marked  // @ts-expect-error  must be type errors (if one isn't, the checker prints the text after it)
//   - a  // hint:  comment explains the type check on the next line, if that line fails
//   - check(condition, hint) tests what your program does
import { expectTypeOf, test } from "vitest";
import type { Check } from "../exercises/03/01_functions.ts";
import type { ServerConfig } from "../exercises/03/03_readonly.ts";
import type { Env } from "../exercises/03/04_index.ts";
import type { Settings } from "../exercises/03/06_config.ts";
import { check, code, load, run, show, typeChecks } from "./helpers.ts";

const L = "03";

/** No `any` (and optionally no `as`): the types have to do the work. */
function honest(file: string, { noAs = true } = {}) {
  const src = code(L, file);
  check(!/\bany\b/.test(src), "There's still an `any` in your code. Write the real type instead.");
  if (noAs) check(!/\bas\s+[A-Za-z{[(]/.test(src), "Don't use `as`: it only tells TypeScript to trust you. Write the types instead.");
}

test("01_functions.ts", async () => {
  const { isPort, notEmpty, passesAll } = await load(() => import("../exercises/03/01_functions.ts"));
  typeChecks(() => {
    // hint: Check should be the function type  (value: string) => boolean
    expectTypeOf<Check>().toEqualTypeOf<(value: string) => boolean>();
    // @ts-expect-error A check that takes a number should be a type error: write the Check type.
    const wrong: Check = (n: number) => n > 0;
    // @ts-expect-error passesAll("1", ["not a function"]) should be a type error: the list holds Check functions.
    passesAll("1", ["not a function"]);
  });
  honest("01_functions.ts");
  for (const [input, expected] of [["8080", true], ["1", true], ["65535", true], ["0", false], ["70000", false],
    ["65536", false], ["80a", false], ["", false], ["-1", false], ["8.5", false]] as const) {
    const got = isPort(input);
    check(got === expected, `isPort("${input}") should be ${expected}. Got: ${got}` +
      (input === "" ? "\nAn empty text is not a port: Number(\"\") is 0, so check for digits first." : ""));
  }
  check(passesAll("3000", [notEmpty, isPort]) === true, "passesAll(\"3000\", [notEmpty, isPort]) should be true: both checks pass.");
  check(passesAll("", [notEmpty, isPort]) === false, "passesAll(\"\", [notEmpty, isPort]) should be false: notEmpty fails.");
  check(passesAll("abc", [notEmpty]) === true, "passesAll(\"abc\", [notEmpty]) should be true.");
  check(passesAll("x", []) === true, "passesAll(\"x\", []) should be true: with no checks, nothing fails. (checks.every does that.)");
  const out = run(L, "01_functions.ts");
  check(out === "true false\ntrue false", `Expected:\ntrue false\ntrue false\nGot:\n${show(out)}`);
});

test("02_params.ts", async () => {
  const { dbUrl, route } = await load(() => import("../exercises/03/02_params.ts"));
  typeChecks(() => {
    // hint: dbUrl's parameters should be  (host: string, port = 5432, database?: string)
    expectTypeOf(dbUrl).parameters.toEqualTypeOf<[string, number?, string?]>();
    // hint: route should take any number of strings:  route(...parts: string[])
    expectTypeOf(route).parameters.toEqualTypeOf<string[]>();
    // @ts-expect-error dbUrl() should be a type error: the host is required.
    dbUrl();
    // @ts-expect-error route("api", 1) should be a type error: every part is a string.
    route("api", 1);
  });
  honest("02_params.ts");
  for (const [call, got, expected] of [
    ['dbUrl("localhost")', dbUrl("localhost"), "postgres://localhost:5432"],
    ['dbUrl("db.internal", 6432)', dbUrl("db.internal", 6432), "postgres://db.internal:6432"],
    ['dbUrl("localhost", 5432, "pulse")', dbUrl("localhost", 5432, "pulse"), "postgres://localhost:5432/pulse"],
    ['dbUrl("localhost", undefined, "pulse")', dbUrl("localhost", undefined, "pulse"), "postgres://localhost:5432/pulse"],
  ]) {
    check(got === expected, `${call} should return "${expected}". Got: ${JSON.stringify(got)}` +
      (got.endsWith("/undefined") ? "\nNo database -> nothing after the port. Check whether database is undefined first." : "") +
      (got.includes(":undefined") ? "\nport should have the default value 5432:  port = 5432" : ""));
  }
  check(route("api", "v1", "events") === "/api/v1/events", `route("api", "v1", "events") should return "/api/v1/events". Got: ${JSON.stringify(route("api", "v1", "events"))}`);
  check(route() === "/", `route() should return "/". Got: ${JSON.stringify(route())}`);
});

test("03_readonly.ts", async () => {
  const { withPort, withHost } = await load(() => import("../exercises/03/03_readonly.ts"));
  typeChecks(() => {
    const c: ServerConfig = { port: 1, hosts: [] };
    // @ts-expect-error c.port = 2 should be a type error: make port readonly.
    c.port = 2;
    // @ts-expect-error c.hosts = [] should be a type error: make hosts readonly.
    c.hosts = [];
    // @ts-expect-error c.hosts.push("x") should be a type error: make hosts a readonly string[].
    c.hosts.push("x");
  });
  honest("03_readonly.ts");
  const base: ServerConfig = { port: 8080, hosts: ["localhost"] };
  const moved = withPort(base, 9090);
  check(moved.port === 9090, `withPort(config, 9090).port should be 9090. Got: ${moved.port}`);
  check(base.port === 8080, "withPort changed the config it was given. Return a new one:  return { ...config, port };");
  const more = withHost(base, "api.local");
  check(JSON.stringify(more.hosts) === '["localhost","api.local"]', `withHost(config, "api.local").hosts should be ["localhost", "api.local"]. Got: ${JSON.stringify(more.hosts)}`);
  check(JSON.stringify(base.hosts) === '["localhost"]', "withHost changed the hosts of the config it was given. Make a new array:  [...config.hosts, host]");
  check(more.port === 8080, "withHost should keep the port of the config.");
  const out = run(L, "03_readonly.ts");
  const expected = "8080 [ 'localhost' ]\n9090 [ 'localhost', 'api.local' ]";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("04_index.ts", async () => {
  const { parseEnv, envOr } = await load(() => import("../exercises/03/04_index.ts"));
  typeChecks(() => {
    // hint: Env should be an index signature:  { [key: string]: string }
    expectTypeOf<Env>().toEqualTypeOf<{ [key: string]: string }>();
    // @ts-expect-error { PORT: 8080 } should be a type error: every value of an Env is a string.
    const wrong: Env = { PORT: 8080 };
  });
  honest("04_index.ts");
  const simple = parseEnv("PORT=8080\nHOST=0.0.0.0");
  check(JSON.stringify(simple) === '{"PORT":"8080","HOST":"0.0.0.0"}',
    `parseEnv("PORT=8080\\nHOST=0.0.0.0") should be { PORT: "8080", HOST: "0.0.0.0" }. Got: ${JSON.stringify(simple)}`);
  const messy = parseEnv("# comment\n\n  NAME = pulse  \nDB=postgres://x?ssl=true\n");
  check(!("# comment" in messy) && !("" in messy), `Skip empty lines and lines that start with #. Got: ${JSON.stringify(messy)}`);
  check(messy.NAME === "pulse", `"  NAME = pulse  " should give NAME: "pulse" (trim the key and the value). Got: ${JSON.stringify(messy)}`);
  check(messy.DB === "postgres://x?ssl=true", `"DB=postgres://x?ssl=true" should give DB: "postgres://x?ssl=true": split at the FIRST "=" only. Got: ${JSON.stringify(messy.DB)}`);
  check(envOr({ PORT: "8080" }, "PORT", "3000") === "8080", "envOr({ PORT: \"8080\" }, \"PORT\", \"3000\") should be \"8080\".");
  const missing = envOr({ PORT: "8080" }, "HOST", "localhost");
  check(missing === "localhost", `envOr({ PORT: "8080" }, "HOST", "localhost") should be "localhost". Got: ${JSON.stringify(missing)}` +
    (missing === undefined ? "\nA missing key gives undefined at runtime, even though TypeScript says string. Use the fallback then." : ""));
  check(envOr({ EMPTY: "" }, "EMPTY", "x") === "", "envOr({ EMPTY: \"\" }, \"EMPTY\", \"x\") should be \"\": the key is there, its value is just empty. (Use ?? , not ||.)");
  const out = run(L, "04_index.ts");
  const expected = "{ PORT: '8080', HOST: '0.0.0.0', DB: 'postgres://db/pulse?ssl=true' }\n8080 info";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("05_fix_me.ts", async () => {
  const { listen, tagList, limitFor } = await load(() => import("../exercises/03/05_fix_me.ts"));
  honest("05_fix_me.ts");
  check(listen(8080) === "listening on 0.0.0.0:8080", `listen(8080) should be "listening on 0.0.0.0:8080". Got: ${JSON.stringify(listen(8080))}`);
  check(listen(80, "127.0.0.1") === "listening on 127.0.0.1:80", "listen(80, \"127.0.0.1\") should be \"listening on 127.0.0.1:80\".");
  check(tagList("a") === "a" && tagList("x", "y", "z") === "x, y, z", "tagList(\"x\", \"y\", \"z\") should be \"x, y, z\".");
  for (const plan of ["Pro", "PRO", "pro"]) {
    check(limitFor(plan) === 10_000, `limitFor("${plan}") should be 10000. Got: ${limitFor(plan)}\n` +
      "The keys of limits are lowercase. TypeScript can't help here: an index signature says every key gives a number.");
  }
  check(limitFor("Free") === 100, `limitFor("Free") should be 100. Got: ${limitFor("Free")}`);
  const expected = "listening on 0.0.0.0:8080\nhosts: localhost, api.local\ntags: api, v1\nlimit for Pro: 10000";
  const out = run(L, "05_fix_me.ts");
  check(out === expected, `It runs now, but the output is different.\nExpected:\n${expected}\nGot:\n${show(out)}`);
});

test("06_config.ts", async () => {
  const { config, summary } = await load(() => import("../exercises/03/06_config.ts"));
  typeChecks(() => {
    // @ts-expect-error A Settings without db should be a type error: write the Settings type.
    const noDb: Settings = { port: 1, logLevel: "info", features: {} };
    // @ts-expect-error logLevel "verbose" should be a type error: logLevel is "debug" | "info" | "warn" | "error".
    const verbose: Settings = { port: 1, db: "x", logLevel: "verbose", features: {} };
    // hint: debug should be optional (debug?: boolean), and features an index signature: { [flag: string]: boolean }
    const minimal: Settings = { port: 1, db: "x", logLevel: "info", features: { anyFlagName: true } };
    // @ts-expect-error minimal.port = 2 should be a type error: make every property of Settings readonly.
    minimal.port = 2;
    // @ts-expect-error config.staging should be a type error: replace the annotation with satisfies, so config keeps its keys.
    config.staging;
    // hint: config.production.port should be a number. Write Settings, and use satisfies instead of the annotation.
    expectTypeOf(config.production.port).toEqualTypeOf<number>();
  });
  honest("06_config.ts");
  check(/\}\s*satisfies\s*\{\s*\[\s*\w+\s*:\s*string\s*\]\s*:\s*Settings\s*;?\s*\}/.test(code(L, "06_config.ts")),
    "Use satisfies after the config object:  } satisfies { [env: string]: Settings };");
  const s: Settings = { port: 1, db: "x", logLevel: "error", features: { a: true, b: false, c: true } };
  const got = summary("test", s);
  check(got === "test: port 1, log error, debug off, features: a, c",
    `summary("test", { port: 1, logLevel: "error", features: { a: true, b: false, c: true }, ... }) should be\n"test: port 1, log error, debug off, features: a, c". Got: ${JSON.stringify(got)}`);
  const none = summary("x", { port: 2, db: "y", logLevel: "info", debug: true, features: {} });
  check(none === "x: port 2, log info, debug on, features: none",
    `With debug: true and no features, summary should be "x: port 2, log info, debug on, features: none". Got: ${JSON.stringify(none)}`);
  const out = run(L, "06_config.ts");
  const expected = "development: port 3000, log debug, debug on, features: newCheckout, betaCharts\nproduction: port 8080, log warn, debug off, features: newCheckout";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});
