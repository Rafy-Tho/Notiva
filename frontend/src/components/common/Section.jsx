export function Section({ children }) {
  return <div className="flex flex-col gap-0.5 mb-2">{children}</div>;
}

export function SectionHeader({ label, action }) {
  return (
    <div className="flex items-center justify-between px-2 mt-2 mb-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </span>
      {action}
    </div>
  );
}
