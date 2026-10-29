// Checks for lesson 02: Narrowing and discriminated unions.
//
// Every test is named after its exercise file. `pnpm check 02` runs tsc on the lesson's files AND these tests:
//   - lines marked  // @ts-expect-error  must be type errors (if one isn't, the checker prints the text after it)
//   - a  // hint:  comment explains the type check on the next line, if that line fails
//   - check(condition, hint) tests what your program does
import { expectTypeOf, test } from "vitest";
import type { AppEvent, Click, ErrorReport, PageView } from "../exercises/02/05_events.ts";
import type { AppEvent as AppEvent6 } from "../exercises/02/06_never.ts";
import { check, code, load, run, show, typeChecks } from "./helpers.ts";

const L = "02";

/** No `any`, no `as` (and optionally no `!` after a value): narrowing has to do the work. */
function honest(file: string, { bang = false } = {}) {
  const src = code(L, file);
  check(!/\bany\b/.test(src), "There's still an `any` in your code. Narrow the type with a check instead.");
  check(!/\bas\s+[A-Za-z{[(]/.test(src), "Don't use `as`: it only tells TypeScript to trust you. Narrow the type with a check instead.");
  if (bang) check(!/[\w)\]]!(?!=)/.test(src), "Don't use `!` after a value: it only tells TypeScript to trust you. Check for null instead.");
}

test("01_typeof.ts", async () => {
  const { formatId, toList } = await load(() => import("../exercises/02/01_typeof.ts"));
  typeChecks(() => {
    // hint: Keep the parameter type:  formatId(id: string | number): string
    expectTypeOf(formatId).parameter(0).toEqualTypeOf<string | number>();
    // hint: Keep the parameter type:  toList(tags: string | string[]): string[]
    expectTypeOf(toList).parameter(0).toEqualTypeOf<string | string[]>();
  });
  honest("01_typeof.ts");
  for (const [input, expected] of [[" ab12 ", "AB12"], ["x9", "X9"], [42, "#00042"], [123456, "#123456"]] as const) {
    const got = formatId(input);
    check(got === expected, `formatId(${JSON.stringify(input)}) should return "${expected}". Got: ${JSON.stringify(got)}`);
  }
  const a = toList("a, b,c");
  check(JSON.stringify(a) === '["a","b","c"]', `toList("a, b,c") should return ["a", "b", "c"] (every tag trimmed). Got: ${JSON.stringify(a)}`);
  const b = toList(["x", "y"]);
  check(JSON.stringify(b) === '["x","y"]', `toList(["x", "y"]) should return the same list. Got: ${JSON.stringify(b)}`);
});

test("02_null.ts", async () => {
  const { pageFrom, greeting } = await load(() => import("../exercises/02/02_null.ts"));
  typeChecks(() => {
    // hint: Keep the parameter type:  greeting(name: string | null | undefined): string
    expectTypeOf(greeting).parameter(0).toEqualTypeOf<string | null | undefined>();
  });
  honest("02_null.ts", { bang: true });
  for (const [query, expected] of [["page=3", 3], ["page=12", 12], ["", 1], ["q=shoes", 1]] as const) {
    const got = pageFrom(new URLSearchParams(query));
    check(got === expected, `pageFrom(new URLSearchParams("${query}")) should return ${expected}. Got: ${got}` +
      (expected === 1 && got === 0 ? "\nA missing page is null, and Number(null) is 0. Check for null first." : ""));
  }
  for (const [name, expected] of [["Ada", "Hello, Ada"], ["  Ada ", "Hello, Ada"], [null, "Hello, guest"],
    [undefined, "Hello, guest"], ["   ", "Hello, guest"], ["", "Hello, guest"]] as const) {
    const got = greeting(name);
    check(got === expected, `greeting(${JSON.stringify(name) ?? "undefined"}) should return "${expected}". Got: ${JSON.stringify(got)}`);
  }
});

test("03_in.ts", async () => {
  const { describePayment } = await load(() => import("../exercises/02/03_in.ts"));
  honest("03_in.ts");
  const card = describePayment({ cardNumber: "4111111111114242", expires: "09/29" });
  check(card === "card ending in 4242", `A card should be "card ending in 4242". Got: ${JSON.stringify(card)}`);
  const other = describePayment({ cardNumber: "5500000000000004", expires: "01/30" });
  check(other === "card ending in 0004", `The card 5500000000000004 should be "card ending in 0004". Got: ${JSON.stringify(other)}`);
  let bank: string;
  try {
    bank = describePayment({ iban: "TR330006100519786457841326" });
  } catch (error) {
    throw new Error(`describePayment crashed on a bank transfer: ${String(error).split("\n")[0]}\nA BankTransfer has no cardNumber. Check  "iban" in payment  first.`);
  }
  check(bank === "bank transfer from TR33", `A bank transfer should be "bank transfer from TR33". Got: ${JSON.stringify(bank)}`);
});

test("04_fix_me.ts", async () => {
  const { isPricingView, urlOf, cartSize, itemsLabel } = await load(() => import("../exercises/02/04_fix_me.ts"));
  honest("04_fix_me.ts");
  check(isPricingView({ type: "pageview", url: "/pricing" }) === true, "isPricingView of a page view of /pricing should be true.");
  check(isPricingView({ type: "pageview", url: "/" }) === false, "isPricingView of a page view of / should be false.");
  check(isPricingView({ type: "click", x: 1, y: 2 }) === false, "isPricingView of a click should be false.");
  check(urlOf({ type: "click", x: 1, y: 2 }) === "", `urlOf a click should be "" (a click has no url). Got: ${JSON.stringify(urlOf({ type: "click", x: 1, y: 2 }))}`);
  check(cartSize("coffee,bagel") === 2, `cartSize("coffee,bagel") should be 2. Got: ${cartSize("coffee,bagel")}`);
  check(itemsLabel(0) === "0 items", `itemsLabel(0) should be "0 items": an empty cart is still a cart. Got: "${itemsLabel(0)}"\n!count is true for 0 too. Compare with null instead.`);
  check(itemsLabel(2) === "2 items", `itemsLabel(2) should be "2 items". Got: "${itemsLabel(2)}"`);
  const expected = "true\n/pricing\n3\n0 items\nno cart yet";
  const out = run(L, "04_fix_me.ts");
  check(out === expected, `It runs now, but the output is different.\nExpected:\n${expected}\nGot:\n${show(out)}`);
});

test("05_events.ts", async () => {
  const { describe, countByType } = await load(() => import("../exercises/02/05_events.ts"));
  typeChecks(() => {
    // hint: Click should be  { type: "click"; x: number; y: number }  ("click" is a literal type: only that text)
    expectTypeOf<Click>().toEqualTypeOf<{ type: "click"; x: number; y: number }>();
    // hint: PageView should be  { type: "pageview"; url: string }
    expectTypeOf<PageView>().toEqualTypeOf<{ type: "pageview"; url: string }>();
    // hint: ErrorReport should be  { type: "error"; message: string }
    expectTypeOf<ErrorReport>().toEqualTypeOf<{ type: "error"; message: string }>();
    // hint: AppEvent should be the union of the three:  Click | PageView | ErrorReport
    expectTypeOf<AppEvent>().toEqualTypeOf<{ type: "click"; x: number; y: number } | { type: "pageview"; url: string } | { type: "error"; message: string }>();
    // @ts-expect-error { type: "click", url: "/" } should be a type error: a click has x and y, no url. Write the types.
    const wrongShape: AppEvent = { type: "click", url: "/" };
    // @ts-expect-error { type: "scroll" } should be a type error: AppEvent has only click, pageview and error.
    const wrongType: AppEvent = { type: "scroll" };
  });
  honest("05_events.ts");
  check(/\bswitch\s*\(\s*e\.type\s*\)/.test(code(L, "05_events.ts")), "Use a switch on e.type in describe:  switch (e.type) { case \"click\": ... }");
  const cases = [
    [{ type: "click", x: 120, y: 48 }, "click at 120, 48"],
    [{ type: "click", x: 0, y: 7 }, "click at 0, 7"],
    [{ type: "pageview", url: "/pricing" }, "view of /pricing"],
    [{ type: "error", message: "payment failed" }, "error: payment failed"],
  ] as const;
  for (const [event, expected] of cases) {
    const got = describe(event);
    check(got === expected, `describe(${JSON.stringify(event)}) should return "${expected}". Got: ${JSON.stringify(got)}`);
  }
  const counts = countByType([{ type: "error", message: "a" }, { type: "click", x: 1, y: 1 }, { type: "error", message: "b" }]);
  check(JSON.stringify(counts) === '{"click":1,"pageview":0,"error":2}',
    `countByType of 1 click and 2 errors should be { click: 1, pageview: 0, error: 2 }. Got: ${JSON.stringify(counts)}`);
  const out = run(L, "05_events.ts");
  const expected = "view of /pricing\nclick at 120, 48\nerror: payment failed\nview of /checkout\n{ click: 1, pageview: 2, error: 1 }";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("06_never.ts", async () => {
  const { assertNever, describe } = await load(() => import("../exercises/02/06_never.ts"));
  typeChecks(() => {
    // @ts-expect-error assertNever("oops") should be a type error: give x the type never.
    assertNever("oops");
    // hint: assertNever never returns (it throws), so its return type is never:  assertNever(x: never): never
    const returnsNever: [typeof assertNever extends (x: never) => infer R ? R : unknown] extends [never] ? true : false = true;
    // hint: describe should return a string for every event. Add  default: return assertNever(e);  and the case tsc then finds.
    expectTypeOf(describe).returns.toEqualTypeOf<string>();
  });
  honest("06_never.ts");
  check(/\bdefault\s*:[\s\S]*assertNever\(\s*e\s*\)/.test(code(L, "06_never.ts")),
    "Add a default branch at the end of the switch:  default: return assertNever(e);");
  const signup: AppEvent6 = { type: "signup", plan: "pro" };
  check(describe(signup) === "signup: pro plan", `describe({ type: "signup", plan: "pro" }) should return "signup: pro plan". Got: ${JSON.stringify(describe(signup))}`);
  check(describe({ type: "error", message: "x" }) === "error: x", "describe of an error should still work: \"error: x\".");
  // At runtime the types are gone: an event nobody expected must make assertNever throw, loudly.
  const unexpected: unknown = JSON.parse('{ "type": "scroll" }');
  let thrown: unknown;
  try {
    assertNever(unexpected as never);
  } catch (error) {
    thrown = error;
  }
  check(thrown instanceof Error, "assertNever should throw an Error:  throw new Error(`Unhandled event: ${JSON.stringify(x)}`);");
  check(thrown.message === 'Unhandled event: {"type":"scroll"}',
    `assertNever({ type: "scroll" }) should throw "Unhandled event: {\\"type\\":\\"scroll\\"}". Got: "${thrown.message}"`);
  const out = run(L, "06_never.ts");
  check(out === "click at 120, 48\nsignup: pro plan", `Expected:\nclick at 120, 48\nsignup: pro plan\nGot:\n${show(out)}`);
});
