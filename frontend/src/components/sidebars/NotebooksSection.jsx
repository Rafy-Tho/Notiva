import { Plus } from "lucide-react";
import { useNotebooks } from "../../hooks/useNotebooks";
import NotebookRow from "./NotebookRow";
import { Section, SectionHeader } from "./Section";
import { useNoteCountsStore } from "../../store/useNoteCountsStore";

function getCount(notebooksCounts, notebookId) {
  const entry = notebooksCounts.find((n) => n.id === notebookId);
  return entry ? entry.count : 0;
}

export function NotebooksSection({ onEdit, onDelete, onCreateClick }) {
  const { data: notebooks, isLoading: notebooksLoading } = useNotebooks();
  const notebooksCounts = useNoteCountsStore((s) => s.notebooks);
  if (notebooksLoading) return <div>Loading...</div>;
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
            count={getCount(notebooksCounts, nb.id)}
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
