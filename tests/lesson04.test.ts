// Checks for lesson 04: Generics (type parameters, constraints, generic types, Result<T, E>).
//
// Every test is named after its exercise file. `pnpm check 04` runs tsc on the lesson's files AND these tests:
//   - lines marked  // @ts-expect-error  must be type errors (if one isn't, the checker prints the text after it)
//   - a  // hint:  comment explains the type check on the next line, if that line fails
//   - check(condition, hint) tests what your program does
import { expectTypeOf, test } from "vitest";
import type { User } from "../exercises/04/02_constraints.ts";
import type { Page } from "../exercises/04/03_page.ts";
import type { AppEvent, Result } from "../exercises/04/06_report.ts";
import { check, code, load, run, show, typeChecks } from "./helpers.ts";

const L = "04";

/** No `any`, no `as`: the type parameters have to do the work. */
function honest(file: string) {
  const src = code(L, file);
  check(!/\bany\b/.test(src), "There's still an `any` in your code. Use a type parameter instead: <T>.");
  check(!/\bas\s+[A-Za-z{[(]/.test(src), "Don't use `as`: it only tells TypeScript to trust you. Write the types instead.");
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

test("01_first.ts", async () => {
  const { first, last, pair } = await load(() => import("../exercises/04/01_first.ts"));
  typeChecks(() => {
    // hint: first([1, 2]) should be number | undefined: give first a type parameter.
    expectTypeOf(first([1, 2])).toEqualTypeOf<number | undefined>();
    // @ts-expect-error first(["a"])?.toFixed() should be a type error: first(["a"]) is a string.
    first(["a"])?.toFixed();
    // hint: last([true]) should be boolean | undefined: same signature as first.
    expectTypeOf(last([true])).toEqualTypeOf<boolean | undefined>();
    // hint: pair("a", 1) should be [string, number]: use two type parameters, A and B.
    expectTypeOf(pair("a", 1)).toEqualTypeOf<[string, number]>();
  });
  honest("01_first.ts");
  check(first([3, 1, 2]) === 3, `first([3, 1, 2]) should be 3. Got: ${first([3, 1, 2])}`);
  check(first([]) === undefined, `first([]) should be undefined. Got: ${first([])}`);
  check(last(["a", "b", "c"]) === "c", `last(["a", "b", "c"]) should be "c". Got: ${JSON.stringify(last(["a", "b", "c"]))}\nThe last index is list.length - 1.`);
  check(last([]) === undefined, `last([]) should be undefined. Got: ${JSON.stringify(last([]))}`);
  check(same(pair("port", 8080), ["port", 8080]), `pair("port", 8080) should be ["port", 8080]. Got: ${JSON.stringify(pair("port", 8080))}`);
  const out = run(L, "01_first.ts");
  const expected = "3 c\nundefined undefined\n[ 'port', 8080 ]";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("02_constraints.ts", async () => {
  const { byId, longest } = await load(() => import("../exercises/04/02_constraints.ts"));
  const users: User[] = [{ id: "u1", name: "Ana" }, { id: "u2", name: "Mert" }];
  typeChecks(() => {
    // hint: byId(users, "u1") should be User | undefined: add <T extends { id: string }>
    expectTypeOf(byId(users, "u1")).toEqualTypeOf<User | undefined>();
    // @ts-expect-error byId([1, 2], "1") should be a type error: numbers have no id.
    byId([1, 2], "1");
    // hint: longest(["a"], ["b"]) should be string[]: add <T extends { length: number }>
    expectTypeOf(longest(["a"], ["b"])).toEqualTypeOf<string[]>();
    // @ts-expect-error longest(1, 2) should be a type error: numbers have no length.
    longest(1, 2);
  });
  honest("02_constraints.ts");
  check(byId(users, "u2")?.name === "Mert", "byId(users, \"u2\") should be Mert's user.");
  check(byId(users, "u9") === undefined, "byId(users, \"u9\") should be undefined: there's no u9.");
  for (const [a, b, expected] of [["cat", "horse", "horse"], ["horse", "cat", "horse"], ["ab", "cd", "ab"]]) {
    const got = longest(a, b);
    check(got === expected, `longest("${a}", "${b}") should be "${expected}". Got: ${JSON.stringify(got)}` +
      (a.length === b.length ? "\nWhen both have the same length, return a." : ""));
  }
  check(same(longest([1, 2, 3], [4]), [1, 2, 3]), `longest([1, 2, 3], [4]) should be [1, 2, 3]. Got: ${JSON.stringify(longest([1, 2, 3], [4]))}`);
  const out = run(L, "02_constraints.ts");
  const expected = "Mert undefined\nhorse [ 1, 2, 3 ]";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("03_page.ts", async () => {
  const { paginate, mapPage } = await load(() => import("../exercises/04/03_page.ts"));
  typeChecks(() => {
    // hint: Page<T> should be { items: T[]; page: number; pages: number }
    expectTypeOf<Page<number>>().toEqualTypeOf<{ items: number[]; page: number; pages: number }>();
    // hint: paginate([1, 2], 1, 1) should be a Page<number>.
    expectTypeOf(paginate([1, 2], 1, 1)).toEqualTypeOf<Page<number>>();
    // hint: mapPage(page, (n) => String(n)) should be a Page<string>: use <T, U>.
    expectTypeOf(mapPage(paginate([1, 2], 1, 1), (n) => String(n))).toEqualTypeOf<Page<string>>();
  });
  honest("03_page.ts");
  const p = paginate(["a", "b", "c", "d", "e"], 2, 2);
  check(same(p, { items: ["c", "d"], page: 2, pages: 3 }),
    `paginate(["a", "b", "c", "d", "e"], 2, 2) should be { items: ["c", "d"], page: 2, pages: 3 }. Got: ${JSON.stringify(p)}`);
  const lastPage = paginate(["a", "b", "c", "d", "e"], 3, 2);
  check(same(lastPage.items, ["e"]), `The last page, paginate(["a", "b", "c", "d", "e"], 3, 2), should have the items ["e"]. Got: ${JSON.stringify(lastPage.items)}`);
  check(paginate([], 1, 10).pages === 0, `An empty list has 0 pages. Got: ${paginate([], 1, 10).pages}`);
  const m = mapPage(p, (s) => s.toUpperCase());
  check(same(m, { items: ["C", "D"], page: 2, pages: 3 }), `mapPage(page, (s) => s.toUpperCase()) should be { items: ["C", "D"], page: 2, pages: 3 }. Got: ${JSON.stringify(m)}`);
  check(same(p.items, ["c", "d"]), "mapPage changed the page it was given. Return a new page:  { ...p, items: p.items.map(fn) }");
  const out = run(L, "03_page.ts");
  const expected = "[ 'c', 'd' ] 2/3\n[ 'C', 'D' ] 2/3";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});

test("04_fix_me.ts", async () => {
  const { newest, firstOf, mapAll, parseAt } = await load(() => import("../exercises/04/04_fix_me.ts"));
  typeChecks(() => {
    // hint: firstOf(["a"]) should be string | undefined: give firstOf a <T>.
    expectTypeOf(firstOf(["a"])).toEqualTypeOf<string | undefined>();
    // hint: mapAll([1], (n) => String(n)) should be string[]: use <T, U>.
    expectTypeOf(mapAll([1], (n) => String(n))).toEqualTypeOf<string[]>();
    // @ts-expect-error newest([1, 2]) should be a type error: numbers have no `at`.
    newest([1, 2]);
  });
  honest("04_fix_me.ts");
  check(newest([{ at: 1, id: "a" }, { at: 5, id: "b" }]).id === "b", "newest should return the item with the biggest `at`.");
  check(firstOf([]) === undefined, "firstOf([]) should be undefined.");
  check(same(mapAll(["ab", "c"], (s) => s.length), [2, 1]), "mapAll([\"ab\", \"c\"], (s) => s.length) should be [2, 1].");
  const bad = parseAt("soon");
  check(!bad.ok && bad.error === "not a time: soon", "parseAt(\"soon\") should be { ok: false, error: \"not a time: soon\" }.");
  const expected = "newest: /docs\nfirst user: Ana\npath sizes: 1, 5, 8\n4000 | not a time: soon";
  const out = run(L, "04_fix_me.ts");
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}` +
    (/undefined|: , /.test(out) ? "\nA missing value means a misspelled key that `any` hid. Replace the `any`s, then run tsc." : ""));
});

test("05_groupby.ts", async () => {
  const { groupBy, countBy } = await load(() => import("../exercises/04/05_groupby.ts"));
  type Item = { kind: string; n: number };
  const items: Item[] = [{ kind: "a", n: 1 }, { kind: "b", n: 2 }, { kind: "a", n: 3 }];
  typeChecks(() => {
    // hint: groupBy(items, ...) should be { [key: string]: Item[] }: use <T>, not any.
    expectTypeOf(groupBy(items, (i) => i.kind)).toEqualTypeOf<{ [key: string]: Item[] }>();
    // @ts-expect-error groupBy(items, (i) => i.knd) should be an error: i is an Item.
    groupBy(items, (i) => i.knd);
    // hint: countBy(items, ...) should be { [key: string]: number }
    expectTypeOf(countBy(items, (i) => i.kind)).toEqualTypeOf<{ [key: string]: number }>();
  });
  honest("05_groupby.ts");
  const g = groupBy(items, (i) => i.kind);
  check(same(g, { a: [{ kind: "a", n: 1 }, { kind: "a", n: 3 }], b: [{ kind: "b", n: 2 }] }),
    `groupBy(items, (i) => i.kind) should put items with the same kind together, in order. Got: ${JSON.stringify(g)}`);
  const c = countBy(items, (i) => i.kind);
  check(same(c, { a: 2, b: 1 }), `countBy(items, (i) => i.kind) should be { a: 2, b: 1 }. Got: ${JSON.stringify(c)}`);
  check(same(countBy([], (x: string) => x), {}), "countBy([], ...) should be {}: no items, no groups.");
  const out = run(L, "05_groupby.ts");
  const expected = "[ 'pageview', 'click', 'error' ]\n{ pageview: 2, click: 1, error: 1 }\nAna, Ines";
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}` +
    (out.includes("'undefined'") ? "\nEvery event landed in a group called undefined: a misspelled key. Give groupBy a type parameter, then run tsc." : ""));
});

test("06_report.ts", async () => {
  const { parseEvent, values, errors } = await load(() => import("../exercises/04/06_report.ts"));
  typeChecks(() => {
    // hint: Result<T, E> should be { ok: true; value: T } | { ok: false; error: E }
    expectTypeOf<Result<number, string>>().toEqualTypeOf<{ ok: true; value: number } | { ok: false; error: string }>();
    // @ts-expect-error { ok: true, error: "x" } should be an error: ok results have a value.
    const wrong: Result<number, string> = { ok: true, error: "x" };
    const r = parseEvent("pageview /");
    // hint: after if (r.ok), r.value should be an AppEvent: write the Result union.
    if (r.ok) expectTypeOf(r.value).toEqualTypeOf<AppEvent>();
    // hint: values(results) should be T[], here AppEvent[].
    expectTypeOf(values([r])).toEqualTypeOf<AppEvent[]>();
    // hint: errors(results) should be E[], here string[].
    expectTypeOf(errors([r])).toEqualTypeOf<string[]>();
  });
  honest("06_report.ts");
  for (const [line, expected] of [
    ["pageview /docs", { ok: true, value: { type: "pageview", path: "/docs" } }],
    ["click /", { ok: true, value: { type: "click", path: "/" } }],
    ["oops", { ok: false, error: 'bad line "oops"' }],
    ["click pricing", { ok: false, error: 'bad line "click pricing"' }],
    ["click /a /b", { ok: false, error: 'bad line "click /a /b"' }],
    [" /docs", { ok: false, error: 'bad line " /docs"' }],
  ] as const) {
    const got = parseEvent(line);
    check(same(got, expected), `parseEvent(${JSON.stringify(line)}) should be ${JSON.stringify(expected)}. Got: ${JSON.stringify(got)}`);
  }
  const rs: Result<number, string>[] = [{ ok: true, value: 1 }, { ok: false, error: "x" }, { ok: true, value: 2 }];
  check(same(values(rs), [1, 2]), `values should keep the values of the ok results, in order: [1, 2]. Got: ${JSON.stringify(values(rs))}`);
  check(same(errors(rs), ["x"]), `errors should keep the errors of the other results: ["x"]. Got: ${JSON.stringify(errors(rs))}`);
  const out = run(L, "06_report.ts");
  const expected = 'pageview: / /docs\nclick: /pricing\nerrors: bad line "oops", bad line "click"';
  check(out === expected, `Expected:\n${expected}\nGot:\n${show(out)}`);
});
