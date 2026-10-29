// server.ts: a tiny API for lesson 06. It runs inside your own program, on your own machine:
// no internet and no account needed.
//
//   const api = await startServer();   // api.url is "http://localhost:4000"
//   ...                                // fetch(`${api.url}/users/u1`) ...
//   api.close();                       // stop it, so the program can end
//
// startServer(0) picks any free port instead of 4000 (the exercises do that, so they never get in each other's way).
//
//   GET /users/u1          200  { "id": "u1", "name": "Ana" }
//   GET /users/u2          200  { "id": "u2", "name": "Mert" }
//   GET /users/<other>     404  { "error": "no such user" }
//   GET /users/u1/orders   200  [ { "id": "o1", "total": 30 }, { "id": "o2", "total": 12.5 } ]
//   GET /broken            200, but the answer is not JSON
//   GET /slow              answers only after 3 seconds
import { createServer } from "node:http";

const users: { [id: string]: { id: string; name: string } } = {
  u1: { id: "u1", name: "Ana" },
  u2: { id: "u2", name: "Mert" },
};
const orders: { [id: string]: { id: string; total: number }[] } = {
  u1: [{ id: "o1", total: 30 }, { id: "o2", total: 12.5 }],
  u2: [],
};

export async function startServer(port = 4000): Promise<{ url: string; close: () => void }> {
  const server = createServer((req, res) => {
    const send = (status: number, body: string) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(body);
    };
    const url = req.url ?? "";
    const user = url.match(/^\/users\/(\w+)$/);
    const userOrders = url.match(/^\/users\/(\w+)\/orders$/);
    if (user) {
      const found = users[user[1]];
      return found ? send(200, JSON.stringify(found)) : send(404, JSON.stringify({ error: "no such user" }));
    }
    if (userOrders) {
      const found = orders[userOrders[1]];
      return found ? send(200, JSON.stringify(found)) : send(404, JSON.stringify({ error: "no such user" }));
    }
    if (url === "/broken") return send(200, "<html>oops</html>");
    if (url === "/slow") {
      setTimeout(() => send(200, JSON.stringify(users.u1)), 3000).unref();
      return;
    }
    send(404, JSON.stringify({ error: "no such page" }));
  });
  await new Promise<void>((done) => server.listen(port, "localhost", done));
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;
  return {
    url: `http://localhost:${actualPort}`,
    close: () => {
      server.closeAllConnections();
      server.close();
    },
  };
}
