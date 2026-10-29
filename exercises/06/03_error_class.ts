// Exercise 3: Your own Error class
//
// The best thing to throw is a real Error: it has a message, a name, and a stack (where it was thrown).
// Make your own kinds of Error with the fields you need:
//
//     class HttpError extends Error {
//       status: number;
//       constructor(status: number, message: string) {
//         super(message);            // Error keeps the message (and the stack)
//         this.name = "HttpError";   // Node shows this name instead of "Error"
//         this.status = status;
//       }
//     }
//
// A class is real JavaScript, not only a type, so  e instanceof HttpError  works at runtime, and it narrows e:
// inside the if, e is an HttpError and e.status is a number.
//
// Write each field the long way, like above. The short form  constructor(public status: number)  is an error with
// this course's settings (erasableSyntaxOnly): Node only erases types, and that form needs new JavaScript code.
//
// 1. NotFoundError: an Error with one more field, id (a string). Its constructor takes only the id:
//        new NotFoundError("u9")   has the name "NotFoundError", the message "no such user: u9" and the id "u9"
// 2. findUser(id): the user with that id. If there's none, throw a new NotFoundError(id) (not a string).
// 3. statusOf(e): the HTTP status for an error: 404 for a NotFoundError, 500 for anything else.
//
// When it's done, it prints:
//
//     Ana
//     404 no such user: u9
//     500
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/06/03_error_class.ts
// Check it:    pnpm check 06

export type User = { id: string; name: string };

const users: User[] = [{ id: "u1", name: "Ana" }, { id: "u2", name: "Mert" }];

export class NotFoundError extends Error {
  // TODO: the id field, and a constructor that takes the id
}

export function findUser(id: string): User {
  const user = users.find((u) => u.id === id);
  if (!user) throw "no such user"; // TODO: throw a NotFoundError
  return user;
}

export function statusOf(e: unknown): number {
  return 500; // TODO
}

console.log(findUser("u1").name);
try {
  findUser("u9");
} catch (e) {
  console.log(statusOf(e), e instanceof Error ? e.message : e);
}
try {
  JSON.parse("{oops");
} catch (e) {
  console.log(statusOf(e));
}
