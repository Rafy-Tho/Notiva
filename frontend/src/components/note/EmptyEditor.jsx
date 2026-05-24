import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateNoteContext } from "../../hooks/useCreateNoteContext";
import { useCreateNote } from "../../hooks/useNotes";
import { Button } from "../ui/button";
export function EmptyEditor() {
  const { mutateAsync: createNote } = useCreateNote();
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
    <div className="h-full grid place-items-center p-6 text-center">
      <div className="space-y-3 max-w-sm">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
          <FileText className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Pick a note or start writing</h2>
        <p className="text-sm text-muted-foreground">
          Use the list to open an existing note, or create a new one. Press ⌘K
          to search anything.
        </p>
        <Button
          onClick={handleCreate}
          className="bg-gradient-primary text-primary-foreground gap-2"
        >
          <Plus className="h-4 w-4" /> Create note
        </Button>
      </div>
    </div>
  );
}
