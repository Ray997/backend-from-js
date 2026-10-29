// Exercise 3: Read a library's types
//
// Sooner or later, a hover shows you a type from a library that looks like a puzzle. The three below are copied
// from real .d.ts files (zod, @types/express, and TypeScript's own lib). For each answer, work out what the type
// gives, step by step, and write it as a PLAIN type: string, number, unknown, a literal like "id", or an object type.
// Don't use the library type in your answer: that's the part you're reading.
//
// How to read them:
//     T extends Shape ? A : B       an if, for types: if T fits Shape, the answer is A, otherwise B
//     T["key"]                      the type of T's property key (like obj.key, but for types)
//     `${infer P}/${string}`        a pattern for strings: "some text, then a slash, then anything".
//                                   If the string fits, P is the part that stood where infer P is.
//     { [K in keyof T]?: T[K] }     an object with one property for every key of T (here: each one optional)
//
// Tip: hover over a piece in VS Code. Or give a piece its own name (type Step1 = ...;) and hover over that.
//
// Check it:    pnpm check 10      (this file prints nothing: it's all types)

import { z } from "zod";

// 1. zod: node_modules/zod/v4/core/core.d.ts. z.infer is another name for it.
type output<T> = T extends { _zod: { output: any } } ? T["_zod"]["output"] : unknown;

export const OrderSchema = z.object({ sku: z.string(), qty: z.number() });

export type A1 = never; // TODO: what output<typeof OrderSchema> is
export type A2 = never; // TODO: what output<string> is (a string has no _zod property)

// 2. @types/express-serve-static-core: how req.params knows the name in "/events/:id" (lesson 08).
//    Express takes what comes after the ":" and removes the rest of the path ("/edit") with this type.
type RemoveTail<S extends string, Tail extends string> = S extends `${infer P}${Tail}` ? P : S;

export type A3 = never; // TODO: what RemoveTail<"id/edit", `/${string}`> is
export type A4 = never; // TODO: what RemoveTail<"id", `/${string}`> is

// 3. TypeScript's own lib (lib.es5.d.ts): Partial, from lesson 05, as it's really written.
type MyPartial<T> = { [P in keyof T]?: T[P] };

export type A5 = never; // TODO: what MyPartial<{ sku: string; qty: number }> is
