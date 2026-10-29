// Exercise 5 (project): The events API, checked by Zod
//
// Lesson 08's events API checked its body with readEvent: twenty lines of if, and a CreateEvent type written
// next to it by hand. Two descriptions of one event, and nothing kept them the same. Now one schema does both:
// it checks the data while the code runs, and the type comes from it.
//
//     POST /events            a CreateEvent as JSON         -> 201 and the new event (id "e1", "e2", ...)
//                             anything else                 -> 400 { error: "invalid body", issues: [...] }
//     GET  /events/:id                                      -> 200 the event, or 404 { error: "no such event" }
//     GET  /events?path=/pri&limit=2                        -> 200 at most `limit` events whose path starts with `path`
//                             a bad query                   -> 400 { error: "invalid query", issues: [...] }
//
// 1. CreateEventSchema: an object with
//        type      "pageview", "click", "signup" or "purchase"
//        path      a string
//        userId    a string
//        amount    a number above 0, optional (purchases have one)
//    CreateEvent: from the schema (z.infer). Don't write its fields by hand.
// 2. ListQuerySchema: an object with
//        path      a string, "/" when it's missing
//        limit     a whole number from 1 to 100, from the URL's text (coerce), 10 when it's missing
// 3. issuesOf(error: z.ZodError): string[]: one "<path>: <message>" per issue (the path joined with ".").
// 4. createEvent: safeParse the body: 400 with the issues, or 201 with { id, ...the data }.
// 5. getEvent: 404 when there's no such event.
// 6. listEvents: safeParse req.query: 400 with the issues, or the events whose path starts with path,
//    at most limit of them.
//
// When it's done, it prints:
//
//     201 {"id":"e1","type":"click","path":"/pricing","userId":"u1"}
//     400 {"error":"invalid body","issues":["path: Invalid input: expected string, received number"]}
//     201 {"id":"e2","type":"purchase","path":"/checkout","userId":"u2","amount":49}
//     400 {"error":"invalid body","issues":["amount: Invalid input: expected number, received string"]}
//     201 {"id":"e3","type":"pageview","path":"/docs","userId":"u3"}
//     200 {"id":"e1","type":"click","path":"/pricing","userId":"u1"}
//     404 {"error":"no such event"}
//     200 [{"id":"e1","type":"click","path":"/pricing","userId":"u1"}]
//     200 2
//     400 {"error":"invalid query","issues":["limit: Invalid input: expected number, received NaN"]}
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/09/05_events_api.ts
// Check it:    pnpm check 09

import express from "express";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { z } from "zod";
import { send, serve } from "./lib/serve.ts";

export const CreateEventSchema = z.object({
  // TODO: type, path, userId, amount
});
export type CreateEvent = { type: string; path: string; userId: string }; // TODO: from the schema

export const ListQuerySchema = z.object({
  // TODO: path, limit
});

export type AppEvent = CreateEvent & { id: string };
export type ApiError = { error: string; issues?: string[] };

const events = new Map<string, AppEvent>();

export function issuesOf(error: z.ZodError): string[] {
  return []; // TODO
}

export const createEvent: RequestHandler<{}, AppEvent | ApiError, unknown> = (req, res) => {
  // TODO: safeParse the body: 400 with the issues, or 201
  const event = { id: `e${events.size + 1}`, type: "click", path: "/", userId: "?" };
  events.set(event.id, event);
  res.status(201).json(event);
};

export const getEvent: RequestHandler<{ id: string }, AppEvent | ApiError> = (req, res) => {
  const event = events.get(req.params.id);
  // TODO: 404 when there's no such event
  res.json(event);
};

export const listEvents: RequestHandler<{}, AppEvent[] | ApiError> = (req, res) => {
  // TODO: safeParse req.query: 400 with the issues, or at most limit events whose path starts with path
  res.json([...events.values()]);
};

const onError: ErrorRequestHandler = (err: unknown, req, res, next) => {
  res.status(500).json({ error: "internal error" });
};

export const app = express();
app.use(express.json());
app.post("/events", createEvent);
app.get("/events/:id", getEvent);
app.get("/events", listEvents);
app.use(onError);

const api = await serve(app);
console.log(await send(`${api.url}/events`, "POST", { type: "click", path: "/pricing", userId: "u1" }));
console.log(await send(`${api.url}/events`, "POST", { type: "click", path: 42, userId: "u1" }));
console.log(await send(`${api.url}/events`, "POST", { type: "purchase", path: "/checkout", userId: "u2", amount: 49 }));
console.log(await send(`${api.url}/events`, "POST", { type: "purchase", path: "/checkout", userId: "u2", amount: "49" }));
console.log(await send(`${api.url}/events`, "POST", { type: "pageview", path: "/docs", userId: "u3", admin: true }));
console.log(await send(`${api.url}/events/e1`));
console.log(await send(`${api.url}/events/e9`));
console.log(await send(`${api.url}/events?path=/pri`));
const two = await send(`${api.url}/events?limit=2`);
console.log(two.slice(0, 3), two.match(/"id"/g)?.length);
console.log(await send(`${api.url}/events?limit=abc`));
api.close();
