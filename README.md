# Backend From JS

Exercises for the **Backend From JS** video series on Tensor Engineer: from JavaScript to a typed, production backend.
You already know JavaScript. We start with TypeScript.

## Get started

1. **Node.js 22.18 or newer.** These versions run `.ts` files directly, without flags.
   Check it in a terminal:

   ```bash
   node --version
   ```

   Older, or no Node at all? Install the LTS version from [nodejs.org](https://nodejs.org).

2. **pnpm**, the package manager we use:

   ```bash
   npm install --global pnpm@latest
   ```

   On a Mac with Node from the nodejs.org installer, that can fail with `EACCES` (no permission).
   Use pnpm's own installer instead, and open a new terminal afterwards:

   ```bash
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   ```

   (Corepack, the old way, no longer ships with Node.js 25 and newer.)

3. **This folder.** The green **Code** button on GitHub, then **Download ZIP**. Unzip it.

4. Open the unzipped folder in VS Code (**File → Open Folder…**), then open its terminal (**Terminal → New Terminal**)
   and install the tools of the course (TypeScript, Vitest):

   ```bash
   pnpm install
   ```

## Do the exercises

Each lesson has its own folder in `exercises/`. Every file starts with a comment that tells you what to do.

Run an exercise (Node erases the types and runs the code; it does **not** check them):

```bash
node exercises/01/01_annotate.ts
```

Check all exercises of a lesson (this runs `tsc`, the type checker, and the lesson's tests):

```bash
pnpm check 01
```

You'll see a ✔ or ✘ next to each exercise, and a hint when something is not done yet.

## Try things: `play/`

`play/` is for the examples from the videos. Type-check everything in it with:

```bash
cd play
npx tsc
```

No output means no type errors.

Two examples you can run:

- `play/server.ts` (lesson 06): a tiny API that runs inside your own program, on localhost.
- `play/api.ts` (lessons 08 and 09): the events API with Express and Zod. Start it with `node api.ts` inside `play/`,
  then send it a request from a second terminal:

  ```bash
  curl -X POST localhost:3000/events -H "content-type: application/json" -d @good.json
  ```

  `garbage.json`, `almost.json`, `purchase.json` and `text-amount.json` are the other bodies from the videos.

## Lessons

| # | Lesson |
|---|---|
| 01 | Why TypeScript exists: types vanish at runtime, `tsc`, inference, `any` vs `unknown` |
| 02 | Narrowing and discriminated unions, `never` and `assertNever` |
| 03 | Function and object types: optional, default and rest parameters, `readonly`, index signatures, `satisfies` |
| 04 | Generics: type parameters, constraints with `extends`, `Result<T, E>` |
| 05 | Utility types: `keyof`, `T[K]`, `Partial`, `Pick`, `Omit`, `Record`, `ReturnType` |
| 06 | Async code and errors: `Promise`, `fetch`, `catch (e)` is `unknown`, Error classes, the Result pattern |
| 07 | Modules: CommonJS vs ES modules, `nodenext`, `.d.ts` files, `@types`, typing a library that has none |
| 08 | A typed API with Express 5: routes, `Request` and `Response` types, middleware |
| 09 | Zod: checking data at runtime, `safeParse`, `z.infer`, query strings with `z.coerce` |
| 10 | `tsconfig.json` line by line, `strict`, building a typed package for npm (`pulse`) |
