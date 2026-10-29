// Checks for lesson 06: Async code and errors (Promise<T>, async/await, Promise.all, catch (e) is unknown,
// your own Error classes, the Result pattern, a typed HTTP client).
//
// Every test is named after its exercise file. `pnpm check 06` runs tsc on the lesson's files AND these tests:
//   - lines marked  // @ts-expect-error  must be type errors (if one isn't, the checker prints the text after it)
//   - a  // hint:  comment explains the type check on the next line, if that line fails
//   - check(condition, hint) tests what your program does
import { createServer } from "node:http";
import { expectTypeOf, test } from "vitest";
import type { Profile } from "../exercises/06/01_async.ts";
import type { NotFoundError as NotFound } from "../exercises/06/03_error_class.ts";
import type { Result } from "../exercises/06/05_result.ts";
import type { ApiError, Result as ClientResult } from "../exercises/06/06_client.ts";
import { startServer } from "../exercises/06/api/server.ts";
import { check, code, load, run, show, typeChecks } from "./helpers.ts";

const L = "06";

/** No `any`, no `as` (except the given `(await res.json()) as T` in exercise 6). */
function honest(file: string) {
  const src = code(L, file).replace(/\(await res\.json\(\)\) as T\b/g, "");
  check(!/\bany\b/.test(src), "There's still an `any` in your code. Use unknown, and narrow it.");
  check(!/\bas\s+[A-Za-z{[(]/.test(src), "Don't use `as`: it only tells TypeScript to trust you. Narrow the value instead.");
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

test("01_async.ts", async () => {
  const { orderTotal, loadProfile, requests } = await load(() => import("../exercises/06/01_async.ts"));
  typeChecks(() => {
    // hint: orderTotal is async: it returns a Promise<number>.
    expectTypeOf(orderTotal).returns.toEqualTypeOf<Promise<number>>();
    // hint: loadProfile is async too: it returns a Promise<Profile>.
    expectTypeOf(loadProfile).returns.toEqualTypeOf<Promise<Profile>>();
  });
  honest("01_async.ts");
  const total = await orderTotal("u1");
  check(total === 42.5, `await orderTotal("u1") should be 42.5 (30 + 12.5). Got: ${total}`);
  check((await orderTotal("u2")) === 0, "await orderTotal(\"u2\") should be 0: Mert has no orders.");
  requests.most = 0;
  const profile = await loadProfile("u1");
  check(same(profile, { name: "Ana", orders: 2 }),
    `await loadProfile("u1") should be { name: "Ana", orders: 2 }. Got: ${JSON.stringify(profile)}`);
  check(requests.most === 2,
    "loadProfile waits for one request before it starts the other. Start both at once:  await Promise.all([getUser(id), getOrders(id)])");
  const out = run(L, "01_async.ts");
  const expected = "42.5\n{ name: 'Ana', orders: 2 }";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("02_narrow.ts", async () => {
  const { messageOf, isTimeout } = await load(() => import("../exercises/06/02_narrow.ts"));
  honest("02_narrow.ts");
  const cases: [unknown, string][] = [
    [new Error("boom"), "boom"],
    [new TypeError("fetch failed"), "fetch failed"],
    ["timeout", "timeout"],
    [{ message: "bad gateway" }, "bad gateway"],
    [{ message: 502 }, 'unknown error: {"message":502}'],
    [{ status: 404 }, 'unknown error: {"status":404}'],
    [42, "unknown error: 42"],
    [null, "unknown error: null"],
  ];
  for (const [value, want] of cases) {
    const got = messageOf(value);
    check(got === want, `messageOf(${value instanceof Error ? `new ${value.name}("${value.message}")` : JSON.stringify(value)}) ` +
      `should be ${JSON.stringify(want)}. Got: ${JSON.stringify(got)}`);
  }
  const timeout = new Error("too slow");
  timeout.name = "TimeoutError";
  check(isTimeout(timeout) === true, "isTimeout should be true for an Error whose name is \"TimeoutError\".");
  check(isTimeout(new Error("TimeoutError")) === false, "isTimeout should look at the error's name, not its message.");
  check(isTimeout("TimeoutError") === false, "isTimeout(\"TimeoutError\") should be false: a string is not an Error.");
  check(isTimeout({ name: "TimeoutError" }) === false, "isTimeout({ name: \"TimeoutError\" }) should be false: a plain object is not an Error.");
  const out = run(L, "02_narrow.ts");
  const expected = 'boom\ntimeout\nbad gateway\nunknown error: {"status":404}\nunknown error: 42\ntrue false';
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("03_error_class.ts", async () => {
  const { NotFoundError, findUser, statusOf } = await load(() => import("../exercises/06/03_error_class.ts"));
  typeChecks(() => {
    // hint: NotFoundError needs an id field (a string), and a constructor that takes the id.
    expectTypeOf<NotFound["id"]>().toEqualTypeOf<string>();
    // @ts-expect-error NotFoundError's constructor takes exactly one argument: the id.
    new NotFoundError();
  });
  honest("03_error_class.ts");
  const e = new NotFoundError("u9");
  check(e instanceof Error, "A NotFoundError should be an Error:  class NotFoundError extends Error");
  check(e.name === "NotFoundError", `new NotFoundError("u9").name should be "NotFoundError". Got: ${JSON.stringify(e.name)}`);
  check(e.message === "no such user: u9", `new NotFoundError("u9").message should be "no such user: u9". Got: ${JSON.stringify(e.message)}  (super(...))`);
  check(Reflect.get(e, "id") === "u9", `new NotFoundError("u9").id should be "u9". Got: ${JSON.stringify(Reflect.get(e, "id"))}`);
  check(findUser("u2").name === "Mert", "findUser(\"u2\") should be Mert.");
  let thrown: unknown = "nothing";
  try {
    findUser("u9");
  } catch (err) {
    thrown = err;
  }
  check(thrown instanceof NotFoundError, `findUser("u9") should throw a NotFoundError. It threw: ${thrown instanceof Error ? thrown.name : JSON.stringify(thrown)}`);
  check(statusOf(new NotFoundError("u7")) === 404, "statusOf(a NotFoundError) should be 404.");
  check(statusOf(new Error("database is down")) === 500, "statusOf(any other Error) should be 500.");
  check(statusOf("no such user: u9") === 500, "statusOf(\"no such user: u9\") should be 500: a string is not a NotFoundError, even with the same text.");
  const out = run(L, "03_error_class.ts");
  const expected = "Ana\n404 no such user: u9\n500";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("04_fix_me.ts", async () => {
  const { summary, report, nameOrGuest, cancel } = await load(() => import("../exercises/06/04_fix_me.ts"));
  honest("04_fix_me.ts");
  check((await summary("u1")) === "Ana has 2 orders", `summary("u1") should be "Ana has 2 orders". Got: ${JSON.stringify(await summary("u1"))}`);
  check((await report("u9")) === "failed: no such user: u9", `report("u9") should be "failed: no such user: u9". Got: ${JSON.stringify(await report("u9"))}`);
  let guest: unknown;
  try {
    guest = await nameOrGuest("u9");
  } catch {
    check(false, "nameOrGuest(\"u9\") crashed instead of returning \"guest\". Inside the try:  return await getName(id);");
  }
  check(guest === "guest", `nameOrGuest("u9") should be "guest". Got: ${JSON.stringify(guest)}`);
  check((await nameOrGuest("u1")) === "Ana", "nameOrGuest(\"u1\") should be \"Ana\".");
  const cancelled = await cancel("too slow");
  check(cancelled === "cancelled: too slow",
    `cancel("too slow") should be "cancelled: too slow". Got: ${JSON.stringify(cancelled)}. In .catch, err is any: narrow it (err: unknown).`);
  const out = run(L, "04_fix_me.ts");
  const expected = "Ana has 2 orders\nfailed: no such user: u9\nguest\ncancelled: too slow";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("05_result.ts", async () => {
  const { attempt, valueOr, getName } = await load(() => import("../exercises/06/05_result.ts"));
  const r: Result<number, string> = { ok: true, value: 1 };
  typeChecks(() => {
    // hint: attempt<T> returns a Promise<Result<T, string>>.
    expectTypeOf(attempt(() => getName("u1"))).toEqualTypeOf<Promise<Result<string, string>>>();
    // hint: valueOr<T, E>(result: Result<T, E>, fallback: T): T
    expectTypeOf(valueOr(r, 0)).toEqualTypeOf<number>();
    // @ts-expect-error valueOr(result, fallback): the fallback must be a T, like the value.
    valueOr(r, "zero");
  });
  honest("05_result.ts");
  let first: unknown;
  try {
    first = await attempt(() => getName("u1"));
  } catch {
    check(false, "attempt threw. It must never throw: catch, and return { ok: false, error: ... }");
  }
  check(same(first, { ok: true, value: "Ana" }), `attempt(() => getName("u1")) should be { ok: true, value: "Ana" }. Got: ${JSON.stringify(first)}`);
  let second: unknown;
  try {
    second = await attempt(() => getName("u9"));
  } catch {
    check(false, "attempt(() => getName(\"u9\")) threw. Catch it inside attempt (and await work() inside the try).");
  }
  check(same(second, { ok: false, error: "no such user: u9" }),
    `attempt(() => getName("u9")) should be { ok: false, error: "no such user: u9" }. Got: ${JSON.stringify(second)}`);
  const slow = await attempt(() => getName("slow")).catch(() => "threw");
  check(same(slow, { ok: false, error: "timeout" }), `attempt(() => getName("slow")) should be { ok: false, error: "timeout" }: a thrown string is its own message. Got: ${JSON.stringify(slow)}`);
  const odd = await attempt(() => Promise.reject({ status: 503 })).catch(() => "threw");
  check(same(odd, { ok: false, error: '{"status":503}' }), `attempt(() => Promise.reject({ status: 503 })) should be { ok: false, error: '{"status":503}' }. Got: ${JSON.stringify(odd)}`);
  check(valueOr({ ok: true, value: "Ana" }, "guest") === "Ana", "valueOr({ ok: true, value: \"Ana\" }, \"guest\") should be \"Ana\".");
  check(valueOr({ ok: false, error: "x" }, "guest") === "guest", "valueOr({ ok: false, error: \"x\" }, \"guest\") should be \"guest\".");
  const out = run(L, "05_result.ts");
  const expected = "{ ok: true, value: 'Ana' }\n{ ok: false, error: 'no such user: u9' }\n{ ok: false, error: 'timeout' }\nAna guest";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("06_client.ts", async () => {
  const { getJson, describe } = await load(() => import("../exercises/06/06_client.ts"));
  type User = { id: string; name: string };
  typeChecks(() => {
    // hint: ApiError: four kinds: status (with a status number), parse, timeout, network.
    expectTypeOf<ApiError>().toEqualTypeOf<{ kind: "status"; status: number } | { kind: "parse" } | { kind: "timeout" } | { kind: "network" }>();
    // hint: getJson<T>(url: string, ms?: number): Promise<Result<T, ApiError>>
    expectTypeOf(getJson<User>).returns.toEqualTypeOf<Promise<ClientResult<User, ApiError>>>();
  });
  honest("06_client.ts");
  check(/default\s*:\s*return\s+assertNever\s*\(\s*error\s*\)/.test(code(L, "06_client.ts")),
    "describe: switch on error.kind, with  default: return assertNever(error);  so a new kind can't be forgotten.");
  const api = await startServer(0);
  const gone = createServer();
  await new Promise<void>((done) => gone.listen(0, "localhost", done));
  const address = gone.address();
  const closedUrl = `http://localhost:${typeof address === "object" && address ? address.port : 1}/users/u1`;
  await new Promise((done) => gone.close(done));
  try {
    const ok = await getJson<User>(`${api.url}/users/u1`, 300);
    check(same(ok, { ok: true, value: { id: "u1", name: "Ana" } }),
      `getJson(".../users/u1") should be { ok: true, value: { id: "u1", name: "Ana" } }. Got: ${JSON.stringify(ok)}`);
    const missing = await getJson<User>(`${api.url}/users/u9`, 300).catch((e: unknown) => `threw ${String(e)}`);
    check(same(missing, { ok: false, error: { kind: "status", status: 404 } }),
      `getJson(".../users/u9") should be { ok: false, error: { kind: "status", status: 404 } }: check res.ok. Got: ${JSON.stringify(missing)}`);
    const broken = await getJson<User>(`${api.url}/broken`, 300).catch((e: unknown) => `threw ${String(e)}`);
    check(same(broken, { ok: false, error: { kind: "parse" } }),
      `getJson(".../broken") should be { ok: false, error: { kind: "parse" } }: put res.json() in a try. Got: ${JSON.stringify(broken)}`);
    const slow = await getJson<User>(`${api.url}/slow`, 100).catch((e: unknown) => `threw ${String(e)}`);
    check(same(slow, { ok: false, error: { kind: "timeout" } }),
      `getJson(".../slow", 100) should be { ok: false, error: { kind: "timeout" } }: fetch(url, { signal: AbortSignal.timeout(ms) }). Got: ${JSON.stringify(slow)}`);
    const down = await getJson<User>(closedUrl, 300).catch((e: unknown) => `threw ${String(e)}`);
    check(same(down, { ok: false, error: { kind: "network" } }),
      `getJson on a port where nothing listens should be { ok: false, error: { kind: "network" } }: put fetch in a try. Got: ${JSON.stringify(down)}`);
  } finally {
    api.close();
  }
  // (the type test above checks ApiError; these values only run, so a missing kind isn't reported twice)
  const sentences: [unknown, string][] = [
    [{ kind: "status", status: 503 }, "the API answered 503"],
    [{ kind: "parse" }, "the answer is not JSON"],
    [{ kind: "timeout" }, "no answer in time"],
    [{ kind: "network" }, "nobody is listening there"],
  ];
  for (const [error, want] of sentences) {
    const got = describe(error as never);
    check(got === want, `describe(${JSON.stringify(error)}) should be ${JSON.stringify(want)}. Got: ${JSON.stringify(got)}`);
  }
  const out = run(L, "06_client.ts");
  const expected = "/users/u1: Ana\n/users/u9: the API answered 404\n/broken: the answer is not JSON\n/slow: no answer in time\n" +
    "closed port: nobody is listening there";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});
