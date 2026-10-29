// Exercise 3: keyof, T[K] and Record
//
//     keyof T         the keys of T, as a union:            keyof User     is   "id" | "name"
//     T[K]            the type of the field K of T:         User["name"]   is   string
//     Record<K, V>    an object with exactly the keys K, and a V for every key
//
// 1. EventType: the type of AppEvent's type field. Don't copy the three strings: write AppEvent["type"].
//
// 2. countByType(events): how many events there are of each type. Every type is in the result,
//    even with 0, so the return type is a Record<EventType, number>:
//        countByType(events)   is   { pageview: 2, click: 1, signup: 0 }
//    Hint: start with  { pageview: 0, click: 0, signup: 0 },  then  counts[e.type]++  for every event.
//
// 3. pluck(items, key): the value of one field, from every item. It's generic (lesson 04), and the key
//    must be one of T's keys. It returns the type of that field, for every item:
//        function pluck<T, K extends keyof T>(items: T[], key: K): T[K][]
//        pluck(events, "path")   is   ["/", "/pricing", "/"], a string[]
//        pluck(events, "pth")    is a type error
//
// When it's done, it prints:
//
//     { pageview: 2, click: 1, signup: 0 }
//     [ '/', '/pricing', '/' ]
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/05/03_keyof.ts
// Check it:    pnpm check 05

export type AppEvent = { id: string; type: "pageview" | "click" | "signup"; path: string };

export type EventType = string; // TODO

export function countByType(events: AppEvent[]): { [type: string]: number } {
  return {}; // TODO
}

export function pluck<T>(items: T[], key: string): unknown[] {
  return []; // TODO
}

const events: AppEvent[] = [
  { id: "e1", type: "pageview", path: "/" },
  { id: "e2", type: "click", path: "/pricing" },
  { id: "e3", type: "pageview", path: "/" },
];

console.log(countByType(events));
console.log(pluck(events, "path"));
