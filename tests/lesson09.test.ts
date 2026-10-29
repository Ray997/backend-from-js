// Checks for lesson 09: Zod (schemas, parse and safeParse, issues, z.infer, coerce, default and transform for
// query strings, and why a type written next to a schema drifts away from it).
//
// Every test is named after its exercise file. `pnpm check 09` runs tsc on the lesson's files AND these tests:
//   - lines marked  // @ts-expect-error  must be type errors (if one isn't, the checker prints the text after it)
//   - a  // hint:  comment explains the type check on the next line, if that line fails
//   - check(condition, hint) tests what your program does
// The API tests start your app on a free port of your own machine (localhost) and send it real requests.
import { expectTypeOf, test } from "vitest";
import type { Signup } from "../exercises/09/01_schemas.ts";
import type { Order, Result } from "../exercises/09/02_safe_parse.ts";
import type { Search, SearchInput } from "../exercises/09/03_query.ts";
import type { AppEvent, CreateEvent } from "../exercises/09/05_events_api.ts";
import { send, serve } from "../exercises/09/lib/serve.ts";
import { check, code, load, run, show, typeChecks } from "./helpers.ts";

const L = "09";

/** No `any`, no `as`. */
function honest(file: string) {
  const src = code(L, file);
  check(!/\bany\b/.test(src), "There's still an `any` in your code. Give it a real type, or unknown.");
  check(!/\bas\s+[A-Za-z{[(]/.test(src), "Don't use `as`: it only tells TypeScript to trust you. Let the schema check the value.");
}

/** The type must come from the schema: `type <name> = z.infer<typeof <schema>>` (or z.output / z.input). */
function derived(file: string, name: string, schema: string, kind = "infer|output") {
  const right = code(L, file).match(new RegExp(`type\\s+${name}\\s*=\\s*([^;]*);`))?.[1] ?? "";
  check(new RegExp(`^z\\.(${kind})<\\s*typeof\\s+${schema}\\s*>$`).test(right.trim()),
    `Make ${name} from the schema:  type ${name} = z.${kind.split("|")[0]}<typeof ${schema}>;`);
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
  const shown = got.length > 90 ? `${got.slice(0, 90)}...` : got;
  check(got === want, `${method} ${path} should answer ${want.length > 90 ? `${want.slice(0, 90)}...` : want}. Got: ${shown}${hint ? `  ${hint}` : ""}`);
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

test("01_schemas.ts", async () => {
  const { SignupSchema, firstSignup, isValid } = await load(() => import("../exercises/09/01_schemas.ts"));
  typeChecks(() => {
    // hint: Signup: z.infer<typeof SignupSchema>, with email, name, age, plan
    expectTypeOf<Signup>().toEqualTypeOf<{ email: string; name: string; age: number; plan: "free" | "pro" }>();
  });
  honest("01_schemas.ts");
  derived("01_schemas.ts", "Signup", "SignupSchema");
  const ana = { email: "ana@example.com", name: "Ana", age: 30, plan: "pro" };
  check(same(firstSignup, ana),
    `firstSignup should be SignupSchema.parse(...): ${JSON.stringify(ana)} (without admin). Got: ${JSON.stringify(firstSignup)}`);
  check(SignupSchema.safeParse(ana).success, "SignupSchema should accept Ana: " + JSON.stringify(ana));
  const no: [unknown, string][] = [
    [{ ...ana, email: "ana" }, "an email that isn't an email address (z.email())"],
    [{ ...ana, name: "" }, "an empty name (.min(1))"],
    [{ ...ana, age: 12 }, "age 12 (.min(13))"],
    [{ ...ana, age: 13.5 }, "age 13.5 (.int())"],
    [{ ...ana, age: "30" }, 'age "30", a string'],
    [{ ...ana, plan: "team" }, 'plan "team" (only "free" or "pro")'],
    [{ email: "ana@example.com", name: "Ana", age: 30 }, "a signup without a plan"],
  ];
  for (const [data, what] of no) check(!SignupSchema.safeParse(data).success, `SignupSchema should reject ${what}.`);
  check(isValid(ana) === true, "isValid(a good signup) should be true: SignupSchema.safeParse(data).success");
  check(isValid({ ...ana, age: 12 }) === false && isValid(null) === false && isValid("ana") === false,
    "isValid should be false for a bad signup, for null and for a string (and it must never throw).");
  const out = run(L, "01_schemas.ts");
  const expected = "{ email: 'ana@example.com', name: 'Ana', age: 30, plan: 'pro' }\ntrue false false false";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("02_safe_parse.ts", async () => {
  const { readOrder, countIssues, OrderSchema } = await load(() => import("../exercises/09/02_safe_parse.ts"));
  typeChecks(() => {
    // hint: Order: z.infer<typeof OrderSchema>, with items (sku, qty) and coupon?
    expectTypeOf<Order>().toEqualTypeOf<{ items: { sku: string; qty: number }[]; coupon?: string | undefined }>();
    // hint: readOrder(body: unknown): Result<Order>
    expectTypeOf(readOrder).toEqualTypeOf<(body: unknown) => Result<Order>>();
  });
  honest("02_safe_parse.ts");
  derived("02_safe_parse.ts", "Order", "OrderSchema");
  check(OrderSchema.safeParse({ items: [{ sku: "tee", qty: 1 }] }).success, "OrderSchema should accept { items: [{ sku: \"tee\", qty: 1 }] } (coupon is optional).");
  const cases: [unknown, unknown][] = [
    [{ items: [{ sku: "tee", qty: 2 }], coupon: "HI" }, { ok: true, value: { items: [{ sku: "tee", qty: 2 }], coupon: "HI" } }],
    [{ items: [{ sku: "tee", qty: 2 }], extra: 1 }, { ok: true, value: { items: [{ sku: "tee", qty: 2 }] } }],
    [{ items: [{ sku: "tee", qty: 2 }, { sku: "mug", qty: 0 }] }, { ok: false, errors: ["items.1.qty: Too small: expected number to be >0"] }],
    [{ items: [{ sku: "tee", qty: 1.5 }] }, { ok: false, errors: ["items.0.qty: Invalid input: expected int, received number"] }],
    [{ items: [] }, { ok: false, errors: ["items: an order needs at least one item"] }],
    [{ items: [{ sku: "tee", qty: 1 }], coupon: 10 }, { ok: false, errors: ["coupon: Invalid input: expected string, received number"] }],
    ["two mugs", { ok: false, errors: ["body: Invalid input: expected object, received string"] }],
    [null, { ok: false, errors: ["body: Invalid input: expected object, received null"] }],
  ];
  for (const [body, want] of cases) {
    const got = readOrder(body);
    check(same(got, want), `readOrder(${JSON.stringify(body)}) should be ${JSON.stringify(want)}. Got: ${JSON.stringify(got)}`);
  }
  check(countIssues({ items: [{ sku: "mug", qty: 1 }] }) === 0, "countIssues(a good order) should be 0.");
  let threw: unknown = undefined;
  let count = -1;
  try {
    count = countIssues({ items: [{ sku: 7, qty: 1.5 }] });
  } catch (error) {
    threw = error;
  }
  check(threw === undefined, "countIssues threw a ZodError. Catch it: if (error instanceof z.ZodError) return error.issues.length;");
  check(count === 2, `countIssues({ items: [{ sku: 7, qty: 1.5 }] }) should be 2 (two issues). Got: ${count}`);
  check(/\.parse\(/.test(code(L, "02_safe_parse.ts")) && /instanceof\s+z\.ZodError/.test(code(L, "02_safe_parse.ts")),
    "countIssues should use parse (not safeParse), in a try/catch, and narrow with  instanceof z.ZodError.");
  const out = run(L, "02_safe_parse.ts");
  const expected = '{"ok":true,"value":{"items":[{"sku":"tee","qty":2}],"coupon":"HELLO10"}}\n' +
    '{"ok":false,"errors":["items.1.qty: Too small: expected number to be >0"]}\n' +
    '{"ok":false,"errors":["items: an order needs at least one item"]}\n' +
    '{"ok":false,"errors":["body: Invalid input: expected object, received string"]}\n0 2';
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("03_query.ts", async () => {
  const { app, SearchQuerySchema } = await load(() => import("../exercises/09/03_query.ts"));
  typeChecks(() => {
    // hint: Search: z.infer<typeof SearchQuerySchema>, what comes OUT (page: number)
    expectTypeOf<Search>().toEqualTypeOf<{ q: string; page: number; tags: string[] }>();
    // hint: SearchInput: z.input<typeof SearchQuerySchema>, what goes IN
    expectTypeOf<SearchInput["tags"]>().toEqualTypeOf<string | undefined>();
  });
  honest("03_query.ts");
  derived("03_query.ts", "Search", "SearchQuerySchema");
  derived("03_query.ts", "SearchInput", "SearchQuerySchema", "input");
  const got = SearchQuerySchema.safeParse({ q: " zod ", page: "3", tags: "a,b" });
  check(got.success && same(got.data, { q: "zod", page: 3, tags: ["a", "b"] }),
    `SearchQuerySchema.parse({ q: " zod ", page: "3", tags: "a,b" }) should be { q: "zod", page: 3, tags: ["a","b"] }. Got: ${JSON.stringify(got.data ?? got.error?.issues[0]?.message)}  (trim, coerce, transform)`);
  const bare = SearchQuerySchema.safeParse({ q: "zod" });
  check(bare.success && same(bare.data, { q: "zod", page: 1, tags: [] }),
    `Without page and tags, the defaults: { q: "zod", page: 1, tags: [] }. Got: ${JSON.stringify(bare.data ?? bare.error?.issues[0]?.message)}  (.default(...))`);
  await withApi(app, async (url) => {
    await expectAnswer(url, "/search?q=ts&page=2&tags=api,zod", '200 {"q":"ts","page":2,"tags":["api","zod"]}');
    await expectAnswer(url, "/search?q=ts", '200 {"q":"ts","page":1,"tags":[]}', "(the defaults)");
    await expectAnswer(url, "/search?q=ts&page=two",
      '400 {"error":"invalid query","issues":["page: Invalid input: expected number, received NaN"]}', "(z.coerce.number())");
    await expectAnswer(url, "/search?q=ts&page=1.5",
      '400 {"error":"invalid query","issues":["page: Invalid input: expected int, received number"]}', "(.int())");
    await expectAnswer(url, "/search?page=2",
      '400 {"error":"invalid query","issues":["q: Invalid input: expected string, received undefined"]}', "(q is required)");
  });
  const out = run(L, "03_query.ts");
  const expected = '/search?q=%20zod%20&page=2&tags=ts,api 200 {"q":"zod","page":2,"tags":["ts","api"]}\n' +
    '/search?q=zod 200 {"q":"zod","page":1,"tags":[]}\n' +
    '/search?q=zod&page=two 400 {"error":"invalid query","issues":["page: Invalid input: expected number, received NaN"]}\n' +
    '/search?q=%20&page=0 400 {"error":"invalid query","issues":["q: Too small: expected string to have >=1 characters","page: Too small: expected number to be >=1"]}';
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("04_fix_me.ts", async () => {
  const { app } = await load(() => import("../exercises/09/04_fix_me.ts"));
  await withApi(app, async (url) => {
    const listed = await send(`${url}/signups?limit=1`);
    check(!listed.startsWith("500"),
      "GET /signups?limit=1 answered 500: check query.success before you use query.data.");
    check(!listed.startsWith("400"),
      `GET /signups?limit=1 answered ${listed.slice(0, 90)}  A URL is text: "1" is a string. Use z.coerce.number().`);
    await expectAnswer(url, "/signups?limit=1", '200 [{"email":"ana@example.com","plan":"pro"}]');
    await expectAnswer(url, "/signups?limit=0", '400 {"error":"invalid query","issues":["limit: Too small: expected number to be >=1"]}');
    const bad = await send(`${url}/signups`, "POST", { email: "mert", plan: "pro" });
    check(!bad.startsWith("500"),
      "A bad body (an email that isn't one) answered 500: parse threw a ZodError. Use safeParse, and answer 400 with the issues.");
    await expectAnswer(url, "/signups", '400 {"error":"invalid body","issues":["email: Invalid email address"]}', "", "POST",
      { email: "mert", plan: "pro" });
    const team = await send(`${url}/signups`, "POST", { email: "eda@example.com", plan: "team" });
    check(team.startsWith("201"),
      `A "team" signup was rejected: ${team.slice(0, 90)}  The hand-written Signup type has "team", the schema doesn't. Make the type from the schema (z.infer) and add "team" there.`);
  });
  const src = code(L, "04_fix_me.ts");
  check(/type\s+Signup\s*=\s*z\.infer<\s*typeof\s+SignupSchema\s*>/.test(src),
    "Signup is still written by hand, so it can drift from SignupSchema again:  type Signup = z.infer<typeof SignupSchema>;");
  const out = run(L, "04_fix_me.ts");
  const expected = '201 {"email":"mert@example.com","plan":"team"}\n400 {"error":"invalid body","issues":["email: Invalid email address"]}\n' +
    '200 [{"email":"ana@example.com","plan":"pro"}]\n400 {"error":"invalid query","issues":["limit: Too small: expected number to be >=1"]}';
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("05_events_api.ts", async () => {
  const { app, CreateEventSchema, ListQuerySchema, issuesOf, createEvent } = await load(() => import("../exercises/09/05_events_api.ts"));
  typeChecks(() => {
    // hint: CreateEvent: z.infer<typeof CreateEventSchema>, with type, path, userId, amount?
    expectTypeOf<CreateEvent>().toEqualTypeOf<{ type: "pageview" | "click" | "signup" | "purchase"; path: string; userId: string; amount?: number | undefined }>();
    // hint: AppEvent = CreateEvent & { id: string }
    expectTypeOf<AppEvent["id"]>().toEqualTypeOf<string>();
    // hint: createEvent's body slot: unknown (the schema checks it)
    expectTypeOf<Parameters<typeof createEvent>[0]["body"]>().toEqualTypeOf<unknown>();
  });
  honest("05_events_api.ts");
  derived("05_events_api.ts", "CreateEvent", "CreateEventSchema");
  const purchase = { type: "purchase", path: "/checkout", userId: "u2", amount: 49 };
  check(same(CreateEventSchema.safeParse(purchase).data, purchase), "CreateEventSchema should accept a purchase with an amount: " + JSON.stringify(purchase));
  check(!CreateEventSchema.safeParse({ ...purchase, amount: 0 }).success, "amount must be above 0 (.positive()).");
  check(!CreateEventSchema.safeParse({ ...purchase, type: "hover" }).success, 'type "hover" should be rejected.');
  const q = ListQuerySchema.safeParse({ limit: "3" });
  check(q.success && same(q.data, { path: "/", limit: 3 }),
    `ListQuerySchema.parse({ limit: "3" }) should be { path: "/", limit: 3 }. Got: ${JSON.stringify(q.data ?? q.error?.issues[0]?.message)}`);
  check(!ListQuerySchema.safeParse({ limit: "101" }).success && !ListQuerySchema.safeParse({ limit: "0" }).success,
    "limit must be from 1 to 100.");
  const err = CreateEventSchema.safeParse({ type: "click", path: 1, userId: "u1" }).error;
  check(err !== undefined && same(issuesOf(err), ["path: Invalid input: expected string, received number"]),
    `issuesOf should give one "<path>: <message>" per issue. Got: ${JSON.stringify(err && issuesOf(err))}`);
  await withApi(app, async (url) => {
    await expectAnswer(url, "/events", '400 {"error":"invalid body","issues":["type: Invalid option: expected one of \\"pageview\\"|\\"click\\"|\\"signup\\"|\\"purchase\\"","path: Invalid input: expected string, received undefined","userId: Invalid input: expected string, received undefined"]}',
      "", "POST", { type: 42 });
    const created = await send(`${url}/events`, "POST", { ...purchase, admin: true });
    const id = created.match(/^201 \{"id":"(e\d+)","type":"purchase","path":"\/checkout","userId":"u2","amount":49\}$/)?.[1];
    check(id !== undefined, `POST /events with a purchase should answer 201 and the event (with its id, without admin). Got: ${created.slice(0, 90)}`);
    await expectAnswer(url, `/events/${id}`, `200 {"id":"${id}","type":"purchase","path":"/checkout","userId":"u2","amount":49}`);
    await expectAnswer(url, "/events/e999", '404 {"error":"no such event"}');
    await send(`${url}/events`, "POST", { type: "click", path: "/pricing", userId: "u1" });
    await send(`${url}/events`, "POST", { type: "click", path: "/pricing", userId: "u3" });
    const pricing = await send(`${url}/events?path=/pri&limit=1`);
    check(pricing.startsWith("200 [") && (pricing.match(/"id"/g) ?? []).length === 1 && pricing.includes('"path":"/pricing"'),
      `GET /events?path=/pri&limit=1 should list ONE event, with path /pricing. Got: ${pricing.slice(0, 90)}`);
    const all = await send(`${url}/events`);
    const count = (all.match(/"id"/g) ?? []).length;
    check(all.startsWith("200 [") && count >= 3 && count <= 10, `GET /events should list every event, at most 10 (the default limit). Got: ${all.slice(0, 60)}`);
    const two = await send(`${url}/events?limit=2`);
    check(two.startsWith("200 [") && (two.match(/"id"/g) ?? []).length === 2, `GET /events?limit=2 should list 2 events. Got: ${two.slice(0, 60)}`);
    await expectAnswer(url, "/events?limit=abc", '400 {"error":"invalid query","issues":["limit: Invalid input: expected number, received NaN"]}');
    await expectAnswer(url, "/events?path=/a&path=/b", '400 {"error":"invalid query","issues":["path: Invalid input: expected string, received array"]}',
      "(two paths: an array)");
  });
  const out = run(L, "05_events_api.ts");
  const e1 = '{"id":"e1","type":"click","path":"/pricing","userId":"u1"}';
  const expected = `201 ${e1}\n400 {"error":"invalid body","issues":["path: Invalid input: expected string, received number"]}\n` +
    '201 {"id":"e2","type":"purchase","path":"/checkout","userId":"u2","amount":49}\n' +
    '400 {"error":"invalid body","issues":["amount: Invalid input: expected number, received string"]}\n' +
    '201 {"id":"e3","type":"pageview","path":"/docs","userId":"u3"}\n' +
    `200 ${e1}\n404 {"error":"no such event"}\n200 [${e1}]\n200 2\n` +
    '400 {"error":"invalid query","issues":["limit: Invalid input: expected number, received NaN"]}';
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});
