// Exercise 4: Fix me
//
// This file comes from a project with "strict": false in its tsconfig. There, tsc said nothing, and it runs:
//
//     node exercises/10/04_fix_me.ts
//
//     revenue: NaN
//     failed: undefined
//
// Three bugs, zero errors. This course has strict on, so tsc finds every one of them:
//
//     pnpm check 10
//
// Fix them for real: no `any`, no `as`, and no `!` after a name (found!.path tells tsc to trust you, and it crashes
// just the same).
//   - revenue: give list its type. Then tsc shows the next problem: a click has no amount. Count it as 0 (??).
//   - pathOf: find returns undefined when no event has that id. Then throw new Error(`no event ${id}`).
//   - the catch: error is unknown. Print error.message only when it's an Error (instanceof), otherwise
//     String(error). (Look closely at how message is spelled: tsc will tell you.)
//
// When it's fixed, it prints:
//
//     revenue: 49
//     failed: no event e9
//
// Run it:      node exercises/10/04_fix_me.ts
// Check it:    pnpm check 10

type PulseEvent = { id: string; type: string; path: string; amount?: number };

export const events: PulseEvent[] = [
  { id: "e1", type: "click", path: "/pricing" },
  { id: "e2", type: "purchase", path: "/checkout", amount: 49 },
];

export function revenue(list) {
  let sum = 0;
  for (const e of list) sum += e.amount;
  return sum;
}

export function pathOf(id: string) {
  const found = events.find((e) => e.id === id);
  return found.path;
}

try {
  console.log("revenue:", revenue(events));
  console.log(pathOf("e9"));
} catch (error) {
  console.log("failed:", error.mesage);
}
