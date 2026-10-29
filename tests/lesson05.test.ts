// Checks for lesson 05: Utility types (Partial, Required, Readonly, Pick, Omit, keyof, T[K], Record,
// ReturnType, Parameters, Awaited).
//
// Every test is named after its exercise file. `pnpm check 05` runs tsc on the lesson's files AND these tests:
//   - lines marked  // @ts-expect-error  must be type errors (if one isn't, the checker prints the text after it)
//   - a  // hint:  comment explains the type check on the next line, if that line fails
//   - check(condition, hint) tests what your program does
import { expectTypeOf, test } from "vitest";
import type { Draft, Settings } from "../exercises/05/01_partial.ts";
import type { PublicUser, UserCard } from "../exercises/05/02_pick_omit.ts";
import type { AppEvent as KeyEvent, EventType } from "../exercises/05/03_keyof.ts";
import type { Session, SessionOptions } from "../exercises/05/04_functions.ts";
import type { AppEvent, CreateEvent, EventStore, UpdateEvent } from "../exercises/05/06_events.ts";
import { check, code, load, run, show, typeChecks } from "./helpers.ts";

const L = "05";

/** No `any`, no `as`: the utility types have to do the work. */
function honest(file: string) {
  const src = code(L, file);
  check(!/\bany\b/.test(src), "There's still an `any` in your code. Write the real type instead.");
  check(!/\bas\s+[A-Za-z{[(]/.test(src), "Don't use `as`: it only tells TypeScript to trust you. Write the types instead.");
}

/** The right-hand side of `type <name> = ...;` in an exercise (without comments), or "" if it's not there. */
function definition(file: string, name: string): string {
  return code(L, file).match(new RegExp(`type\\s+${name}\\s*=\\s*([^;]*);`))?.[1] ?? "";
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

test("01_partial.ts", async () => {
  const { withDefaults, finish, DEFAULTS } = await load(() => import("../exercises/05/01_partial.ts"));
  typeChecks(() => {
    // hint: Needs Partial<Settings>, Readonly<Settings> and Required<Draft>: see steps 1-3.
    expectTypeOf(withDefaults).parameter(0).toEqualTypeOf<Partial<Settings>>();
    // @ts-expect-error Needs Partial<Settings>, Readonly<Settings> and Required<Draft>: see steps 1-3.
    DEFAULTS.port = 1;
    // hint: Needs Partial<Settings>, Readonly<Settings> and Required<Draft>: see steps 1-3.
    expectTypeOf(finish).returns.toEqualTypeOf<Required<Draft> | undefined>();
  });
  honest("01_partial.ts");
  const s = withDefaults({ port: 8080 });
  check(s.port === 8080, `withDefaults({ port: 8080 }).port should be 8080. Got: ${s.port}`);
  check(same(s, { port: 8080, host: "localhost", debug: false }),
    `withDefaults({ port: 8080 }) should be { port: 8080, host: "localhost", debug: false }. Got: ${JSON.stringify(s)}`);
  check(same(withDefaults({}), { port: 3000, host: "localhost", debug: false }), "withDefaults({}) should be exactly DEFAULTS.");
  check(DEFAULTS.port === 3000, "withDefaults changed DEFAULTS. Build a new object:  { ...DEFAULTS, ...overrides }");
  const done = finish({ email: "ana@example.com", name: "Ana" });
  check(same(done, { email: "ana@example.com", name: "Ana" }),
    `finish({ email: "ana@example.com", name: "Ana" }) should be that same draft. Got: ${JSON.stringify(done)}`);
  check(finish({ email: "ana@example.com" }) === undefined, "finish({ email: \"ana@example.com\" }) should be undefined: the name is missing.");
  check(finish({ name: "Ana" }) === undefined, "finish({ name: \"Ana\" }) should be undefined: the email is missing.");
  check(finish({}) === undefined, "finish({}) should be undefined.");
  const out = run(L, "01_partial.ts");
  const expected = "{ port: 8080, host: 'localhost', debug: false }\n{ email: 'ana@example.com', name: 'Ana' } undefined";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("02_pick_omit.ts", async () => {
  const { toPublic, toCard } = await load(() => import("../exercises/05/02_pick_omit.ts"));
  typeChecks(() => {
    // hint: PublicUser: Omit<User, "passwordHash">  ·  UserCard: Pick<User, "id" | "name">
    expectTypeOf<PublicUser>().toEqualTypeOf<{ id: string; name: string; email: string }>();
    // hint: PublicUser: Omit<User, "passwordHash">  ·  UserCard: Pick<User, "id" | "name">
    expectTypeOf<UserCard>().toEqualTypeOf<{ id: string; name: string }>();
  });
  honest("02_pick_omit.ts");
  const ana = { id: "u1", name: "Ana", email: "ana@example.com", passwordHash: "x9f2k1" };
  const pub = toPublic(ana);
  check(!("passwordHash" in pub), "toPublic(user) still has the passwordHash: it must never leave the server.");
  check(same(pub, { id: "u1", name: "Ana", email: "ana@example.com" }),
    `toPublic(ana) should be { id: "u1", name: "Ana", email: "ana@example.com" }. Got: ${JSON.stringify(pub)}`);
  check(ana.passwordHash === "x9f2k1", "toPublic changed the user it was given. Take the hash out of a copy:  const { passwordHash, ...rest } = user;");
  const card = toCard(ana);
  check(same(card, { id: "u1", name: "Ana" }), `toCard(ana) should be { id: "u1", name: "Ana" }, nothing else. Got: ${JSON.stringify(card)}`);
  check(/\bOmit\s*<\s*User\b/.test(definition("02_pick_omit.ts", "PublicUser")),
    "Write PublicUser with Omit:  Omit<User, \"passwordHash\">  (not a copy of the fields).");
  check(/\bPick\s*<\s*User\b/.test(definition("02_pick_omit.ts", "UserCard")),
    "Write UserCard with Pick:  Pick<User, \"id\" | \"name\">  (not a copy of the fields).");
  const out = run(L, "02_pick_omit.ts");
  const expected = "{ id: 'u1', name: 'Ana', email: 'ana@example.com' }\n{ id: 'u1', name: 'Ana' }";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("03_keyof.ts", async () => {
  const { countByType, pluck } = await load(() => import("../exercises/05/03_keyof.ts"));
  const events: KeyEvent[] = [
    { id: "e1", type: "click", path: "/a" },
    { id: "e2", type: "signup", path: "/b" },
    { id: "e3", type: "click", path: "/c" },
  ];
  typeChecks(() => {
    // hint: Needs AppEvent["type"], Record<EventType, number> and pluck<T, K extends keyof T>.
    expectTypeOf<EventType>().toEqualTypeOf<"pageview" | "click" | "signup">();
    // hint: Needs AppEvent["type"], Record<EventType, number> and pluck<T, K extends keyof T>.
    expectTypeOf(countByType(events)).toEqualTypeOf<Record<"pageview" | "click" | "signup", number>>();
    // hint: Needs AppEvent["type"], Record<EventType, number> and pluck<T, K extends keyof T>.
    expectTypeOf(pluck(events, "path")).toEqualTypeOf<string[]>();
    // @ts-expect-error Needs AppEvent["type"], Record<EventType, number> and pluck<T, K extends keyof T>.
    pluck(events, "pth");
  });
  honest("03_keyof.ts");
  const counts = countByType(events);
  check(same(counts, { pageview: 0, click: 2, signup: 1 }),
    `countByType(events) should count every type, with 0 for the missing ones. Got: ${JSON.stringify(counts)}`);
  check(same(countByType([]), { pageview: 0, click: 0, signup: 0 }), "countByType([]) should be { pageview: 0, click: 0, signup: 0 }.");
  check(same(pluck(events, "path"), ["/a", "/b", "/c"]), `pluck(events, "path") should be ["/a", "/b", "/c"]. Got: ${JSON.stringify(pluck(events, "path"))}`);
  check(same(pluck([{ n: 1 }, { n: 2 }], "n"), [1, 2]), "pluck([{ n: 1 }, { n: 2 }], \"n\") should be [1, 2].");
  check(/AppEvent\s*\[\s*["']type["']\s*\]/.test(definition("03_keyof.ts", "EventType")),
    "Write EventType as AppEvent[\"type\"], so it follows the model (not a copy of the three strings).");
  const out = run(L, "03_keyof.ts");
  const expected = "{ pageview: 2, click: 1, signup: 0 }\n[ '/', '/pricing', '/' ]";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("04_functions.ts", async () => {
  const { longer, describe } = await load(() => import("../exercises/05/04_functions.ts"));
  typeChecks(() => {
    // hint: SessionOptions should be the type of createSession's first parameter.
    expectTypeOf<SessionOptions>().toEqualTypeOf<{ userId: string; minutes: number }>();
    // hint: Session should be what createSession gives you after await: { id; userId; expires }.
    expectTypeOf<Session>().toEqualTypeOf<{ id: string; userId: string; expires: number }>();
  });
  honest("04_functions.ts");
  const options = { userId: "u1", minutes: 30 };
  const l = longer(options);
  check(l.minutes === 60, `longer({ userId: "u1", minutes: 30 }).minutes should be 60. Got: ${l.minutes}`);
  check(l.userId === "u1", "longer should keep the userId.");
  check(options.minutes === 30, "longer changed the options it was given. Return a new object:  { ...options, minutes: ... }");
  const text = describe({ id: "s-u2", userId: "u2", expires: 120 });
  check(text === "u2 until 120", `describe({ id: "s-u2", userId: "u2", expires: 120 }) should be "u2 until 120". Got: ${JSON.stringify(text)}`);
  check(/Parameters\s*<\s*typeof\s+createSession\s*>\s*\[\s*0\s*\]/.test(definition("04_functions.ts", "SessionOptions")),
    "SessionOptions is still a copy. Get it from the function:  Parameters<typeof createSession>[0]");
  check(/Awaited\s*<\s*ReturnType\s*<\s*typeof\s+createSession\s*>\s*>/.test(definition("04_functions.ts", "Session")),
    "Session is still a copy. Get it from the function:  Awaited<ReturnType<typeof createSession>>");
  const out = run(L, "04_functions.ts");
  check(out === "u1 until 3600", `Expected:\nu1 until 3600\nGot:\n${show(out)}`);
});

test("05_fix_me.ts", async () => {
  const { withPlan, createUser } = await load(() => import("../exercises/05/05_fix_me.ts"));
  honest("05_fix_me.ts");
  check(/\bOmit\s*<\s*User\b/.test(definition("05_fix_me.ts", "NewUser")),
    "NewUser is a copy without the plan. Derive it: Omit<User, \"id\">, then run tsc.");
  check(/\bRecord\s*<\s*(Plan|User\s*\[\s*["']plan["']\s*\])\s*,/.test(code(L, "05_fix_me.ts").match(/planNames\s*:\s*([^=]*)=/)?.[1] ?? ""),
    "planNames accepts any key. Give it the plans as keys:  Record<Plan, string>");
  const user = createUser(JSON.stringify({ name: "Ines", passwordHash: "k3k3", plan: "free" }));
  const before = JSON.stringify(user);
  const up = withPlan(user, "pro");
  check(up.plan === "pro", `withPlan(user, "pro") should return the user on the pro plan. Got: ${JSON.stringify(up.plan)}`);
  check(JSON.stringify(user) === before, "withPlan changed the user it was given. Return a copy:  { ...user, plan }");
  const expected = "Ana Pro\nMert Free\nupgraded: Pro, before: Free";
  const out = run(L, "05_fix_me.ts");
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}` +
    (out.includes("undefined") ? "\nAn undefined: a plan nobody sent, or a plan without a name. Derive the types, then run tsc." : ""));
});

test("06_events.ts", async () => {
  const { addEvent, editEvent } = await load(() => import("../exercises/05/06_events.ts"));
  typeChecks(() => {
    // hint: CreateEvent: Omit<AppEvent, "id" | "createdAt">, UpdateEvent: Partial<CreateEvent>
    expectTypeOf<CreateEvent>().toEqualTypeOf<Omit<AppEvent, "id" | "createdAt">>();
    // hint: CreateEvent: Omit<AppEvent, "id" | "createdAt">, UpdateEvent: Partial<CreateEvent>
    expectTypeOf<UpdateEvent>().toEqualTypeOf<Partial<Omit<AppEvent, "id" | "createdAt">>>();
    const store: EventStore = new Map();
    // @ts-expect-error CreateEvent: Omit<AppEvent, "id" | "createdAt">, UpdateEvent: Partial<CreateEvent>
    editEvent(store, "e1", { id: "e2" });
  });
  honest("06_events.ts");
  const store: EventStore = new Map();
  const now = new Date(0);
  const e1 = addEvent(store, { type: "click", path: "/a", userId: "u7" }, now);
  check(e1.id === "e1", `The first event should get the id "e1". Got: ${JSON.stringify(e1.id)}`);
  check(e1.type === "click" && e1.path === "/a" && e1.userId === "u7",
    `addEvent should keep the fields of the input. Got: ${JSON.stringify(e1)}`);
  check(e1.createdAt === now, "createdAt should be the `now` it was given.");
  check(store.get("e1") === e1, "addEvent should put the new event in the store:  store.set(event.id, event)");
  const e2 = addEvent(store, { type: "pageview", path: "/b", userId: "u7" }, now);
  check(e2.id === "e2", `The second event should get the id "e2". Got: ${JSON.stringify(e2.id)}`);
  const changed = editEvent(store, "e1", { path: "/z" });
  check(changed?.path === "/z" && changed.type === "click" && changed.id === "e1",
    `editEvent(store, "e1", { path: "/z" }) should change only the path. Got: ${JSON.stringify(changed)}`);
  check(store.get("e1")?.path === "/z", "editEvent should store the changed event again.");
  check(editEvent(store, "e9", { path: "/" }) === undefined, "editEvent with an id that isn't in the store should return undefined.");
  check(/\bOmit\s*<\s*AppEvent\b/.test(definition("06_events.ts", "CreateEvent")),
    "Derive CreateEvent from AppEvent with Omit (not a copy of the fields).");
  check(/\bPartial\s*</.test(definition("06_events.ts", "UpdateEvent")),
    "Derive UpdateEvent with Partial (not a copy of the fields).");
  const out = run(L, "06_events.ts");
  const expected = "created: e1 pageview /docs\ncreated: e2 click /pricing\nupdated: e2 click /signup\nnot found: e9";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});
