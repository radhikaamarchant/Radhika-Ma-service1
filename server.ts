import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);
  
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  let globalState: any = null;

  io.on("connection", (socket) => {
    // When a new client connects, send them the latest state if we have it
    if (globalState) {
      socket.emit("sync_full_state", globalState);
    } else {
      // If server just restarted and has no state, ask this client for its state
      socket.emit("request_full_state");
    }

    // Client provides full state (e.g. on initial load or after a change)
    socket.on("provide_full_state", (state) => {
      globalState = state;
      socket.broadcast.emit("sync_full_state", state);
    });

    socket.on("dispatch_action", (data) => {
      // Broadcast the action to all other connected clients
      socket.broadcast.emit("receive_action", data);
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
