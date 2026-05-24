import { Archive, FileText, Star, Trash2 } from "lucide-react";
import { NavItem } from "./NavItem";
import { Section } from "./Section";
import { useNotes } from "../../hooks/useNotes";

export function NavSections() {
  const { data = [] } = useNotes();

  const counts = data.reduce(
    (acc, note) => {
      if (note.deletedAt !== null) {
        acc.trash++;
        return acc;
      }

      acc.all++;

      if (note.isFavorite) {
        acc.favorites++;
      }

      if (note.isArchived) {
        acc.archive++;
      }

      return acc;
    },
    {
      all: 0,
      favorites: 0,
      archive: 0,
      trash: 0,
    },
  );
  return (
    <Section>
      <NavItem
        to="/notes"
        icon={FileText}
        label="All notes"
        count={counts.all}
      />
      <NavItem
        to="/favorites"
        icon={Star}
        label="Favorites"
        count={counts.favorites}
      />
      <NavItem
        to="/archive"
        icon={Archive}
        label="Archive"
        count={counts.archive}
      />
      <NavItem to="/trash" icon={Trash2} label="Trash" count={counts.trash} />
    </Section>
  );
}
