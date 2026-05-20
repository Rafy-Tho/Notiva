import { cn } from "../../lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
const COLORS = [
  "245 80% 66%",
  "200 80% 60%",
  "38 92% 60%",
  "142 65% 50%",
  "0 70% 60%",
  "280 70% 65%",
];
function NameColorForm({ name, setName, color, setColor, placeholder }) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="nc-name">Name</Label>
        <Input
          id="nc-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className="mt-2"
        />
      </div>
      <div>
        <Label>Color</Label>
        <div className="flex gap-2 mt-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "h-6 w-6 rounded-full border-2",
                color === c ? "border-foreground" : "border-transparent",
              )}
              style={{ backgroundColor: `hsl(${c})` }}
              aria-label={`color ${c}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NameColorForm;
