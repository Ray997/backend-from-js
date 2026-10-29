// Exercise 1: Function types
//
// In JavaScript a function is a value: you store it in a variable and pass it to other functions
// (a callback). So it needs a type of its own. A function type looks like an arrow function,
// with types where the code would be:
//
//     type Check = (value: string) => boolean;
//
// Read it as: "a function that takes a string and returns a boolean".
//
// 1. Replace `unknown` in the type Check with that function type.
//    Then hover over `value` in isPort and notEmpty: you never wrote its type, but TypeScript knows
//    it's a string. It comes from Check (that's called contextual typing).
//
// 2. isPort(value): true when value is a port number: digits only, from 1 to 65535.
//        isPort("8080")  is true       isPort("0")      is false      isPort("70000")  is false
//        isPort("80a")   is false      isPort("")       is false
//    Hint: /^\d+$/.test(value) is true for digits only. Then compare Number(value).
//
// 3. passesAll(value, checks): true when every check in the list returns true for value.
//        passesAll("3000", [notEmpty, isPort])   is true
//        passesAll("", [notEmpty, isPort])       is false
//    Hint: checks.every((check) => check(value)). No type needed for `check`: it comes from Check[].
//
// When it's done, it prints:
//
//     true false
//     true false
//
// Rules: no `any`.
//
// Run it:      node exercises/03/01_functions.ts
// Check it:    pnpm check 03

export type Check = unknown;

export const notEmpty: Check = (value) => value.trim() !== "";

export const isPort: Check = (value) => {
  return false; // TODO
};

export function passesAll(value: string, checks: Check[]): boolean {
  return false; // TODO
}

console.log(isPort("8080"), isPort("70000"));
console.log(passesAll("3000", [notEmpty, isPort]), passesAll("", [notEmpty, isPort]));
