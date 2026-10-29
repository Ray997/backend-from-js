// Exercise 2: catch (e) is unknown: narrow it before you touch it
//
// In JavaScript you can throw anything: an Error, a string, an object, a number. So in strict mode, TypeScript
// gives a caught error the type unknown. Before you use it, narrow it (lesson 02):
//
//     e instanceof Error                                   an Error, or a class that extends Error
//     typeof e === "string"                                a string
//     typeof e === "object" && e !== null && "message" in e    an object with a message field
//                                                          (the field's type is unknown too: check it as well)
//
// The quick fixes  catch (e: any)  and  e as Error  don't check anything: they only switch the check off.
//
// 1. messageOf(e): a readable message for any thrown value:
//        an Error                          its message           messageOf(new Error("boom"))            is  "boom"
//        a string                          the string itself     messageOf("timeout")                    is  "timeout"
//        an object with a string message   that message          messageOf({ message: "bad gateway" })   is  "bad gateway"
//        anything else                     "unknown error: " + JSON.stringify(e)
//                                                                messageOf({ status: 404 })   is  'unknown error: {"status":404}'
//                                                                messageOf(42)                is  "unknown error: 42"
//
// 2. isTimeout(e): true when e is an Error whose name is "TimeoutError" (what AbortSignal.timeout gives you),
//    false for anything else.
//
// When it's done, it prints:
//
//     boom
//     timeout
//     bad gateway
//     unknown error: {"status":404}
//     unknown error: 42
//     true false
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/06/02_narrow.ts
// Check it:    pnpm check 06

export function messageOf(e: unknown): string {
  return ""; // TODO
}

export function isTimeout(e: unknown): boolean {
  return false; // TODO
}

const thrown: unknown[] = [new Error("boom"), "timeout", { message: "bad gateway" }, { status: 404 }, 42];
for (const value of thrown) {
  try {
    throw value;
  } catch (e) {
    console.log(messageOf(e));
  }
}

// a real timeout: give up after 1 millisecond, then look at the reason
const signal = AbortSignal.timeout(1);
await new Promise((done) => setTimeout(done, 20));
console.log(isTimeout(signal.reason), isTimeout("TimeoutError"));
