import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NameColorForm from "@/components/common/NameColorForm";
import { COLORS } from "@/lib/colors";
import { useCreateNotebook } from "@/features/notebooks/hooks/useNotebooks";

export function CreateNotebookDialog({ open, onOpenChange }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const createNotebook = useCreateNotebook();

  const handleCreate = async () => {
    try {
      await createNotebook.mutateAsync({ name, color });
      onOpenChange(false);
      setName("");
      setColor(COLORS[0]);
      toast.success("Notebook created");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>New notebook</DialogTitle>
        </DialogHeader>
        <NameColorForm
          name={name}
          setName={setName}
          color={color}
          setColor={setColor}
          placeholder="e.g. Research"
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createNotebook.isPending}>
            {createNotebook.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
