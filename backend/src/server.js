import "dotenv/config";
import { connectMongo } from "./config/database.js";
import { app } from "./app/app.js";
import { setupRoutes } from "./app/routes.js";

const PORT = process.env.PORT;

async function server() {
  try {
    await connectMongo();
    setupRoutes(app);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err.message);
    process.exit(1);
  }
}

server();
