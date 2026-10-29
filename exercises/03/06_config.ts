// Exercise 6 (project): A typed config file
//
// The analytics app (the events from lesson 02) runs in two environments, and each one has its own
// settings. All of them live in one typed config file.
//
// 1. Replace `unknown` in Settings with an object type. Every property is readonly:
//        port       number
//        db         string
//        logLevel   "debug" | "info" | "warn" | "error"      (a union of literal types, lesson 02)
//        debug      boolean, optional (left out = off)
//        features   { [flag: string]: boolean }              (an index signature: any flag name)
//    Run tsc: it now finds a misspelled key inside the config. Fix it.
//
// 2. config has a type annotation:   const config: { [env: string]: Settings } = { ... }
//    That checks every environment, but then config's type IS the index signature: it forgets
//    which environments exist, and  config.anything  is "fine". The last line has a misspelled key,
//    and tsc says nothing (once summary works, Node crashes there).
//    Replace the annotation with satisfies:
//        const config = { ... } satisfies { [env: string]: Settings };
//    satisfies checks the value against the type, and config keeps its own type, with its keys.
//    Run tsc again: now it finds the misspelled key on the last line. Fix it.
//
// 3. summary(name, s): one line about one environment.
//        "production: port 8080, log warn, debug off, features: newCheckout"
//    - debug true -> "debug on"; false or left out -> "debug off"
//    - features: the names of the flags that are true, joined with ", ". None -> "none".
//    Hint: Object.entries(s.features) gives [name, on] pairs. filter them, then map to the name.
//
// When it's done, it prints:
//
//     development: port 3000, log debug, debug on, features: newCheckout, betaCharts
//     production: port 8080, log warn, debug off, features: newCheckout
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/03/06_config.ts
// Check it:    pnpm check 03

export type Settings = unknown;

export const config: { [env: string]: Settings } = {
  development: {
    port: 3000,
    db: "postgres://localhost:5432/pulse",
    logLevel: "debug",
    debug: true,
    features: { newCheckout: true, betaCharts: true },
  },
  production: {
    port: 8080,
    db: "postgres://db.internal:5432/pulse",
    logLevel: "warn",
    feautres: { newCheckout: true, betaCharts: false },
  },
};

export function summary(name: string, s: Settings): string {
  return "TODO";
}

console.log(summary("development", config.development));
console.log(summary("production", config.prodution));
