import "dotenv/config";
import { validateEnv } from "./config/env.js";
import { connectMongo, shutdownMongo } from "./config/database.js";
import { shutdownRedis } from "./config/redis.js";
import { app } from "./app/app.js";
import { setupRoutes } from "./app/routes.js";

const PORT = process.env.PORT;

validateEnv();

async function shutdown() {
  console.log("Shutting down...");
  await Promise.all([shutdownMongo(), shutdownRedis()]);
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function server() {
  try {
    await connectMongo();
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
