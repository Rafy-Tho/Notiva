import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/colors";

function ColorPicker({ color, setColor, colors }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setColor(c)}
          className={cn(
            "h-6 w-6 rounded-md border-2",
            color === c ? "border-foreground" : "border-transparent",
          )}
          style={{ backgroundColor: `hsl(${c})` }}
          aria-label={`color ${c}`}
        />
      ))}
    </div>
  );
}

export default function NameColorForm({
  name,
  setName,
  color,
  setColor,
  placeholder,
}) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
      <ColorPicker color={color} setColor={setColor} colors={COLORS} />
    </div>
  );
}