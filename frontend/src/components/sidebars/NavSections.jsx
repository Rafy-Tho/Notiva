import { useEffect } from "react";
import { Archive, FileText, Star, Trash2 } from "lucide-react";
import { NavItem } from "./NavItem";
import { Section } from "./Section";
import { useNoteCountsStore } from "../../store/useNoteCountsStore";

export function NavSections() {
  const all = useNoteCountsStore((s) => s.all);
  const favorites = useNoteCountsStore((s) => s.favorites);
  const archive = useNoteCountsStore((s) => s.archive);
  const trash = useNoteCountsStore((s) => s.trash);
  const fetchCounts = useNoteCountsStore((s) => s.fetchCounts);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return (
    <Section>
      <NavItem to="/notes" icon={FileText} label="All notes" count={all} />
      <NavItem to="/favorites" icon={Star} label="Favorites" count={favorites} />
      <NavItem to="/archive" icon={Archive} label="Archive" count={archive} />
      <NavItem to="/trash" icon={Trash2} label="Trash" count={trash} />
    </Section>
  );
}
