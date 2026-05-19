import { cn } from "../lib/utils";

export function Logo({ className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-7 w-7 rounded-md bg-gradient-primary shadow-glow">
        <div className="absolute inset-[3px] rounded-[5px] bg-background/80 backdrop-blur" />
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-[11px] font-bold tracking-tight bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-transparent">
            N
          </span>
        </div>
      </div>
      <span className="font-semibold tracking-tight">NoteFlow</span>
    </div>
  );
}
