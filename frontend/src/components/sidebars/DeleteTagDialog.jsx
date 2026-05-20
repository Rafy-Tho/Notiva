import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useDeleteTag } from "../../hooks/useTags";

export function DeleteTagDialog({ tag, onClose }) {
  const deleteTag = useDeleteTag();

  const handleDelete = async () => {
    if (!tag) return;
    try {
      await deleteTag.mutateAsync(tag.id);
      onClose();
      toast.success("Tag deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={!!tag} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete tag “{tag?.name}”?</DialogTitle>
          <DialogDescription>
            The tag will be removed from all notes. The notes themselves are
            kept.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
