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
import { useCreateTag } from "@/features/tags/hooks/useTags";

export function CreateTagDialog({ open, onOpenChange }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const createTag = useCreateTag();

  const handleCreate = async () => {
    try {
      await createTag.mutateAsync({ name, color });
      onOpenChange(false);
      setName("");
      setColor(COLORS[0]);
      toast.success("Tag created");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>New tag</DialogTitle>
        </DialogHeader>
        <NameColorForm
          name={name}
          setName={setName}
          color={color}
          setColor={setColor}
          placeholder="e.g. ideas"
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createTag.isPending}>
            {createTag.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
