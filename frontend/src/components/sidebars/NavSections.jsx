import { Archive, FileText, Star, Trash2 } from "lucide-react";
import { NavItem } from "./NavItem";
import { Section } from "./Section";

export function NavSections() {
  return (
    <Section>
      <NavItem to="/notes" icon={FileText} label="All notes" count={3} />
      <NavItem to="/favorites" icon={Star} label="Favorites" count={4} />
      <NavItem to="/archive" icon={Archive} label="Archive" count={5} />
      <NavItem to="/trash" icon={Trash2} label="Trash" count={10} />
    </Section>
  );
}
