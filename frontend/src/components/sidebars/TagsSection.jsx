import { Plus } from "lucide-react";
import { useTags } from "../../hooks/useTags";
import TagRow from "./TagRow";
import { Section, SectionHeader } from "./Section";
import { useNotes } from "../../hooks/useNotes";

export function TagsSection({ onEdit, onDelete, onCreateClick }) {
  const { data: tags, isLoading } = useTags();
  const { data: notes, isLoading: notesLoading } = useNotes();
  if (isLoading || notesLoading) return <div>Loading...</div>;
  return (
    <>
      <SectionHeader
        label="Tags"
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
        {tags.slice(0, 12).map((t) => (
          <TagRow
            key={t.id}
            tag={t}
            count={notes.filter((n) => n.tagIds.includes(t.id)).length}
            onEdit={() => onEdit(t)}
            onDelete={() => onDelete(t)}
          />
        ))}
        {tags.length === 0 && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            No tags yet
          </div>
        )}
      </Section>
    </>
  );
}
