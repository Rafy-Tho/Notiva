import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { useDeleteNotebook } from "../../hooks/useNotebooks";
import { toast } from "sonner";

function DeleteNotebookDialog({ notebook, onClose }) {
  const { mutateAsync } = useDeleteNotebook();
  const [mode, setMode] = useState("move-uncategorized");
  const confirm = async () => {
    if (!notebook) return;
    try {
      await mutateAsync(notebook.id);
      toast.success("Notebook deleted");
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };
  return (
    <Dialog open={!!notebook} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete notebook “{notebook?.name}”?</DialogTitle>
          <DialogDescription>
            What should happen to the notes inside this notebook?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-1">
          <label
            className={cn(
              "flex items-start gap-3 rounded-md border p-3 cursor-pointer",
              mode === "move-uncategorized"
                ? "border-primary bg-primary/5"
                : "border-border",
            )}
          >
            <input
              type="radio"
              className="mt-1"
              checked={mode === "move-uncategorized"}
              onChange={() => setMode("move-uncategorized")}
            />
            <div>
              <div className="text-sm font-medium">
                Move notes to Uncategorized
              </div>
              <div className="text-xs text-muted-foreground">
                Notes will remain accessible under All notes.
              </div>
            </div>
          </label>
          <label
            className={cn(
              "flex items-start gap-3 rounded-md border p-3 cursor-pointer",
              mode === "delete-notes"
                ? "border-destructive bg-destructive/5"
                : "border-border",
            )}
          >
            <input
              type="radio"
              className="mt-1"
              checked={mode === "delete-notes"}
              onChange={() => setMode("delete-notes")}
            />
            <div>
              <div className="text-sm font-medium text-destructive">
                Delete notes too
              </div>
              <div className="text-xs text-muted-foreground">
                Permanently remove all notes inside.
              </div>
            </div>
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={mode === "delete-notes" ? "destructive" : "default"}
            onClick={confirm}
          >
            Delete notebook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteNotebookDialog;
