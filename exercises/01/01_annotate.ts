// Exercise 1: Give the parameters a type
//
// In strict mode, TypeScript refuses a parameter without a type:
//
//     Parameter 'first' implicitly has an 'any' type.
//
// It can't guess what callers will pass in, so you have to tell it.
//
// 1. Add a type annotation to every parameter below:  first: string,  price: number, ...
// 2. Don't write the return types. TypeScript works them out by itself (inference).
//
// When it's done, it prints:
//
//     Ada Lovelace
//     120
//
// Run it:      node exercises/01/01_annotate.ts
// Check it:    pnpm check 01

export function fullName(first, last) {
  return first + " " + last;
}

export function priceWithVat(price, vatPercent) {
  return price + (price * vatPercent) / 100;
}

console.log(fullName("Ada", "Lovelace"));
console.log(priceWithVat(100, 20));
