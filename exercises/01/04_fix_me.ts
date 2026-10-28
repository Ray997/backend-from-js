// Exercise 4: Fix me
//
// Node runs this file, prints the wrong things, and then crashes.
// tsc finds all 4 mistakes before anything runs. Run the type checker:
//
//     npx tsc
//
// Read each error (the last line of an error is the most precise one), fix one mistake,
// and run it again. Repeat until tsc prints nothing.
//
// When it's fixed, it prints:
//
//     Ada <ada@example.com>
//     37
//     adult
//     name,email,age
//
// Run it:      node exercises/01/04_fix_me.ts
// Check it:    pnpm check 01

type User = { name: string; email: string; age: number };

export function label(user: User): string {
  return `${user.name} <${user.emial}>`;
}

export function nextAge(user: User): number {
  let next = user.age;
  next = next + "1";
  return next;
}

// 18 and over: "adult". 13 to 17: "teen". Under 13: "child".
export function ageGroup(age: number): string {
  if (age >= 18) {
    return "adult";
  }
  if (age >= 13) {
    return "teen";
  }
}

const ada: User = { name: "Ada", email: "ada@example.com", age: 36 };
console.log(label(ada));
console.log(nextAge(ada));
console.log(ageGroup(ada.age));

// The names of User's fields, for a CSV header.
export const USER_FIELDS = Object.keys(User);
console.log(USER_FIELDS.join(","));
