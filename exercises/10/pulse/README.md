# pulse

Typed events for pulse, a small analytics backend: the event schema (Zod) and a few counting functions.

```ts
import { CreateEventSchema, countBy, revenue } from "@your-name/pulse";

const event = CreateEventSchema.parse({ type: "click", path: "/pricing", userId: "u1" });
```

Made in the Backend From JS series on Tensor Engineer (episode 10).
