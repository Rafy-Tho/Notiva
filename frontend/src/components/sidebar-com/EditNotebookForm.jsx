import { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { DialogFooter } from "../ui/dialog";
import { useUpdateNotebook } from "../../hooks/useNotebooks";
import NameColorForm from "./NameColorForm";
function EditNotebookForm({ notebook, onClose }) {
  const [n, setN] = useState(notebook.name);
  const [c, setC] = useState(notebook.color);
  const { mutateAsync } = useUpdateNotebook();
  const save = async () => {
    try {
      await mutateAsync({ id: notebook.id, name: n, color: c });
      toast.success("Notebook updated");
      onClose();
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <>
      <NameColorForm
        name={n}
        setName={setN}
        color={c}
        setColor={setC}
        placeholder="Notebook name"
      />
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save}>Save</Button>
      </DialogFooter>
    </>
  );
}

export default EditNotebookForm;
