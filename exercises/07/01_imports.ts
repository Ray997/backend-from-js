// Exercise 1: Import it right
//
// lib/money.ts exports three things: a type (Money), a named function (formatMoney) and a default export (sum).
// The two imports below have three mistakes, and tsc finds all of them:
//
//     pnpm check 07
//
// - In an ES module, a relative import needs the full file name, with its extension. (tsc suggests ".js": the name
//   a file gets after a build. Node runs our .ts files directly, so write ".ts", like every import in this course.)
// - A named export is imported with braces, under its own name. The default export is imported without braces.
// - Money is only a type. Node erases type imports and keeps all the others, so mark it with the word type:
//       import type { Money } from "...";     or     import { type Money } from "...";
//
// When it's fixed, it prints:
//
//     42.50 EUR
//     0.00 EUR
//
// Run it:      node exercises/07/01_imports.ts
// Check it:    pnpm check 07

import formatMoney from "./lib/money";
import { Money, sum } from "./lib/money.ts";

export function total(items: Money[]): string {
  return formatMoney(sum(...items));
}

console.log(total([{ amount: 30, currency: "EUR" }, { amount: 12.5, currency: "EUR" }]));
console.log(total([]));
