// Exercise 4: Fix me
//
// A small signups API. Its plans are "free", "pro" and "team". It has 4 mistakes, and tsc finds only 1 of them:
//
//     pnpm check 09
//
// The other 3 only show when requests come in. Run it, and compare what it prints with the expected output:
//
//     node exercises/09/04_fix_me.ts
//
// Things to know:
//     - a type written by hand next to a schema is a second description of the same data. When one changes and
//       the other doesn't, tsc often can't tell. Make the type FROM the schema (z.infer), and keep one list.
//     - parse throws a ZodError. In a handler, an error that's thrown ends up in the error handler: 500.
//       A client who sent a bad body should get a 400 with the issues: use safeParse.
//     - a URL is text: ?limit=1 gives the string "1". z.number() rejects a string. z.coerce.number() turns
//       it into a number first.
//     - safeParse's data is only there when success is true. Check success first.
//
// When it's fixed, it prints:
//
//     201 {"email":"mert@example.com","plan":"team"}
//     400 {"error":"invalid body","issues":["email: Invalid email address"]}
//     200 [{"email":"ana@example.com","plan":"pro"}]
//     400 {"error":"invalid query","issues":["limit: Too small: expected number to be >=1"]}
//
// Run it:      node exercises/09/04_fix_me.ts
// Check it:    pnpm check 09

import express from "express";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { z } from "zod";
import { send, serve } from "./lib/serve.ts";

const SignupSchema = z.object({
  email: z.email(),
  plan: z.enum(["free", "pro"]),
});
type Signup = { email: string; plan: "free" | "pro" | "team" };

const ListQuerySchema = z.object({
  limit: z.number().int().min(1).default(10),
});

type ApiError = { error: string; issues?: string[] };

const signups: Signup[] = [{ email: "ana@example.com", plan: "pro" }];

const issuesOf = (error: z.ZodError) => error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);

const addSignup: RequestHandler<{}, Signup | ApiError, unknown> = (req, res) => {
  const signup = SignupSchema.parse(req.body);
  signups.push(signup);
  res.status(201).json(signup);
};

const listSignups: RequestHandler<{}, Signup[] | ApiError> = (req, res) => {
  const query = ListQuerySchema.safeParse(req.query);
  res.json(signups.slice(0, query.data.limit));
};

const onError: ErrorRequestHandler = (err: unknown, req, res, next) => {
  res.status(500).json({ error: "internal error" });
};

export const app = express();
app.use(express.json());
app.post("/signups", addSignup);
app.get("/signups", listSignups);
app.use(onError);

const api = await serve(app);
console.log(await send(`${api.url}/signups`, "POST", { email: "mert@example.com", plan: "team" }));
console.log(await send(`${api.url}/signups`, "POST", { email: "mert", plan: "pro" }));
console.log(await send(`${api.url}/signups?limit=1`));
console.log(await send(`${api.url}/signups?limit=0`));
api.close();
