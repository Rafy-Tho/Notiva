import "dotenv/config";
import { connectMongo } from "./config/db.js";
import { app } from "./app.js";

const PORT = process.env.PORT;

async function server() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

server().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
