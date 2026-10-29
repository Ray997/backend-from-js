// Exercise 5 (project): pulse, a typed package
//
// pulse is the project of this series: a small analytics backend. Events come in (a click, a pageview, a
// purchase), get checked, stored and counted. Here it starts as a typed package in exercises/10/pulse/:
// its code, its tsconfig.json for the build, and its package.json. Work in that folder:
//
// 1. src/stats.ts: write countBy and revenue (the comments there say how).
// 2. src/index.ts: export what users may import (the comments there say what).
// 3. tsconfig.json: from "check only" to a build.
//        remove "noEmit" and "allowImportingTsExtensions"
//        "rootDir": "src"                          the source files are in src/
//        "outDir": "dist"                          write the output into dist/
//        "declaration": true                       a .d.ts next to every .js
//        "rewriteRelativeImportExtensions": true   "./events.ts" becomes "./events.js" in the .js files
//    Build it, from the pulse folder:   cd exercises/10/pulse   then   npx tsc
// 4. package.json:
//        "name"            a scope and a name: "@<your npm user name>/pulse" ("pulse" alone is taken on npm)
//        "version"         "0.1.0"
//        remove "private" (npm refuses to publish a private package) and "main"
//        "exports"         { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } }   (types first)
//        "files"           ["dist"]                         only dist/ goes into the package
//        "scripts"         { "build": "tsc", "prepublishOnly": "tsc" }   (a fresh build before every publish)
//        "dependencies"    { "zod": "^4.6.7" }              users of pulse need zod too: dist/ imports it
//        "devDependencies" { "typescript": "^7.0.2" }       only you need tsc
//        "publishConfig"   { "access": "public" }           a scoped package is private on npm unless you say so
// 5. In the pulse folder:   npm pack --dry-run   shows exactly what would be uploaded: dist/, package.json,
//    README.md. No src/, no tsconfig.json.   npm publish --dry-run   does everything except the upload.
//    The real upload needs your own npm account:  npm login,  then  npm publish  (see lessons/10.tr.md).
//
// This file is pulse's first user. It imports the package's source, so it runs before any build.
// When it's done, it prints:
//
//     Map(2) { 'click' => 2, 'purchase' => 1 }
//     revenue: 49
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/10/05_pulse.ts
// Check it:    pnpm check 10      (it builds pulse with tsc and runs npm pack --dry-run, so it takes a few seconds)

import { CreateEventSchema, countBy, revenue } from "./pulse/src/index.ts";
import type { PulseEvent } from "./pulse/src/index.ts";

const click = CreateEventSchema.parse({ type: "click", path: "/pricing", userId: "u1" });

export const events: PulseEvent[] = [
  { id: "e1", ...click },
  { id: "e2", type: "click", path: "/docs", userId: "u2" },
  { id: "e3", type: "purchase", path: "/checkout", userId: "u2", amount: 49 },
];

console.log(countBy(events, "type"));
console.log("revenue:", revenue(events));
