import type { CreateEvent } from "./schema.ts";

export type AppEvent = CreateEvent & { id: string };
export type ApiError = { error: string; issues?: string[] };

export const events = new Map<string, AppEvent>();
