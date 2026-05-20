import { useState } from "react";
import { Logo } from "../Logo";
import { ActionButtons } from "./ActionButtons";
import { NavSections } from "./NavSections";
import { NotebooksSection } from "./NotebooksSection";
import { TagsSection } from "./TagsSection";
import { UserSection } from "./UserSection";
import { CreateNotebookDialog } from "./CreateNotebookDialog";
import { CreateTagDialog } from "./CreateTagDialog";
import { EditNotebookDialog } from "./EditNotebookDialog";
import { EditTagDialog } from "./EditTagDialog";
import { DeleteTagDialog } from "./DeleteTagDialog";
import DeleteNotebookDialog from "./DeleteNotebookDialog";

export function SidebarInner() {
  const [createNotebookOpen, setCreateNotebookOpen] = useState(false);
  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [editNotebook, setEditNotebook] = useState(null);
  const [editTag, setEditTag] = useState(null);
  const [deleteNotebook, setDeleteNotebook] = useState(null);
  const [deleteTag, setDeleteTag] = useState(null);

  return (
    <>
      <div className="flex h-12 items-center justify-between px-3 border-b border-border">
        <Logo />
      </div>

      <ActionButtons />

      <nav className="flex-1 overflow-y-auto px-2 py-3 text-sm">
        <NavSections />
        <NotebooksSection
          onEdit={setEditNotebook}
          onDelete={setDeleteNotebook}
          onCreateClick={() => setCreateNotebookOpen(true)}
        />
        <TagsSection
          onEdit={setEditTag}
          onDelete={setDeleteTag}
          onCreateClick={() => setCreateTagOpen(true)}
        />
      </nav>

      <UserSection />

      <CreateNotebookDialog
        open={createNotebookOpen}
        onOpenChange={setCreateNotebookOpen}
      />

      <CreateTagDialog open={createTagOpen} onOpenChange={setCreateTagOpen} />

      <EditNotebookDialog
        notebook={editNotebook}
        onClose={() => setEditNotebook(null)}
      />

      <EditTagDialog tag={editTag} onClose={() => setEditTag(null)} />

      <DeleteNotebookDialog
        notebook={deleteNotebook}
        onClose={() => setDeleteNotebook(null)}
      />

      <DeleteTagDialog tag={deleteTag} onClose={() => setDeleteTag(null)} />
    </>
  );
}
