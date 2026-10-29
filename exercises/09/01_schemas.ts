// Exercise 1: Your first schemas
//
// A type describes data for tsc, and it's gone when the code runs (lesson 01). A Zod SCHEMA describes the same
// shape as a VALUE: it's still there at runtime, so it can check data that comes from outside your program
// (a request body, a file, another API).
//
//     import { z } from "zod";
//     const Point = z.object({ x: z.number(), y: z.number() });   // a schema: a value
//     Point.parse({ x: 1, y: 2 });        // returns the data, checked
//     Point.parse({ x: "1" });            // throws a ZodError
//     Point.safeParse(data).success       // true or false, never throws
//     type Point = z.infer<typeof Point>; // the type, read out of the schema: { x: number; y: number }
//
// 1. SignupSchema: an object with
//        email   a string that is an email address     z.email()
//        name    a string, at least 1 character        z.string().min(1)
//        age     a whole number, 13 or more            z.number().int().min(13)
//        plan    "free" or "pro"                       z.enum(["free", "pro"])
// 2. Signup: the type, made from the schema with z.infer. Don't write the fields again.
// 3. firstSignup: SignupSchema.parse(...) of the object below. parse returns the checked data, and leaves out
//    every field the schema doesn't know (here: admin).
// 4. isValid(data: unknown): boolean: true when SignupSchema accepts the data. Use safeParse (it never throws).
//
// When it's done, it prints:
//
//     { email: 'ana@example.com', name: 'Ana', age: 30, plan: 'pro' }
//     true false false false
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/09/01_schemas.ts
// Check it:    pnpm check 09

import { z } from "zod";

export const SignupSchema = z.object({
  // TODO: email, name, age, plan
});

export type Signup = {}; // TODO: from the schema, with z.infer

// TODO: SignupSchema.parse(...) of  { email: "ana@example.com", name: "Ana", age: 30, plan: "pro", admin: true }
export const firstSignup = {};

export function isValid(data: unknown): boolean {
  return false; // TODO: safeParse
}

console.log(firstSignup);
console.log(
  isValid({ email: "mert@example.com", name: "Mert", age: 13, plan: "free" }),
  isValid({ email: "mert@example.com", name: "Mert", age: 12, plan: "free" }),
  isValid({ email: "not an email", name: "Mert", age: 20, plan: "free" }),
  isValid("mert"),
);
