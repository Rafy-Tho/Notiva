import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function UnsavedDialog({
  blocked,
  isLeaving,
  onClose,
  onSaveAndLeave,
  onProceed,
}) {
  return (
    <AlertDialog
      open={blocked}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Are you sure you want to leave?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Stay</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLeaving}
            onClick={(event) => {
              event.preventDefault();
              void onSaveAndLeave();
            }}
          >
            {isLeaving ? "Saving..." : "Save and leave"}
          </AlertDialogAction>
          <AlertDialogAction
            className="bg-muted text-foreground hover:bg-muted/80"
            onClick={(event) => {
              event.preventDefault();
              onProceed();
            }}
          >
            Leave without saving
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}