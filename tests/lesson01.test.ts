// Checks for lesson 01: Why TypeScript exists.
//
// Every test is named after its exercise file. `pnpm check 01` runs tsc on the lesson's files AND these tests:
//   - lines marked  // @ts-expect-error  must be type errors (if one isn't, the checker prints the text after it)
//   - a  // hint:  comment explains the type check on the next line, if that line fails
//   - check(condition, hint) tests what your program does
import { expectTypeOf, test } from "vitest";
import type { City, Country, Open, User, Visits } from "../exercises/01/02_inference.ts";
import { check, code, load, run, show, source, typeChecks } from "./helpers.ts";

const L = "01";

test("01_annotate.ts", async () => {
  const { fullName, priceWithVat } = await load(() => import("../exercises/01/01_annotate.ts"));
  typeChecks(() => {
    // @ts-expect-error fullName("Ada", 42) should be a type error: give `last` the type string.
    fullName("Ada", 42);
    // @ts-expect-error priceWithVat("100", 20) should be a type error: give `price` the type number.
    priceWithVat("100", 20);
    // hint: priceWithVat should return a number. Annotate its parameters as number.
    expectTypeOf(priceWithVat).returns.toEqualTypeOf<number>();
  });
  check(fullName("Ada", "Lovelace") === "Ada Lovelace", "fullName(\"Ada\", \"Lovelace\") should return \"Ada Lovelace\".");
  check(priceWithVat(100, 20) === 120, `priceWithVat(100, 20) should return 120. Got: ${priceWithVat(100, 20)}`);
});

test("02_inference.ts", async () => {
  await load(() => import("../exercises/01/02_inference.ts"));
  typeChecks(() => {
    // hint: City is wrong. `let city` can change later, so TypeScript gives it a wider type than "Izmir".
    expectTypeOf<City>().toEqualTypeOf<string>();
    // hint: Country is wrong. A const can never change, so its type is the one value it holds (a literal type).
    expectTypeOf<Country>().toEqualTypeOf<"Turkey">();
    // hint: Visits is wrong. It's an array of numbers: how do you write that type?
    expectTypeOf<Visits>().toEqualTypeOf<number[]>();
    // hint: Open is wrong. `let open` can change later, so it can be true or false.
    expectTypeOf<Open>().toEqualTypeOf<boolean>();
    // hint: User is wrong. It's an object type with two properties. Their values can still change.
    expectTypeOf<User>().toEqualTypeOf<{ name: string; age: number }>();
  });
  check(!/\btypeof\b/.test(code(L, "02_inference.ts")), "Write the types out yourself, without `typeof`.");
});

test("03_unknown.ts", async () => {
  const { portFrom } = await load(() => import("../exercises/01/03_unknown.ts"));
  typeChecks(() => {
    // hint: Keep the parameter `unknown`: portFrom(value: unknown): number
    expectTypeOf(portFrom).parameter(0).toEqualTypeOf<unknown>();
    // hint: portFrom should still return a number.
    expectTypeOf(portFrom).returns.toEqualTypeOf<number>();
  });
  const src = code(L, "03_unknown.ts");
  check(!/\bany\b/.test(src), "Don't use `any` here. Check the value with typeof instead.");
  check(!/\bas\s+(number|string|any|unknown)\b/.test(src), "Don't use `as`: it only tells TypeScript to trust you. Check the value with typeof.");
  const cases: [unknown, number][] = [[8080, 8080], ["3000", 3000], ["abc", 3000], [null, 3000], [undefined, 3000],
    ["", 3000], ["80a", 3000], [true, 3000], [{ port: 1 }, 3000]];
  for (const [input, expected] of cases) {
    const got = portFrom(input);
    check(got === expected, `portFrom(${JSON.stringify(input) ?? "undefined"}) should return ${expected}. Got: ${JSON.stringify(got)}`);
  }
});

test("04_fix_me.ts", async () => {
  const { ageGroup } = await load(() => import("../exercises/01/04_fix_me.ts"));
  for (const [age, group] of [[36, "adult"], [18, "adult"], [15, "teen"], [13, "teen"], [10, "child"]] as const) {
    check(ageGroup(age) === group, `ageGroup(${age}) should return "${group}". Got: ${show(String(ageGroup(age)))}`);
  }
  const expected = "Ada <ada@example.com>\n37\nadult\nname,email,age";
  const out = run(L, "04_fix_me.ts");
  check(out === expected, `It runs now, but the output is different.\nExpected:\n${expected}\nGot:\n${show(out)}`);
});

test("05_no_any.ts", async () => {
  const { average } = await load(() => import("../exercises/01/05_no_any.ts"));
  typeChecks(() => {
    // @ts-expect-error average("text") should be a type error: give `scores` a real type.
    average("text");
    // hint: average should return a number, not any.
    expectTypeOf(average).returns.toEqualTypeOf<number>();
  });
  check(!/\bany\b/.test(code(L, "05_no_any.ts")), "There's still an `any` in your code. Replace it with a real type.");
  const scores = [{ player: "a", score: 2 }, { player: "b", score: 4 }];
  check(average(scores) === 3, `average of scores 2 and 4 should be 3. Got: ${average(scores)}`);
  const out = run(L, "05_no_any.ts");
  check(out === "Average: 8", `Expected:  Average: 8\nGot:       ${show(out)}`);
});

test("06_order_total.ts", async () => {
  const { discountFor, orderTotal } = await load(() => import("../exercises/01/06_order_total.ts"));
  typeChecks(() => {
    // @ts-expect-error orderTotal with shipping: "4.99" (text) should be a type error: write the Order type.
    orderTotal({ items: [], shipping: "4.99", coupon: "" });
    // @ts-expect-error discountFor(10) should be a type error: give `code` the type string.
    discountFor(10);
    // hint: discountFor should return a number in every case: discountFor(code: string): number
    expectTypeOf(discountFor).returns.toEqualTypeOf<number>();
  });
  check(!/\bany\b/.test(code(L, "06_order_total.ts")), "There's still an `any` in your code. Use the Item and Order types.");
  check(source(L, "06_order_total.ts").includes('new URLSearchParams("shipping=4.99&coupon=WELCOME")'),
    "Keep the URLSearchParams line as it is. Fix the values where you use them.");
  check(discountFor("SAVE10") === 0.1, `discountFor("SAVE10") should be 0.1. Got: ${discountFor("SAVE10")}`);
  check(discountFor("NOPE") === 0, `discountFor("NOPE") should be 0 (no discount). Got: ${discountFor("NOPE")}`);
  const item = (price: number, quantity: number) => ({ name: "x", price, quantity });
  const small = orderTotal({ items: [item(20, 2)], shipping: 5, coupon: "SAVE10" });
  check(Math.abs(small - 41) < 1e-9, `2 x 20 with SAVE10 plus 5 shipping should be 41. Got: ${small}`);
  const big = orderTotal({ items: [item(60, 1)], shipping: 5, coupon: "" });
  check(big === 60, `Orders of 50 or more ship free: 60 + free shipping should be 60. Got: ${big}`);
  const out = run(L, "06_order_total.ts");
  check(out === "Total: 33.99", `Expected:  Total: 33.99\nGot:       ${show(out)}`);
});
