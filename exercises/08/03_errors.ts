// Exercise 3: Errors reach one handler
//
// When a handler throws (or an async handler's promise rejects: Express 5 catches that too), Express skips the
// other routes and calls the error-handling middleware: (err, req, res, next) => { ... }, added with app.use AFTER
// the routes. Express knows it's an error handler by its FOUR parameters: keep next, even if you never call it.
//
// 1. HttpError: an Error with a status (a number). new HttpError(404, "no such event: e9")
//    has status 404, message "no such event: e9" and name "HttpError".
//    (No `constructor(public status: number)` shortcut: Node can't strip it. Declare the field, set it in the
//    constructor, like lesson 06.)
// 2. GET /events/:id: throw new HttpError(404, `no such event: ${id}`) when there's no such event.
// 3. onError, typed ErrorRequestHandler. Its type says err is any; write err: unknown and narrow it (lesson 06):
//      - an HttpError                        -> its status, { error: its message }
//      - a JSON parse error from express.json(): an object whose type is "entity.parse.failed"
//                                            -> 400, { error: "the body is not valid JSON" }
//      - anything else                       -> push String(err) into errors (our "server log"),
//                                               then 500, { error: "internal error" }
//    The details stay on the server. The client only gets the short answer.
//
// When it's done, it prints:
//
//     200 {"id":"e1","path":"/pricing"}
//     404 {"error":"no such event: e9"}
//     500 {"error":"internal error"}
//     400 {"error":"the body is not valid JSON"}
//     200 {"got":{"path":"/docs"}}
//     server log: Error: database is down
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/08/03_errors.ts
// Check it:    pnpm check 08

import express from "express";
import type { ErrorRequestHandler } from "express";
import { send, serve } from "./lib/serve.ts";

export const errors: string[] = [];

export class HttpError extends Error {
  // TODO: a status field, and a constructor(status, message)
}

const events = new Map([["e1", { id: "e1", path: "/pricing" }]]);

export const app = express();
app.use(express.json());

app.get("/events/:id", (req, res) => {
  const event = events.get(req.params.id);
  res.json(event); // TODO: throw an HttpError (404) when there's no such event
});

// an async handler whose promise rejects: Express 5 passes the error to onError
app.get("/stats", async () => {
  await new Promise((done) => setTimeout(done, 10));
  throw new Error("database is down");
});

app.post("/echo", (req, res) => {
  res.json({ got: req.body });
});

export const onError: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({ error: "internal error" }); // TODO: err: unknown, and the three cases
};
app.use(onError);

const api = await serve(app);
console.log(await send(`${api.url}/events/e1`));
console.log(await send(`${api.url}/events/e9`));
console.log(await send(`${api.url}/stats`));
console.log(await send(`${api.url}/echo`, "POST", "{oops"));
console.log(await send(`${api.url}/echo`, "POST", { path: "/docs" }));
api.close();
console.log(`server log: ${errors.join(", ")}`);
