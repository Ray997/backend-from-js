import express from "express";
import type { RequestHandler } from "express";
import type { ZodError } from "zod";
import { events } from "./events.ts";
import type { ApiError, AppEvent } from "./events.ts";
import { logger, onError, requestId } from "./middleware.ts";
import { CreateEventSchema, ListQuerySchema } from "./schema.ts";

const app = express();
app.use(requestId, logger, express.json());

const issuesOf = (error: ZodError) =>
  error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);

const createEvent: RequestHandler<{}, AppEvent | ApiError, unknown> = (req, res) => {
  const input = CreateEventSchema.safeParse(req.body);
  if (!input.success) {
    return res.status(400).json({ error: "invalid body", issues: issuesOf(input.error) });
  }
  const event = { id: `e${events.size + 1}`, ...input.data };
  events.set(event.id, event);
  res.status(201).json(event);
};

const getEvent: RequestHandler<{ id: string }, AppEvent | ApiError> = (req, res) => {
  const event = events.get(req.params.id);
  if (!event) return res.status(404).json({ error: "no such event" });
  res.json(event);
};

const listEvents: RequestHandler<{}, AppEvent[] | ApiError> = (req, res) => {
  const query = ListQuerySchema.safeParse(req.query);
  if (!query.success) {
    return res.status(400).json({ error: "invalid query", issues: issuesOf(query.error) });
  }
  const { path, limit } = query.data;
  const found = [...events.values()].filter((e) => e.path.startsWith(path));
  res.json(found.slice(0, limit));
};

app.post("/events", createEvent);
app.get("/events/:id", getEvent);
app.get("/events", listEvents);
app.use(onError);

app.listen(3000, () => console.log("listening on http://localhost:3000"));
