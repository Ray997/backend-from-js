// Exercise 2: Optional, default and rest parameters
//
// In JavaScript you can call any function with fewer arguments: the missing ones are undefined.
// TypeScript makes you say which parameters may be left out:
//
//     function f(a: string, b?: number)     b is optional. Inside, its type is number | undefined.
//     function f(a: string, b = 10)         b has a default value. Callers may leave it out;
//                                           inside, it's always a number.
//     function f(...parts: string[])        a rest parameter: all the remaining arguments, in an array.
//
// Optional parameters come after the required ones.
//
// 1. dbUrl(host, port, database): a Postgres connection URL.
//        dbUrl("localhost")                     is "postgres://localhost:5432"
//        dbUrl("db.internal", 6432)             is "postgres://db.internal:6432"
//        dbUrl("localhost", 5432, "pulse")      is "postgres://localhost:5432/pulse"
//    port has the default value 5432. database is optional: no database -> nothing after the port.
//    Hint: database is string | undefined. Check it (lesson 02) before you use it.
//
// 2. route(...parts): a URL path made of its parts.
//        route("api", "v1", "events")   is "/api/v1/events"
//        route()                         is "/"
//
// Right now tsc refuses the calls at the bottom: the parameters are all required, and route takes
// one array instead of separate strings. Change the parameters, not the calls.
//
// Rules: no `any`.
//
// Run it:      node exercises/03/02_params.ts
// Check it:    pnpm check 03

export function dbUrl(host: string, port: number, database: string): string {
  return `postgres://${host}:${port}/${database}`;
}

export function route(parts: string[]): string {
  return "/" + parts.join("/");
}

console.log(dbUrl("localhost"));
console.log(dbUrl("db.internal", 6432));
console.log(dbUrl("localhost", 5432, "pulse"));
console.log(route("api", "v1", "events"));
console.log(route());
