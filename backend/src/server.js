import "dotenv/config";
import { validateEnv } from "./config/env.js";
import { connectPostgres, shutdownPostgres } from "./db/prisma.js";
import { shutdownRedis } from "./config/redis.js";
import { app } from "./app/app.js";
import { setupRoutes } from "./app/routes.js";

const PORT = process.env.PORT;

validateEnv();

async function shutdown() {
  console.log("Shutting down...");
  await Promise.all([shutdownPostgres(), shutdownRedis()]);
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function server() {
  try {
    await connectPostgres();
    setupRoutes(app);
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    server.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Error starting server:", err.message);
    process.exit(1);
  }
}

server();
