import authRoutes from "../modules/auth/auth.routes.js";
import meRoutes from "../modules/users/user.routes.js";
import notebooksRoutes from "../modules/notebooks/notebook.routes.js";
import tagsRoutes from "../modules/tags/tag.routes.js";
import notesRoutes from "../modules/notes/note.routes.js";

export function setupRoutes(app) {
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/me", meRoutes);
  app.use("/api/v1/notebooks", notebooksRoutes);
  app.use("/api/v1/tags", tagsRoutes);
  app.use("/api/v1/notes", notesRoutes);
}
