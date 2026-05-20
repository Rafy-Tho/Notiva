import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import EditTagForm from "./EditTagForm";

export function EditTagDialog({ tag, onClose }) {
  return (
    <Dialog open={!!tag} onOpenChange={(o) => !o && onClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit tag</DialogTitle>
        </DialogHeader>
        {tag && <EditTagForm tag={tag} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
