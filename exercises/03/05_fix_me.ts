// Exercise 5: Fix me
//
// Node won't even start this file: one of the mistakes is a SyntaxError for Node's type stripping too.
// (Fix that one, and Node prints one line and then crashes.)
// There are 4 mistakes. tsc finds 3 of them before anything runs:
//
//     npx tsc
//
// Fix those one by one. The 4th one is a bug tsc can't see: read the last line the program prints,
// and compare it with the comment above limitFor.
//
// When it's fixed, it prints:
//
//     listening on 0.0.0.0:8080
//     hosts: localhost, api.local
//     tags: api, v1
//     limit for Pro: 10000
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/03/05_fix_me.ts
// Check it:    pnpm check 03

type ServerConfig = { port: number; hosts: string[] };

// The address the server listens on. host may be left out: then it's "0.0.0.0".
export function listen(port: number, host?: string = "0.0.0.0"): string {
  return `listening on ${host}:${port}`;
}

const server: ServerConfig = { port: 8080, hots: ["localhost", "api.local"] };

// Any number of tags, joined with ", ".
export function tagList(...tags: string): string {
  return tags.join(", ");
}

// Requests per day for each plan. Plan names arrive in any case: "Pro", "PRO" or "pro".
const limits: { [plan: string]: number } = { free: 100, pro: 10_000 };

export function limitFor(plan: string): number {
  return limits[plan];
}

console.log(listen(server.port));
console.log("hosts: " + server.hosts.join(", "));
console.log("tags: " + tagList("api", "v1"));
console.log(`limit for Pro: ${limitFor("Pro")}`);
