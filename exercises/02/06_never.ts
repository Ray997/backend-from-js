// Exercise 6: The case nobody wrote
//
// Someone added a fourth event, Signup, to AppEvent, and forgot to handle it in describe.
// tsc says nothing. Node prints:
//
//     click at 120, 48
//     undefined
//
// `never` is the type with no values at all. A function whose parameter is `never` can only be
// called with something that can't happen. Put a call to it at the end of the switch, and
// tsc tells you about every case you forgot:
//
//     Argument of type 'Signup' is not assignable to parameter of type 'never'.
//
// 1. Finish assertNever. Give x the type never, and the function the return type never.
//    It throws:  throw new Error(`Unhandled event: ${JSON.stringify(x)}`);
//    (Types vanish at runtime: if an unexpected event still arrives, you get a loud error
//    instead of a quiet undefined.)
// 2. Add a default branch at the end of the switch:   default: return assertNever(e);
// 3. Run tsc. It finds the missing case. Add it:
//        signup -> "signup: pro plan"     (the plan, then " plan")
//
// When it's done, it prints:
//
//     click at 120, 48
//     signup: pro plan
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/02/06_never.ts
// Check it:    pnpm check 02

type Click = { type: "click"; x: number; y: number };
type PageView = { type: "pageview"; url: string };
type ErrorReport = { type: "error"; message: string };
type Signup = { type: "signup"; plan: string };
export type AppEvent = Click | PageView | ErrorReport | Signup;

export function assertNever(x) {
  // TODO
}

export function describe(e: AppEvent) {
  switch (e.type) {
    case "click":
      return `click at ${e.x}, ${e.y}`;
    case "pageview":
      return `view of ${e.url}`;
    case "error":
      return `error: ${e.message}`;
  }
}

console.log(describe({ type: "click", x: 120, y: 48 }));
console.log(describe({ type: "signup", plan: "pro" }));
