// Exercise 5 (project): A typed events API that doesn't accept garbage
//
// The events from lesson 05, over HTTP:
//
//     POST /events            body: a CreateEvent as JSON   -> 201 and the new event (id "e1", "e2", ...)
//                             anything else                 -> 400 { error: "..." }
//     GET  /events/:id                                      -> 200 the event, or 404 { error: "no such event" }
//     GET  /events?path=/pri                                -> 200 the events whose path starts with /pri
//                                                              (no path in the query, or not one string: "/")
//
// Typing req.body doesn't check it: RequestHandler<{}, ..., CreateEvent> is a claim, and a client can send
// anything. So:
//
// 1. readEvent(body: unknown): Result<CreateEvent>. Check the body, one field at a time, and narrow (lesson 02):
//        not an object, or null                    { ok: false, error: "the body must be a JSON object" }
//        type is not "pageview", "click", "signup"  { ok: false, error: "type must be pageview, click or signup" }
//        path is not a string                       { ok: false, error: "path must be a string" }
//        userId is not a string                     { ok: false, error: "userId must be a string" }
//    Otherwise { ok: true, value: { type, path, userId } }: a NEW object with only those three fields, so
//    nothing extra from the client (like "id" or "admin": true) gets in.
// 2. createEvent: make its body slot unknown (the honest type), and use readEvent: 400 with the error, or 201.
// 3. getEvent: 404 when there's no such event.
// 4. listEvents: narrow req.query.path.
// 5. onError (given) stays last.
//
// When it's done, it prints:
//
//     201 {"id":"e1","type":"click","path":"/pricing","userId":"u1"}
//     400 {"error":"type must be pageview, click or signup"}
//     400 {"error":"path must be a string"}
//     201 {"id":"e2","type":"pageview","path":"/docs","userId":"u2"}
//     200 {"id":"e1","type":"click","path":"/pricing","userId":"u1"}
//     404 {"error":"no such event"}
//     200 [{"id":"e1","type":"click","path":"/pricing","userId":"u1"}]
//
// Rules: no `any`, no `as`. (Lesson 09 does all of this with Zod: one schema, the check and the type.)
//
// Run it:      node exercises/08/05_events_api.ts
// Check it:    pnpm check 08

import express from "express";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { send, serve } from "./lib/serve.ts";

export type AppEvent = {
  id: string;
  type: "pageview" | "click" | "signup";
  path: string;
  userId: string;
};
export type CreateEvent = Omit<AppEvent, "id">;
export type ApiError = { error: string };
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const events = new Map<string, AppEvent>();

export function readEvent(body: unknown): Result<CreateEvent> {
  return { ok: false, error: "TODO" };
}

export const createEvent: RequestHandler<{}, AppEvent | ApiError, CreateEvent> = (req, res) => {
  // TODO: CreateEvent above is a claim nobody checks. Make the body slot unknown, and use readEvent.
  const event = { id: `e${events.size + 1}`, ...req.body };
  events.set(event.id, event);
  res.status(201).json(event);
};

export const getEvent: RequestHandler<{ id: string }, AppEvent | ApiError> = (req, res) => {
  const event = events.get(req.params.id);
  res.json(event); // TODO: 404 when there's no such event
};

export const listEvents: RequestHandler<{}, AppEvent[]> = (req, res) => {
  res.json([...events.values()]); // TODO: only the events whose path starts with req.query.path
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
console.log(await send(`${api.url}/events`, "POST", { type: 42 }));
console.log(await send(`${api.url}/events`, "POST", { type: "click", userId: "u1" }));
console.log(await send(`${api.url}/events`, "POST", { type: "pageview", path: "/docs", userId: "u2", admin: true }));
console.log(await send(`${api.url}/events/e1`));
console.log(await send(`${api.url}/events/e9`));
console.log(await send(`${api.url}/events?path=/pri`));
api.close();
