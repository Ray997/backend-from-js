// Exercise 1: Routes, params and the query
//
// An Express app answers requests with handlers: app.get(path, (req, res) => { ... }).
// req is the request that came in, res is the response you send back (res.json(...) sends an object as JSON).
//
// 1. GET /hello/:name  ->  { hello: name }
//    ":name" is a route parameter: it matches any text, and Express puts it in req.params.name.
//    Hover over req.params in VS Code: TypeScript read { name: string } out of the path itself.
//
// 2. sum, for GET /sum/:a/:b  ->  { sum: a + b }
//    Give sum its type: RequestHandler<Params, ResBody>, with Params = { a: string; b: string } and
//    ResBody = { sum: number } | ApiError. Route parameters are ALWAYS strings: "2" and "3" add up to "23".
//    Turn them into numbers with Number(...). If one is not a number (Number.isNaN), answer 400 with
//    { error: "a and b must be numbers" }:   return res.status(400).json({ ... });
//
// 3. search, for GET /search?q=pri  ->  { results: [...] }: the PAGES that contain q.
//    Its type: RequestHandler<{}, { results: string[] } | ApiError>  ({} = no route parameters).
//    req.query.q is NOT just a string: the URL /search?q=a&q=b makes it an array, and /search has no q at all.
//    Hover over it. Narrow it: if it isn't a string, or it's "", answer 400 with { error: "q must be one string" }.
//
// When it's done, it prints:
//
//     /hello/ana 200 {"hello":"ana"}
//     /sum/2/3 200 {"sum":5}
//     /sum/2/x 400 {"error":"a and b must be numbers"}
//     /search?q=pri 200 {"results":["/pricing"]}
//     /search?q=a&q=b 400 {"error":"q must be one string"}
//     /search 400 {"error":"q must be one string"}
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/08/01_routes.ts
// Check it:    pnpm check 08

import express from "express";
import type { RequestHandler } from "express";
import { send, serve } from "./lib/serve.ts";

export type ApiError = { error: string };

export const PAGES = ["/", "/docs", "/pricing", "/signup"];

export const app = express();

app.get("/hello/:name", (req, res) => {
  res.json({}); // TODO
});

export const sum: RequestHandler = (req, res) => { // TODO: the type's slots
  res.json({}); // TODO
};
app.get("/sum/:a/:b", sum);

export const search: RequestHandler = (req, res) => { // TODO: the type's slots
  res.json({}); // TODO
};
app.get("/search", search);

const api = await serve(app);
for (const path of ["/hello/ana", "/sum/2/3", "/sum/2/x", "/search?q=pri", "/search?q=a&q=b", "/search"]) {
  console.log(path, await send(api.url + path));
}
api.close();
