// Exercise 5: Take the any out
//
// Someone "fixed" the type errors in this file with `any`. Now tsc is quiet,
// and the program prints:
//
//     Average: NaN
//
// `any` switches the type checker off. Whatever touches an `any` value is unchecked too,
// so tsc can't see the bug anymore.
//
// 1. Write a type for one score:   type Score = { player: string; score: number };
// 2. Replace every `any` in this file with a real type (Score[], number, ...).
//    JSON.parse returns `any`, so give the variable you store its result in a type.
// 3. Run tsc. Now it finds the bug. Fix it.
//
// When it's fixed, it prints:
//
//     Average: 8
//
// Rule: no `any` left in the code.
//
// Run it:      node exercises/01/05_no_any.ts
// Check it:    pnpm check 01

export function average(scores: any): any {
  let sum = 0;
  for (const s of scores) {
    sum += s.points;
  }
  return sum / scores.length;
}

const scores: any = JSON.parse('[{"player":"ada","score":7},{"player":"linus","score":9}]');
console.log("Average:", average(scores));
