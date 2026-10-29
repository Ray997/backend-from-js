// Exercise 4: Fix me
//
// A small notes API. It has 4 mistakes, and tsc finds only 1 of them:
//
//     pnpm check 08
//
// The other 3 are in how Express is set up, and only show when requests come in. Run it, and compare what it
// prints with the expected output below:
//
//     node exercises/08/04_fix_me.ts
//
// Things to know:
//     - req.body is undefined unless something reads the body first: app.use(express.json()) before the routes.
//     - an error handler needs all FOUR parameters (err, req, res, next). With three, Express thinks it's normal
//       middleware, and calls it for every request instead of for errors.
//     - error handlers go AFTER the routes: Express only passes an error forward, to what comes later.
//
// When it's fixed, it prints:
//
//     201 {"id":"n2","text":"buy milk"}
//     400 {"error":"text must be a string"}
//     200 {"id":"n1","text":"types vanish at runtime"}
//     500 {"error":"internal error"}
//
// Run it:      node exercises/08/04_fix_me.ts
// Check it:    pnpm check 08

import express from "express";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { send, serve } from "./lib/serve.ts";

type Note = { id: string; text: string };
type ApiError = { error: string };

const notes = new Map<string, Note>([["n1", { id: "n1", text: "types vanish at runtime" }]]);

export const app = express();

const onError: ErrorRequestHandler = (err: unknown, req, res) => {
  res.status(500).json({ error: "internal error" });
};
app.use(onError);

const addNote: RequestHandler<{}, Note | ApiError, unknown> = (req, res) => {
  const body = req.body;
  if (typeof body !== "object" || body === null || !("text" in body) || typeof body.text !== "string") {
    return res.status(400).json({ error: "text must be a string" });
  }
  const note = { id: `n${notes.size + 1}`, text: body.text };
  notes.set(note.id, note);
  res.status(201).json(note);
};

const getNote: RequestHandler<{ id: string }, Note | ApiError> = (req, res) => {
  const note = notes.get(req.params.id);
  if (!note) return res.status(404).json({ eror: "no such note" });
  res.json(note);
};

app.post("/notes", addNote);
app.get("/notes/:id", getNote);
app.get("/crash", () => {
  throw new Error("something broke");
});

const api = await serve(app);
console.log(await send(`${api.url}/notes`, "POST", { text: "buy milk" }));
console.log(await send(`${api.url}/notes`, "POST", { text: 42 }));
console.log(await send(`${api.url}/notes/n1`));
console.log(await send(`${api.url}/crash`));
api.close();
