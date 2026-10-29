import { z } from "zod";

export const CreateEventSchema = z.object({
  type: z.enum(["pageview", "click", "signup", "purchase"]),
  path: z.string(),
  userId: z.string(),
  amount: z.number().positive().optional(),
});
export type CreateEvent = z.infer<typeof CreateEventSchema>;

export const ListQuerySchema = z.object({
  path: z.string().default("/"),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
