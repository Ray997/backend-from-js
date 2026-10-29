// Exercise 6 (project, part 2): An event report with Result<T, E>
//
// Log lines arrive as text, like "pageview /docs": the event type, a space, and the path.
// Some lines are broken. Instead of throwing, the parser returns a Result: either the value, or an
// error. Result is a discriminated union (lesson 02) with two type parameters:
//
//     type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
//
// Result<AppEvent, string> is "an AppEvent, or an error message".
//
// 1. Replace `unknown` in Result<T, E> with the union above.
//
// 2. parseEvent(line): Result<AppEvent, string>
//    A good line has exactly two parts, split at the space, and the path starts with "/".
//        parseEvent("pageview /docs")   is   { ok: true, value: { type: "pageview", path: "/docs" } }
//        parseEvent("oops")             is   { ok: false, error: 'bad line "oops"' }
//        parseEvent("click pricing")    is   { ok: false, error: 'bad line "click pricing"' }
//
// 3. values(results): the values of the results that are ok, in order.
//    errors(results): the errors of the others, in order.
//    They work for every Result, so they have type parameters too:
//        function values<T, E>(results: Result<T, E>[]): T[]
//    Hint: a for...of loop, and if (r.ok) ... narrows r, so r.value is there.
//
// When it's done, it prints:
//
//     pageview: / /docs
//     click: /pricing
//     errors: bad line "oops", bad line "click"
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/04/06_report.ts
// Check it:    pnpm check 04

export type Result<T, E> = unknown;

export type AppEvent = { type: string; path: string };

export function groupBy<T>(items: T[], keyOf: (item: T) => string): { [key: string]: T[] } {
  const groups: { [key: string]: T[] } = {};
  for (const item of items) {
    const key = keyOf(item);
    if (!(key in groups)) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

export function parseEvent(line: string): Result<AppEvent, string> {
  return { ok: false, error: "TODO" };
}

export function values<T, E>(results: Result<T, E>[]): T[] {
  return []; // TODO
}

export function errors<T, E>(results: Result<T, E>[]): E[] {
  return []; // TODO
}

const log = ["pageview /", "click /pricing", "oops", "pageview /docs", "click"];
const results = log.map(parseEvent);

for (const [type, list] of Object.entries(groupBy(values(results), (e) => e.type))) {
  console.log(`${type}: ${list.map((e) => e.path).join(" ")}`);
}
console.log(`errors: ${errors(results).join(", ")}`);
