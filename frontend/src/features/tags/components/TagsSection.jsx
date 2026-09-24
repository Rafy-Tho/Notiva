import { Plus } from "lucide-react";
import { useTags } from "@/features/tags/hooks/useTags";
import TagRow from "./TagRow";
import { Section, SectionHeader } from "@/components/common/Section";
import { Skeleton } from "@/components/ui/skeleton";
import { useNoteCountsStore } from "@/store/useNoteCountsStore";

function getCount(tagsCounts, tagId) {
  const entry = tagsCounts.find((t) => t.id === tagId);
  return entry ? entry.count : 0;
}

export function TagsSection({ onEdit, onDelete, onCreateClick }) {
  const { data: tags, isLoading } = useTags();
  const tagsCounts = useNoteCountsStore((s) => s.tags);
  if (isLoading) {
    return (
      <>
        <SectionHeader label="Tags" />
        <Section>
          <div className="px-2 py-1.5 space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </Section>
      </>
    );
  }
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
            count={getCount(tagsCounts, t.id)}
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
