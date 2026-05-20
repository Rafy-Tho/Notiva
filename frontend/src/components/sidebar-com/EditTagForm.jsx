import { useState } from "react";
import { toast } from "sonner";
import { useUpdateTag } from "../../hooks/useTags";
import NameColorForm from "./NameColorForm";
import { DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

function EditTagForm({ tag, onClose }) {
  const [n, setN] = useState(tag.name);
  const [c, setC] = useState(tag.color);
  const { mutateAsync } = useUpdateTag();
  const save = async () => {
    try {
      await mutateAsync({ id: tag.id, name: n, color: c });
      toast.success("Tag updated");
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
        placeholder="Tag name"
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

export default EditTagForm;
