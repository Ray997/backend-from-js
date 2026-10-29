// Exercise 2: Middleware, and a new field on req
//
// Middleware is a function that runs BEFORE the route's handler: (req, res, next) => { ... }.
// It can read and change req and res, and then it calls next() to pass the request on (to the next middleware,
// or to the route). app.use(a, b) adds middleware; they run in the order you add them.
//
// 1. requestId: gives every request an id: "r1", "r2", "r3", ... (count the requests).
//    Put it on req.requestId, send it back in the response header "x-request-id" (res.setHeader), call next().
//    req.requestId is a type error at first: Express's Request has no such field. Don't use `as any`.
//    Add the field to Express's own Request interface (declaration merging, like declare module in lesson 07):
//
//        declare global {
//          namespace Express {
//            interface Request {
//              requestId: string;
//            }
//          }
//        }
//
//    That's a promise to TypeScript: every request has it. Keep the promise: app.use(requestId) before the routes.
// 2. logger: when the response is finished (res.on("finish", () => { ... })), push one line into log:
//        "r1 GET /ping 200"        the id, req.method, req.originalUrl, res.statusCode
//    Then call next() (right away: "finish" comes later).
// 3. app.use(requestId, logger) before the routes. Give both middlewares the type RequestHandler.
//
// When it's done, it prints:
//
//     200 {"pong":true}
//     r1 GET /ping 200
//     r2 GET /nope 404
//     r3 POST /ping 404
//
// (/nope has no route: Express answers 404 by itself, and your logger still sees it.)
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/08/02_middleware.ts
// Check it:    pnpm check 08

import express from "express";
import type { RequestHandler } from "express";
import { send, serve } from "./lib/serve.ts";

// TODO: add requestId to Express's Request (see 1. above)

export const log: string[] = [];
let count = 0;

export const requestId: RequestHandler = (req, res, next) => {
  next(); // TODO: count, req.requestId, the x-request-id header
};

export const logger: RequestHandler = (req, res, next) => {
  next(); // TODO: push a line into log when the response is finished
};

export const app = express();
// TODO: app.use the two middlewares, before the routes

app.get("/ping", (req, res) => {
  res.json({ pong: true });
});

const api = await serve(app);
console.log(await send(`${api.url}/ping`));
await send(`${api.url}/nope`);
await send(`${api.url}/ping`, "POST");
api.close();
console.log(log.join("\n"));
