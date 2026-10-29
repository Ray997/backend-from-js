// Exercise 4: Index signatures
//
// Some objects are dictionaries: you don't know the keys in advance, only what the values are.
// A .env file is one: any name, and every value is text.
//
//     type Env = { [key: string]: string };     // any string key, and every value is a string
//
// `key` is only a label: the part that matters is  [ ... : string]  (the keys) and  : string  (the values).
//
// 1. Replace `unknown` in Env with that index signature.
//
// 2. parseEnv(text): read the text of a .env file into an Env.
//        "PORT=8080\nHOST=0.0.0.0"    ->    { PORT: "8080", HOST: "0.0.0.0" }
//    - one KEY=value per line; trim the key and the value
//    - skip empty lines, and lines that start with # (comments)
//    - split at the FIRST "=" only:   "DB=postgres://x?ssl=true"  ->  { DB: "postgres://x?ssl=true" }
//    Hint: text.split("\n"), then  const i = line.indexOf("=");  line.slice(0, i)  and  line.slice(i + 1)
//
// 3. envOr(env, key, fallback): the value of key, or fallback when the key isn't there.
//        envOr({ PORT: "8080" }, "PORT", "3000")         is "8080"
//        envOr({ PORT: "8080" }, "HOST", "localhost")    is "localhost"
//    Careful: TypeScript says env[key] is a string, for ANY key. An index signature can't know which
//    keys exist, so it trusts you. At runtime, a missing key gives undefined.
//
// When it's done, it prints:
//
//     { PORT: '8080', HOST: '0.0.0.0', DB: 'postgres://db/pulse?ssl=true' }
//     8080 info
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/03/04_index.ts
// Check it:    pnpm check 03

export type Env = unknown;

export function parseEnv(text: string): Env {
  const env: Env = {};
  // TODO: one KEY=value per line
  return env;
}

export function envOr(env: Env, key: string, fallback: string): string {
  return fallback; // TODO
}

const env = parseEnv("# server\nPORT=8080\n\nHOST = 0.0.0.0\nDB=postgres://db/pulse?ssl=true\n");
console.log(env);
console.log(envOr(env, "PORT", "3000"), envOr(env, "LOG_LEVEL", "info"));
