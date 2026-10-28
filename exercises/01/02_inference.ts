// Exercise 2: What does TypeScript infer?
//
// When you don't write a type, TypeScript works one out from the value. That's called inference.
// Below are five values without annotations. Under each one, replace `unknown` with the type
// TypeScript infers for it.
//
// Predict first, then hover over the name in VS Code to see if you were right.
// Hints:
//   - A `let` can change later. A `const` never can.
//   - A type with exactly one allowed value, like "Turkey", is called a literal type.
//   - The properties of a const object can still change.
//
// Write the types out yourself: don't use `typeof` in this file.
//
// Check it:    pnpm check 01

let city = "Izmir";
export type City = unknown;

const country = "Turkey";
export type Country = unknown;

const visits = [3, 5, 8];
export type Visits = unknown;

let open = true;
export type Open = unknown;

const user = { name: "Ada", age: 36 };
export type User = unknown;

export { city, country, visits, open, user };
