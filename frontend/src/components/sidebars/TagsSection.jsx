import { Plus } from "lucide-react";
import { useTags } from "../../hooks/useTags";
import TagRow from "./TagRow";
import { Section, SectionHeader } from "./Section";

export function TagsSection({ onEdit, onDelete, onCreateClick }) {
  const tags = useTags();

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
        {tags.isLoading && <div>Loading...</div>}
        {tags.isError && <div>Error loading tags</div>}
        {!tags.isLoading &&
          !tags.isError &&
          tags.data?.length > 0 &&
          tags.data
            .slice(0, 12)
            .map((t) => (
              <TagRow
                key={t.id}
                tag={t}
                count={9}
                onEdit={() => onEdit(t)}
                onDelete={() => onDelete(t)}
              />
            ))}
        {!tags.isLoading && !tags.isError && tags.data?.length === 0 && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            No tags yet
          </div>
        )}
      </Section>
    </>
  );
}
