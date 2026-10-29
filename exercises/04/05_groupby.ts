// Exercise 5 (project, part 1): A typed groupBy
//
// groupBy(items, keyOf) puts the items into groups. keyOf gives every item its key, and items with
// the same key end up in the same group:
//
//     groupBy(events, (e) => e.type)   gives   { pageview: [two events], click: [one event], ... }
//
// 1. groupBy works, but it takes `any`, so everything that comes out of it is `any` too, even the
//    `e` in the callback. The first console.log line has a misspelled key, and tsc says nothing.
//    Run it: every event lands in one group, called "undefined".
//    Give groupBy a type parameter T instead of `any` (the body stays the same):
//        function groupBy<T>(items: T[], keyOf: (item: T) => string): { [key: string]: T[] }
//    Run tsc again: now it finds the misspelled key. Fix it.
//
// 2. countBy(items, keyOf): how many items each group has.
//        countBy(events, (e) => e.type)   gives   { pageview: 2, click: 1, error: 1 }
//    Same type parameter as groupBy. The result is { [key: string]: number }.
//    Hint: start with {}, then for every item: counts[key] = (counts[key] ?? 0) + 1
//
// When it's done, it prints:
//
//     [ 'pageview', 'click', 'error' ]
//     { pageview: 2, click: 1, error: 1 }
//     Ana, Ines
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/04/05_groupby.ts
// Check it:    pnpm check 04

type AppEvent = { type: string; path: string };
type User = { name: string; country: string };

export function groupBy(items: any[], keyOf: (item: any) => string): { [key: string]: any[] } {
  const groups: { [key: string]: any[] } = {};
  for (const item of items) {
    const key = keyOf(item);
    if (!(key in groups)) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

export function countBy<T>(items: T[], keyOf: (item: T) => string): { [key: string]: number } {
  return {}; // TODO
}

const events: AppEvent[] = [
  { type: "pageview", path: "/" },
  { type: "click", path: "/pricing" },
  { type: "pageview", path: "/docs" },
  { type: "error", path: "/checkout" },
];
const users: User[] = [
  { name: "Ana", country: "PT" },
  { name: "Mert", country: "TR" },
  { name: "Ines", country: "PT" },
];

console.log(Object.keys(groupBy(events, (e) => e.tpye)));
console.log(countBy(events, (e) => e.type));
console.log(groupBy(users, (u) => u.country).PT.map((u) => u.name).join(", "));
