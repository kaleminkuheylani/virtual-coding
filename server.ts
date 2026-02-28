import http from "node:http";
import next from "next";
import { attachTerminalWS } from "./backend/server";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

await app.prepare();

const server = http.createServer((req, res) => {
  handle(req, res);
});

attachTerminalWS(server);

const PORT = Number(process.env.PORT ?? 3000);
server.listen(PORT, () => {
  console.log(`Server listening on :${PORT} (Next.js + WebSocket terminal)`);
});
