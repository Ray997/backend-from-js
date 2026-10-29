// Checks for lesson 08: Typing Express (routes, Request and Response types, RequestHandler, middleware, a new
// field on req, error-handling middleware, and why a typed req.body still has to be checked).
//
// Every test is named after its exercise file. `pnpm check 08` runs tsc on the lesson's files AND these tests:
//   - lines marked  // @ts-expect-error  must be type errors (if one isn't, the checker prints the text after it)
//   - a  // hint:  comment explains the type check on the next line, if that line fails
//   - check(condition, hint) tests what your program does
// The tests start your app on a free port of your own machine (localhost) and send it real requests.
import type { RequestHandler } from "express";
import { expectTypeOf, test } from "vitest";
import type { ApiError } from "../exercises/08/01_routes.ts";
import type { CreateEvent, Result } from "../exercises/08/05_events_api.ts";
import { send, serve } from "../exercises/08/lib/serve.ts";
import { check, code, load, run, show, typeChecks } from "./helpers.ts";

const L = "08";

/** No `any`, no `as`. */
function honest(file: string) {
  const src = code(L, file);
  check(!/\bany\b/.test(src), "There's still an `any` in your code. Give it a real type, or unknown.");
  check(!/\bas\s+[A-Za-z{[(]/.test(src), "Don't use `as`: it only tells TypeScript to trust you. Check the value instead.");
}

/** Start the app, run the requests, always stop it. */
async function withApi(app: Parameters<typeof serve>[0], go: (url: string) => Promise<void>) {
  const api = await serve(app);
  try {
    await go(api.url);
  } finally {
    api.close();
  }
}

/** "200 {...}" -> a check with a short, friendly message. */
async function expectAnswer(url: string, path: string, want: string, hint = "", method = "GET", body?: unknown) {
  const got = await send(url + path, method, body);
  const shown = got.length > 70 ? `${got.slice(0, 70)}...` : got;
  check(got === want, `${method} ${path} should answer ${want}. Got: ${shown}${hint ? `  ${hint}` : ""}`);
}

test("01_routes.ts", async () => {
  const { app, sum, search } = await load(() => import("../exercises/08/01_routes.ts"));
  typeChecks(() => {
    // hint: sum: RequestHandler<{ a: string; b: string }, { sum: number } | ApiError>
    expectTypeOf(sum).toEqualTypeOf<RequestHandler<{ a: string; b: string }, { sum: number } | ApiError>>();
    // hint: search: RequestHandler<{}, { results: string[] } | ApiError>
    expectTypeOf(search).toEqualTypeOf<RequestHandler<{}, { results: string[] } | ApiError>>();
  });
  honest("01_routes.ts");
  await withApi(app, async (url) => {
    await expectAnswer(url, "/hello/ana", '200 {"hello":"ana"}', "(req.params.name)");
    await expectAnswer(url, "/hello/Mert", '200 {"hello":"Mert"}');
    await expectAnswer(url, "/sum/2/3", '200 {"sum":5}', "(params are strings: Number(...))");
    await expectAnswer(url, "/sum/10/-4", '200 {"sum":6}');
    await expectAnswer(url, "/sum/2/x", '400 {"error":"a and b must be numbers"}', "(Number.isNaN)");
    await expectAnswer(url, "/search?q=pri", '200 {"results":["/pricing"]}');
    await expectAnswer(url, "/search?q=s", '200 {"results":["/docs","/signup"]}');
    await expectAnswer(url, "/search?q=a&q=b", '400 {"error":"q must be one string"}', "(q is an array here)");
    await expectAnswer(url, "/search", '400 {"error":"q must be one string"}', "(no q at all)");
    await expectAnswer(url, "/search?q=", '400 {"error":"q must be one string"}', "(an empty q)");
  });
  const out = run(L, "01_routes.ts");
  const expected = '/hello/ana 200 {"hello":"ana"}\n/sum/2/3 200 {"sum":5}\n/sum/2/x 400 {"error":"a and b must be numbers"}\n' +
    '/search?q=pri 200 {"results":["/pricing"]}\n/search?q=a&q=b 400 {"error":"q must be one string"}\n' +
    '/search 400 {"error":"q must be one string"}';
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("02_middleware.ts", async () => {
  const { app, log } = await load(() => import("../exercises/08/02_middleware.ts"));
  typeChecks(() => {
    // hint: add requestId: string to Express's Request: declare global (see the instructions)
    expectTypeOf<Express.Request["requestId"]>().toEqualTypeOf<string>();
  });
  honest("02_middleware.ts");
  await withApi(app, async (url) => {
    const first = await fetch(`${url}/ping`);
    const id = first.headers.get("x-request-id");
    check(id !== null, "The answer has no x-request-id header. In requestId:  res.setHeader(\"x-request-id\", req.requestId)");
    check(/^r\d+$/.test(id), `The request id should look like "r1", "r2", ... Got: ${JSON.stringify(id)}`);
    const second = (await fetch(`${url}/ping`)).headers.get("x-request-id");
    check(second !== id, `Two requests got the same id (${id}). Count them: every request gets the next number.`);
    await fetch(`${url}/nope`);
    await new Promise((done) => setTimeout(done, 50));
    check(log.includes(`${id} GET /ping 200`),
      `log should have the line "${id} GET /ping 200". It has: ${JSON.stringify(log.slice(-3))}  (res.on("finish", ...))`);
    check(log.some((line) => / GET \/nope 404$/.test(line)), "A request with no route (GET /nope, 404) should be logged too.");
  });
  const out = run(L, "02_middleware.ts");
  const expected = '200 {"pong":true}\nr1 GET /ping 200\nr2 GET /nope 404\nr3 POST /ping 404';
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("03_errors.ts", async () => {
  const { app, HttpError, onError, errors } = await load(() => import("../exercises/08/03_errors.ts"));
  typeChecks(() => {
    // hint: HttpError needs a constructor(status: number, message: string)
    expectTypeOf<ConstructorParameters<typeof HttpError>>().toEqualTypeOf<[number, string]>();
    // hint: HttpError needs a status field: a number
    expectTypeOf<InstanceType<typeof HttpError>["status"]>().toEqualTypeOf<number>();
  });
  honest("03_errors.ts");
  check(/\(\s*err\s*:\s*unknown\b/.test(code(L, "03_errors.ts")),
    "In onError, write err: unknown (a thrown value can be anything), and narrow it.");
  check(onError.length === 4, "onError needs all four parameters (err, req, res, next): that's how Express knows it.");
  const e: unknown = Reflect.construct(HttpError, [418, "short and stout"]);
  check(e instanceof Error && Reflect.get(e, "status") === 418 && e.message === "short and stout",
    "new HttpError(418, \"short and stout\") should have status 418 and that message:  super(message)");
  check(e instanceof Error && e.name === "HttpError", "An HttpError's name should be \"HttpError\".");
  await withApi(app, async (url) => {
    await expectAnswer(url, "/events/e1", '200 {"id":"e1","path":"/pricing"}');
    await expectAnswer(url, "/events/e9", '404 {"error":"no such event: e9"}', "(throw new HttpError(404, ...))");
    errors.length = 0;
    await expectAnswer(url, "/stats", '500 {"error":"internal error"}');
    check(errors.includes("Error: database is down"),
      `The server log (errors) should have "Error: database is down". It has: ${JSON.stringify(errors)}`);
    await expectAnswer(url, "/echo", '400 {"error":"the body is not valid JSON"}', "(err.type is \"entity.parse.failed\")",
      "POST", "{oops");
    await expectAnswer(url, "/echo", '200 {"got":{"path":"/docs"}}', "", "POST", { path: "/docs" });
  });
  const out = run(L, "03_errors.ts");
  const expected = '200 {"id":"e1","path":"/pricing"}\n404 {"error":"no such event: e9"}\n500 {"error":"internal error"}\n' +
    '400 {"error":"the body is not valid JSON"}\n200 {"got":{"path":"/docs"}}\nserver log: Error: database is down';
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("04_fix_me.ts", async () => {
  const { app } = await load(() => import("../exercises/08/04_fix_me.ts"));
  await withApi(app, async (url) => {
    const one = await send(`${url}/notes/n1`);
    check(!one.startsWith("500"),
      "GET /notes/n1 answered 500. An error handler with 3 parameters runs for EVERY request: give it 4.");
    await expectAnswer(url, "/notes/n1", '200 {"id":"n1","text":"types vanish at runtime"}');
    const added = await send(`${url}/notes`, "POST", { text: "buy milk" });
    check(added.startsWith("201"), "POST /notes didn't create the note: req.body is undefined. Add app.use(express.json()).");
    await expectAnswer(url, "/notes", '400 {"error":"text must be a string"}', "", "POST", { text: 42 });
    await expectAnswer(url, "/crash", '500 {"error":"internal error"}', "(the error handler goes AFTER the routes)");
  });
  const out = run(L, "04_fix_me.ts");
  const expected = '201 {"id":"n2","text":"buy milk"}\n400 {"error":"text must be a string"}\n' +
    '200 {"id":"n1","text":"types vanish at runtime"}\n500 {"error":"internal error"}';
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("05_events_api.ts", async () => {
  const { app, readEvent, createEvent } = await load(() => import("../exercises/08/05_events_api.ts"));
  typeChecks(() => {
    // hint: createEvent's body slot: unknown. CreateEvent there is a claim that nobody checks.
    expectTypeOf<Parameters<typeof createEvent>[0]["body"]>().toEqualTypeOf<unknown>();
    // hint: readEvent(body: unknown): Result<CreateEvent>
    expectTypeOf(readEvent).toEqualTypeOf<(body: unknown) => Result<CreateEvent>>();
  });
  honest("05_events_api.ts");
  const good = { type: "click", path: "/pricing", userId: "u1" };
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const ok = readEvent(good);
  check(same(ok, { ok: true, value: good }), `readEvent(a good event) should be { ok: true, value: ... }. Got: ${JSON.stringify(ok)}`);
  const cases: [unknown, string][] = [
    [null, "the body must be a JSON object"],
    ["click", "the body must be a JSON object"],
    [{ type: 42 }, "type must be pageview, click or signup"],
    [{ type: "hover", path: "/", userId: "u1" }, "type must be pageview, click or signup"],
    [{ type: "click", userId: "u1" }, "path must be a string"],
    [{ type: "click", path: ["/"], userId: "u1" }, "path must be a string"],
    [{ type: "signup", path: "/" }, "userId must be a string"],
    [{ type: "signup", path: "/", userId: 7 }, "userId must be a string"],
  ];
  for (const [body, error] of cases) {
    const got = readEvent(body);
    check(same(got, { ok: false, error }), `readEvent(${JSON.stringify(body)}) should fail with "${error}". Got: ${JSON.stringify(got)}`);
  }
  const extra = readEvent({ ...good, id: "e99", admin: true });
  check(same(extra, { ok: true, value: good }),
    `Extra fields must not get in: readEvent({ ...good, id, admin }).value should be only type, path, userId. Got: ${JSON.stringify(extra)}`);
  await withApi(app, async (url) => {
    await expectAnswer(url, "/events", '400 {"error":"type must be pageview, click or signup"}', "", "POST", { type: 42 });
    const created = await send(`${url}/events`, "POST", { type: "signup", path: "/signup", userId: "u7" });
    const id = created.match(/^201 \{"id":"(e\d+)","type":"signup","path":"\/signup","userId":"u7"\}$/)?.[1];
    check(id !== undefined, `POST /events with a good event should answer 201 and the event with its id. Got: ${created.slice(0, 70)}`);
    await expectAnswer(url, `/events/${id}`, `200 {"id":"${id}","type":"signup","path":"/signup","userId":"u7"}`);
    await expectAnswer(url, "/events/e999", '404 {"error":"no such event"}');
    const listed = await send(`${url}/events?path=/sign`);
    check(listed.startsWith("200 [") && listed.includes(`"id":"${id}"`) && !listed.includes('"path":"/pricing"'),
      `GET /events?path=/sign should list only events whose path starts with /sign. Got: ${listed.slice(0, 70)}`);
    const twice = await send(`${url}/events?path=/a&path=/b`);
    check(twice.startsWith("200 ["), `GET /events?path=/a&path=/b should still answer 200 (not one string: use "/"). Got: ${twice.slice(0, 40)}`);
  });
  const out = run(L, "05_events_api.ts");
  const event1 = '{"id":"e1","type":"click","path":"/pricing","userId":"u1"}';
  const expected = `201 ${event1}\n400 {"error":"type must be pageview, click or signup"}\n400 {"error":"path must be a string"}\n` +
    '201 {"id":"e2","type":"pageview","path":"/docs","userId":"u2"}\n' +
    `200 ${event1}\n404 {"error":"no such event"}\n200 [${event1}]`;
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});
