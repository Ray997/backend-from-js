// Helpers for lesson 09's exercises (you don't need to change this file).
//
//   const api = await serve(app);                           // starts your Express app on a free port
//   await send(`${api.url}/events/e1`)                      // "200 {...}": the status and the body, on one line
//   await send(`${api.url}/events`, "POST", { type: "click" })   // sends the object as JSON
//   await send(`${api.url}/events`, "POST", "{oops")        // a string is sent as it is (here: broken JSON)
//   api.close();                                            // stops it, so the program can end
//
// Everything runs on your own machine (localhost): no internet, no account.
import type { Express } from "express";

export async function serve(app: Express): Promise<{ url: string; close: () => void }> {
  const server = app.listen(0, "localhost");
  await new Promise<void>((done, fail) => {
    server.once("listening", done);
    server.once("error", fail);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  return {
    url: `http://localhost:${port}`,
    close: () => {
      server.closeAllConnections();
      server.close();
    },
  };
}

export async function send(url: string, method = "GET", body?: unknown): Promise<string> {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "content-type": "application/json" };
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  const res = await fetch(url, init);
  return `${res.status} ${await res.text()}`;
}
