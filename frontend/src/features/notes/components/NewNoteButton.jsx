import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateNote } from "../hooks/useNotes";
import { useCreateNoteContext } from "../hooks/useCreateNoteContext";
import { Button } from "@/components/ui/button";

export function NewNoteButton() {
  const { mutateAsync: createNote, isPending: isCreating } = useCreateNote();
  const { defaults, basePath } = useCreateNoteContext();
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const note = await createNote(defaults);
      navigate(`${basePath}/${note.id}`);
      toast.success("Note created");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCreate}
      disabled={isCreating}
      className="h-8 gap-1.5"
      aria-label="New note"
    >
      <Plus className="h-4 w-4" />
      <span className="hidden sm:inline text-xs">
        {isCreating ? "Creating..." : "New"}
      </span>
    </Button>
  );
}