// Exercise 5 (project): A type-safe event handler
//
// An analytics app receives three kinds of events. Each one has a `type` property whose
// value tells you its shape:
//
//     click      { type: "click", x: 120, y: 48 }           where on the page
//     pageview   { type: "pageview", url: "/pricing" }       which page
//     error      { type: "error", message: "payment failed" }
//
// 1. Replace the four `unknown` types below:
//        Click        { type: "click"; x: number; y: number }
//        PageView     { type: "pageview"; url: string }
//        ErrorReport  { type: "error"; message: string }
//        AppEvent     Click | PageView | ErrorReport          (a discriminated union)
//    "click" after `type:` is a literal type: only that exact text is allowed.
//
// 2. describe(e): a switch on e.type, one case per event. In every case, TypeScript knows
//    which shape e has (hover over e in VS Code).
//        click     -> "click at 120, 48"
//        pageview  -> "view of /pricing"
//        error     -> "error: payment failed"
//
// 3. countByType(events): how many events of each type, like { click: 1, pageview: 2, error: 1 }.
//    Hint: e.type is "click" | "pageview" | "error", which are exactly the keys of counts,
//    so counts[e.type] += 1 is allowed.
//
// When it's done, it prints:
//
//     view of /pricing
//     click at 120, 48
//     error: payment failed
//     view of /checkout
//     { click: 1, pageview: 2, error: 1 }
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/02/05_events.ts
// Check it:    pnpm check 02

export type Click = unknown;
export type PageView = unknown;
export type ErrorReport = unknown;
export type AppEvent = unknown;

export function describe(e: AppEvent): string {
  return "TODO";
}

export function countByType(events: AppEvent[]): { click: number; pageview: number; error: number } {
  const counts = { click: 0, pageview: 0, error: 0 };
  // TODO: count every event by its type
  return counts;
}

const events: AppEvent[] = [
  { type: "pageview", url: "/pricing" },
  { type: "click", x: 120, y: 48 },
  { type: "error", message: "payment failed" },
  { type: "pageview", url: "/checkout" },
];

for (const e of events) {
  console.log(describe(e));
}
console.log(countByType(events));
