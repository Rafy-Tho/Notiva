import { RotateCcw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function TrashBanner({ noteTitle, onRestore, onPurge }) {
  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-12 pt-4 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Trash2 className="h-3.5 w-3.5" />
          This note is in Trash. Restore it to keep editing.
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-[11px]"
            onClick={onRestore}
          >
            <RotateCcw className="h-3 w-3" /> Restore
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-[11px] text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" /> Delete forever
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete note permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove "{noteTitle || "Untitled"}" and
                  all of its version history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onPurge}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete forever
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}