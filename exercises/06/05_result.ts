// Exercise 5: From throw to Result
//
// A thrown error is not in the type: getName(id): Promise<string> doesn't say it can fail, so the caller can
// forget the try. A Result (lesson 04) puts the failure in the return type, and the caller has to check ok:
//
//     type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
//
// 1. attempt(work): runs an async function, and never throws. It returns
//        { ok: true, value }              when work() gives a value
//        { ok: false, error: message }    when it throws: message is a readable message, like messageOf in
//                                         exercise 2 (an Error's message, a string as it is, anything else as JSON)
//    It works for every T:
//        async function attempt<T>(work: () => Promise<T>): Promise<Result<T, string>>
//    Hint:  try { return { ok: true, value: await work() }; } catch (e) { ... }
//    (The await matters: without it, the promise leaves the try before it fails. Exercise 4.)
//
// 2. valueOr(result, fallback): the value when the result is ok, else the fallback. Also for every Result:
//        function valueOr<T, E>(result: Result<T, E>, fallback: T): T
//
// When it's done, it prints:
//
//     { ok: true, value: 'Ana' }
//     { ok: false, error: 'no such user: u9' }
//     { ok: false, error: 'timeout' }
//     Ana guest
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/06/05_result.ts
// Check it:    pnpm check 06

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// ---- "the library": it throws (don't change it) ----
export async function getName(id: string): Promise<string> {
  await new Promise((done) => setTimeout(done, 5));
  if (id === "u1") return "Ana";
  if (id === "slow") throw "timeout";
  throw new Error(`no such user: ${id}`);
}

// ---- your code ----
export async function attempt<T>(work: () => Promise<T>): Promise<unknown> {
  return work(); // TODO
}

export function valueOr(result: unknown, fallback: unknown): unknown {
  return fallback; // TODO
}

console.log(await attempt(() => getName("u1")));
console.log(await attempt(() => getName("u9")));
console.log(await attempt(() => getName("slow")));
const ana = await attempt(() => getName("u1"));
const nobody = await attempt(() => getName("u9"));
console.log(valueOr(ana, "guest"), valueOr(nobody, "guest"));
