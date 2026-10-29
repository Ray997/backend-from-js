// pulse's events: the schema checks an event while the code runs, and the type comes from it (lesson 09).
import { z } from "zod";

export const CreateEventSchema = z.object({
  type: z.enum(["pageview", "click", "signup", "purchase"]),
  path: z.string(),
  userId: z.string(),
  amount: z.number().positive().optional(),
});
export type CreateEvent = z.infer<typeof CreateEventSchema>;

export type PulseEvent = CreateEvent & { id: string };
