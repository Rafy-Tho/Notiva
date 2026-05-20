import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import NameColorForm from "../sidebars/NameColorForm";
import { useCreateNotebook } from "../../hooks/useNotebooks";

const COLORS = [
  "245 80% 66%",
  "200 80% 60%",
  "38 92% 60%",
  "142 65% 50%",
  "0 70% 60%",
  "280 70% 65%",
];

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
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
