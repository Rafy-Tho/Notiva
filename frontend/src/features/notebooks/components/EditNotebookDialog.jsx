import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditNotebookForm from "./EditNotebookForm";

export function EditNotebookDialog({ notebook, onClose }) {
  return (
    <Dialog open={!!notebook} onOpenChange={(o) => !o && onClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit notebook</DialogTitle>
        </DialogHeader>
        {notebook && (
          <EditNotebookForm notebook={notebook} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
