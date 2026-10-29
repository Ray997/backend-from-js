// Exercise 6 (project): A typed HTTP client, with every failure in its type
//
// api/server.ts is a tiny API that runs inside your own program (no internet). startServer(0) starts it on a free
// port and gives you its url; close() stops it. Its pages:
//
//     /users/u1, /users/u2   200, a user as JSON         /users/<other>   404
//     /broken                200, but not JSON           /slow            answers only after 3 seconds
//
// fetch only rejects (throws, with await) when there is no answer at all. A 404 is an answer: check res.ok.
//
// getJson never throws: it returns a Result. ApiError lists every way a request can fail:
//
//     { kind: "status"; status: number }    the API answered, but not ok (res.ok is false): its status, like 404
//     { kind: "parse" }                     the answer is not JSON (res.json() rejects)
//     { kind: "timeout" }                   no answer within ms milliseconds
//     { kind: "network" }                   no answer at all (fetch rejects), for example nothing on that port
//
// 1. ApiError: the union of those four kinds.
// 2. getJson<T>(url, ms): Promise<Result<T, ApiError>>
//    - fetch(url, { signal: AbortSignal.timeout(ms) }) in a try. If it throws: an Error named "TimeoutError" is
//      kind "timeout", anything else is kind "network".
//    - res.ok is false: kind "status", with res.status.
//    - res.json() in a second try: if it throws, kind "parse".
//      The line that reads the JSON is given. Its `as T` is the one place we trust the server (checking the data
//      at runtime is lesson 09).
// 3. describe(error): a sentence for every kind. Use a switch on error.kind, with assertNever(error) in the default
//    branch (lesson 02): then a fifth kind would be a type error, until describe handles it too.
//        status    "the API answered 404"   (with the real status)
//        parse     "the answer is not JSON"
//        timeout   "no answer in time"
//        network   "nobody is listening there"
//
// When it's done, it prints:
//
//     /users/u1: Ana
//     /users/u9: the API answered 404
//     /broken: the answer is not JSON
//     /slow: no answer in time
//     closed port: nobody is listening there
//
// Rules: no `any`, and no `as` except the given one.
//
// Run it:      node exercises/06/06_client.ts
// Check it:    pnpm check 06

import { startServer } from "./api/server.ts";

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type ApiError = { kind: "status"; status: number }; // TODO: all four kinds

export async function getJson<T>(url: string, ms = 500): Promise<Result<T, ApiError>> {
  const res = await fetch(url); // TODO: the timeout, and a try around the fetch
  // TODO: check res.ok
  const value = (await res.json()) as T; // TODO: a try around this line
  return { ok: true, value };
}

export function assertNever(x: never): never {
  throw new Error(`unexpected: ${JSON.stringify(x)}`);
}

export function describe(error: ApiError): string {
  return "?"; // TODO
}

type User = { id: string; name: string };

const api = await startServer(0);
const closed = await startServer(0);
closed.close(); // now nothing is listening on its port
for (const page of ["/users/u1", "/users/u9", "/broken", "/slow"]) {
  const r = await getJson<User>(api.url + page, 200);
  console.log(`${page}: ${r.ok ? r.value.name : describe(r.error)}`);
}
const down = await getJson<User>(`${closed.url}/users/u1`, 200);
console.log(`closed port: ${down.ok ? down.value.name : describe(down.error)}`);
api.close();
