// pulse's first numbers. Exercise 5, step 1.
import type { PulseEvent } from "./events.ts";

// TODO countBy(events, key): how many events have each value of that key, as a Map.
//      countBy(events, "type")  ->  Map { "click" => 2, "purchase" => 1 }
//      key can only be a key of PulseEvent (K extends keyof PulseEvent), and the Map's keys have that key's type:
//      Map<PulseEvent[K], number>   (lessons 04 and 05)

// TODO revenue(events): the sum of every amount (an event without one counts as 0).

export {};
