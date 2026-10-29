// Exercise 3: Query strings: coerce, default, transform
//
// Everything in a URL is text. In /search?q=zod&page=2, page is the STRING "2", and when it's missing it's
// undefined (lesson 08: req.query.page is string | ParsedQs | (string | ParsedQs)[] | undefined). A schema can
// turn that text into the values you want, and check them on the way:
//
//     z.coerce.number()                      runs Number(value) first, then checks it's a number ("2" -> 2, "x" -> NaN: an issue)
//     .default(1)                            when the value is missing (undefined): use 1
//     z.string().transform((s) => ...)       after the check, change the value (the type changes with it)
//     z.string().trim()                      removes spaces at both ends before the other checks
//
// A schema with these has TWO types: what goes in, and what comes out.
//
//     z.input<typeof Schema>     what goes in   (page: unknown, because coerce takes anything)
//     z.infer<typeof Schema>     what comes out (page: number). z.infer is the same as z.output.
//
// 1. SearchQuerySchema: an object with
//        q       a string, trimmed, at least 1 character
//        page    a whole number, 1 or more, from the URL's text; 1 when it's missing
//        tags    a comma-separated string ("ts,api") turned into a list (["ts", "api"]); [] when it's missing
// 2. SearchInput = z.input<...>, Search = z.infer<...>.
// 3. search, for GET /search: safeParse(req.query). Not OK: 400 with
//        { error: "invalid query", issues: ["<path>: <message>", ...] }   (the path joined with ".")
//    OK: 200 with the parsed data (q, page, tags).
//
// When it's done, it prints:
//
//     /search?q=%20zod%20&page=2&tags=ts,api 200 {"q":"zod","page":2,"tags":["ts","api"]}
//     /search?q=zod 200 {"q":"zod","page":1,"tags":[]}
//     /search?q=zod&page=two 400 {"error":"invalid query","issues":["page: Invalid input: expected number, received NaN"]}
//     /search?q=%20&page=0 400 {"error":"invalid query","issues":["q: Too small: expected string to have >=1 characters","page: Too small: expected number to be >=1"]}
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/09/03_query.ts
// Check it:    pnpm check 09

import express from "express";
import type { RequestHandler } from "express";
import { z } from "zod";
import { send, serve } from "./lib/serve.ts";

export type ApiError = { error: string; issues: string[] };

export const SearchQuerySchema = z.object({
  // TODO: q, page, tags
});

export type SearchInput = {}; // TODO: z.input
export type Search = {}; // TODO: z.infer

export const search: RequestHandler<{}, Search | ApiError> = (req, res) => {
  res.json({}); // TODO: safeParse(req.query): 400 with the issues, or 200 with the data
};

export const app = express();
app.get("/search", search);

const api = await serve(app);
for (const path of ["/search?q=%20zod%20&page=2&tags=ts,api", "/search?q=zod", "/search?q=zod&page=two", "/search?q=%20&page=0"]) {
  console.log(path, await send(api.url + path));
}
api.close();
