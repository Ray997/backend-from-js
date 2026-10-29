// Exercise 6 (project): One event model, the other types derived from it
//
// AppEvent is the event as the server stores it. The server sets two of its fields itself: the id and
// the time it was created. A client only sends the rest, so the API needs two more types:
//
//     CreateEvent    what a client sends to create an event: everything except id and createdAt
//     UpdateEvent    what a client sends to change one: any of the CreateEvent fields, or none
//
// Don't copy the fields. Derive both types from AppEvent, so that a field added to AppEvent shows up in
// both of them by itself:
//
// 1. CreateEvent: Omit, with the two keys the server sets.
// 2. UpdateEvent: Partial, of CreateEvent. (id and createdAt are not in it, so nobody can change them.)
// 3. addEvent(store, input, now): a new AppEvent with the fields of input, the id "e" + (store.size + 1)
//    and createdAt = now. Put it in the store (a Map from id to event, lesson 04) and return it.
// 4. editEvent(store, id, patch): the stored event with the fields of patch on top, stored again and
//    returned. undefined when there's no event with that id.
//    Hint: { ...old, ...patch }
//
// When it's done, it prints:
//
//     created: e1 pageview /docs
//     created: e2 click /pricing
//     updated: e2 click /signup
//     not found: e9
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/05/06_events.ts
// Check it:    pnpm check 05

export type AppEvent = {
  id: string;
  type: "pageview" | "click" | "signup";
  path: string;
  userId: string;
  createdAt: Date;
};

export type CreateEvent = unknown; // TODO
export type UpdateEvent = unknown; // TODO

export type EventStore = Map<string, AppEvent>;

export function addEvent(store: EventStore, input: CreateEvent, now: Date): AppEvent {
  return { id: "", type: "pageview", path: "", userId: "", createdAt: now }; // TODO
}

export function editEvent(store: EventStore, id: string, patch: UpdateEvent): AppEvent | undefined {
  return undefined; // TODO
}

const store: EventStore = new Map();
const now = new Date();
const inputs: CreateEvent[] = [
  { type: "pageview", path: "/docs", userId: "u1" },
  { type: "click", path: "/pricing", userId: "u2" },
];
for (const input of inputs) {
  const e = addEvent(store, input, now);
  console.log(`created: ${e.id} ${e.type} ${e.path}`);
}
const changed = editEvent(store, "e2", { path: "/signup" });
console.log(changed ? `updated: ${changed.id} ${changed.type} ${changed.path}` : "updated nothing");
console.log(editEvent(store, "e9", { path: "/" }) ? "found e9?" : "not found: e9");
