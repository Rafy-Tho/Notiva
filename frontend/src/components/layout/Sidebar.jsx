import { Sheet, SheetContent } from "../ui/sheet";
import { useIsMobile } from "../../hooks/use-mobile";
import { useUIStore } from "../../store/useUIStore";
import { cn } from "../../lib/utils";
import { SidebarInner } from "../sidebars/SidebarInner";

export function Sidebar() {
  const isMobile = useIsMobile();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebar = useUIStore((state) => state.setSidebar);

  if (isMobile) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={setSidebar}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar flex flex-col">
          <SidebarInner />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "hidden md:flex h-full shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-out overflow-hidden",
        sidebarOpen ? "w-60" : "w-0 border-r-0",
      )}
    >
      <div
        className={cn("flex flex-col h-full w-60", !sidebarOpen && "invisible")}
      >
        <SidebarInner />
      </div>
    </aside>
  );
}
