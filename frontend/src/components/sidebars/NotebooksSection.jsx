import { Plus } from "lucide-react";
import { useNotebooks } from "../../hooks/useNotebooks";
import NotebookRow from "./NotebookRow";
import { Section, SectionHeader } from "./Section";
import { useNotes } from "../../hooks/useNotes";

export function NotebooksSection({ onEdit, onDelete, onCreateClick }) {
  const { data: notebooks, isLoading: notebooksLoading } = useNotebooks();
  const { data: notes, isLoading } = useNotes();
  if (isLoading || notebooksLoading) return <div>Loading...</div>;
  return (
    <>
      <SectionHeader
        label="Notebooks"
        action={
          <button
            onClick={onCreateClick}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        }
      />
      <Section>
        {notebooks.map((nb) => (
          <NotebookRow
            key={nb.id}
            notebook={nb}
            count={notes.filter((n) => n.notebookId === nb.id).length}
            onEdit={() => onEdit(nb)}
            onDelete={() => onDelete(nb)}
          />
        ))}
        {notebooks.length === 0 && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            No notebooks yet
          </div>
        )}
      </Section>
    </>
  );
}
