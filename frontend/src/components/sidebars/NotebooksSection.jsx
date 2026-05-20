import { Plus } from "lucide-react";
import { useNotebooks } from "../../hooks/useNotebooks";
import NotebookRow from "./NotebookRow";
import { Section, SectionHeader } from "./Section";

export function NotebooksSection({ onEdit, onDelete, onCreateClick }) {
  const notebooks = useNotebooks();

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
        {notebooks.isLoading && <div>Loading...</div>}
        {notebooks.isError && <div>Error loading notebooks</div>}
        {!notebooks.isLoading &&
          !notebooks.isError &&
          notebooks.data?.length > 0 &&
          notebooks.data.map((nb) => (
            <NotebookRow
              key={nb.id}
              notebook={nb}
              count={6}
              onEdit={() => onEdit(nb)}
              onDelete={() => onDelete(nb)}
            />
          ))}
        {!notebooks.isLoading &&
          !notebooks.isError &&
          notebooks.data?.length === 0 && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              No notebooks yet
            </div>
          )}
      </Section>
    </>
  );
}
