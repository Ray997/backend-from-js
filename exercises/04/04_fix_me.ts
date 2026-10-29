// Exercise 4: Fix me
//
// There are 4 mistakes. tsc finds 2 of them right away:
//
//     npx tsc
//
// The other 2 hide behind `any`: tsc can't see them, and Node prints the wrong thing there
// (an undefined, or nothing at all).
// Give firstOf and mapAll type parameters instead of `any`
// (firstOf like first in exercise 1, mapAll like mapPage in exercise 3: <T, U>),
// and tsc finds those 2 as well. Then fix them.
//
// When it's fixed, it prints:
//
//     newest: /docs
//     first user: Ana
//     path sizes: 1, 5, 8
//     4000 | not a time: soon
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/04/04_fix_me.ts
// Check it:    pnpm check 04

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
type AppEvent = { path: string; at: number };
type User = { id: string; name: string };

const events: AppEvent[] = [
  { path: "/", at: 1000 },
  { path: "/docs", at: 3000 },
  { path: "/pricing", at: 2000 },
];
const users: User[] = [
  { id: "u1", name: "Ana" },
  { id: "u2", name: "Mert" },
];

// The item with the biggest `at`: the newest one. Works for anything that has an `at`.
export function newest<T>(items: T[]): T {
  return items.reduce((a, b) => (b.at > a.at ? b : a));
}

// The first item of a list, or undefined when it's empty.
export function firstOf(list: any[]): any {
  return list[0];
}

// Every item turned into something else, like Array's map.
export function mapAll(items: any[], fn: (item: any) => any): any[] {
  return items.map(fn);
}

// A time in milliseconds, or an error message.
export function parseAt(text: string): Result<number> {
  const at = Number(text);
  if (Number.isNaN(at)) return { ok: false, error: `not a time: ${text}` };
  return { ok: true, value: at };
}

console.log(`newest: ${newest(events).path}`);
console.log(`first user: ${firstOf(users)?.nmae}`);
console.log(`path sizes: ${mapAll(events, (e) => e.path.lenght).join(", ")}`);
const times = [parseAt("4000"), parseAt("soon")];
console.log(times.map((r) => (r.ok ? r.value : r.error)).join(" | "));
