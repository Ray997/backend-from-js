// Exercise 5: Fix me
//
// There are 4 mistakes. tsc finds 2 of them right away:
//
//     npx tsc
//
// The other 2 hide: tsc can't see them, and Node prints undefined where a plan's name should be.
// - NewUser is a copy, written by hand before User got its plan. Derive it from User instead
//   (everything but the id), and tsc shows you every signup that doesn't send a plan.
// - planNames accepts any key, so it never asks for one. Give it exactly the plans as keys
//   (a Record with Plan as its keys), and tsc tells you which name is missing.
//
// When it's fixed, it prints:
//
//     Ana Pro
//     Mert Free
//     upgraded: Pro, before: Free
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/05/05_fix_me.ts
// Check it:    pnpm check 05

export type User = { id: string; name: string; passwordHash: string; plan: "free" | "pro" };

// The plans a user can have: the type of User's plan field.
export type Plan = User["plans"];

// What a signup sends: everything but the id. (Copied by hand, before User had a plan.)
export type NewUser = { name: string; passwordHash: string };

// The name of every plan, for the page.
export const planNames: Record<string, string> = { free: "Free" };

const users = new Map<string, User>();

// The browser: sends a signup as JSON.
export function signupBody(input: NewUser): string {
  return JSON.stringify(input);
}

// The server: creates a user from what arrives.
export function createUser(body: string): User {
  const user: User = { ...JSON.parse(body), id: `u${users.size + 1}` };
  users.set(user.id, user);
  return user;
}

// A copy of the user, on another plan. The user it's given must stay as it is.
export function withPlan(user: Readonly<User>, plan: Plan): User {
  user.plan = plan;
  return user;
}

const ana = createUser(signupBody({ name: "Ana", passwordHash: "x9f2k1" }));
const mert = createUser(signupBody({ name: "Mert", passwordHash: "p0q7w3" }));
console.log(ana.name, planNames[ana.plan]);
console.log(mert.name, planNames[mert.plan]);
const pro = withPlan(mert, "pro");
console.log(`upgraded: ${planNames[pro.plan]}, before: ${planNames[mert.plan]}`);
