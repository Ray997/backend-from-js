// Exercise 2: Constraints (extends)
//
// Inside a generic function, T can be any type at all: a number, a string, a User.
// So TypeScript only lets you do with T what works for EVERY type. Reading item.id doesn't:
// a number has no id. Run tsc:  Property 'id' does not exist on type 'T'.
//
// A constraint says what T must at least have:
//
//     function byId<T extends { id: string }>(items: T[], id: string): T | undefined
//
// Read it as: "T is any type that has an id, which is a string". A User fits, a number doesn't.
// T is still the whole type: byId(users, "u2") gives User | undefined, with the name and everything.
//
// 1. Add the constraint to byId, like above. (The body already works.)
//
// 2. longest(a, b): whichever of the two has the bigger length; a when they're equal.
//    It works for strings and for arrays, so T needs a length:  <T extends { length: number }>
//        longest("cat", "horse")      is "horse"
//        longest([1, 2, 3], [4])      is [1, 2, 3]
//
// When it's done, it prints:
//
//     Mert undefined
//     horse [ 1, 2, 3 ]
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/04/02_constraints.ts
// Check it:    pnpm check 04

export type User = { id: string; name: string };

const users: User[] = [
  { id: "u1", name: "Ana" },
  { id: "u2", name: "Mert" },
];

export function byId<T>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

export function longest<T>(a: T, b: T): T {
  return a; // TODO
}

console.log(byId(users, "u2")?.name, byId(users, "u9"));
console.log(longest("cat", "horse"), longest([1, 2, 3], [4]));
