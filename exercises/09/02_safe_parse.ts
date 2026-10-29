// Exercise 2: parse, safeParse, and the issues
//
// parse(data) returns the checked data, or THROWS a ZodError.
// safeParse(data) never throws. It returns one of two shapes (a discriminated union, lesson 02):
//
//     { success: true, data }      the checked data, typed
//     { success: false, error }    a ZodError: error.issues is a list of what's wrong
//
// One issue looks like this (print one and see):
//
//     { code: 'too_small', path: [ 'items', 1, 'qty' ], message: 'Too small: expected number to be >0', ... }
//
// path says WHERE (the field, an array index, a field inside it), message says WHAT.
//
// 1. OrderSchema: an object with
//        items    an array of { sku: string, qty: a whole number above 0 }      z.array(...), .int().positive()
//                 with at least one item. Give that rule your own message:   .min(1, "an order needs at least one item")
//        coupon   a string, optional                                          .optional()
//    Order: the type, from the schema (z.infer).
// 2. readOrder(body: unknown): Result<Order>, with safeParse:
//        { ok: true, value: the data }  or  { ok: false, errors: one string per issue }
//    Each string is the path joined with ".", a colon, and the message:  "items.1.qty: Too small: ..."
//    When the path is empty (the whole body is wrong), write "body" instead:  "body: Invalid input: ..."
// 3. countIssues(body: unknown): number, with parse this time: try OrderSchema.parse(body) and return 0.
//    In the catch, the error is unknown (lesson 06): if it's a z.ZodError (instanceof), return its number of
//    issues. Anything else: throw it again.
//
// When it's done, it prints:
//
//     {"ok":true,"value":{"items":[{"sku":"tee","qty":2}],"coupon":"HELLO10"}}
//     {"ok":false,"errors":["items.1.qty: Too small: expected number to be >0"]}
//     {"ok":false,"errors":["items: an order needs at least one item"]}
//     {"ok":false,"errors":["body: Invalid input: expected object, received string"]}
//     0 2
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/09/02_safe_parse.ts
// Check it:    pnpm check 09

import { z } from "zod";

export type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };

export const OrderSchema = z.object({
  // TODO: items, coupon
});

export type Order = {}; // TODO: from the schema

export function readOrder(body: unknown): Result<Order> {
  return { ok: false, errors: ["TODO"] };
}

export function countIssues(body: unknown): number {
  return -1; // TODO: parse, in a try/catch
}

console.log(JSON.stringify(readOrder({ items: [{ sku: "tee", qty: 2 }], coupon: "HELLO10" })));
console.log(JSON.stringify(readOrder({ items: [{ sku: "tee", qty: 2 }, { sku: "mug", qty: 0 }] })));
console.log(JSON.stringify(readOrder({ items: [] })));
console.log(JSON.stringify(readOrder("two mugs")));
console.log(countIssues({ items: [{ sku: "mug", qty: 1 }] }), countIssues({ items: [{ sku: 7, qty: 1.5 }] }));
