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

## Lessons

| # | Lesson |
|---|---|
| 01 | Why TypeScript exists: types vanish at runtime, `tsc`, inference, `any` vs `unknown` |
