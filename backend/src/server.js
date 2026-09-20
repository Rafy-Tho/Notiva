import "dotenv/config";
import { connectMongo } from "./config/database.js";
import { app } from "./app/app.js";
import { setupRoutes } from "./app/routes.js";

const PORT = process.env.PORT;

async function server() {
  await connectMongo();
  setupRoutes(app);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

server().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
