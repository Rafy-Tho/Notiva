import { saveAs } from "file-saver";
import JSZip from "jszip";
import {
  Check,
  Database,
  Download,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  Palette,
  ShieldAlert,
  Sun,
  Trash2,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
} from "../components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import {
  useChangePassword,
  useRemoveAvatar,
  useUpdateAvatar,
  useUpdateUser,
} from "../hooks/useMe";
import { htmlToText } from "../lib/sanitize";
import { cn } from "../lib/utils";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/useUIStore";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const deleteAccount = useAuthStore((s) => s.delete);
  const theme = useUIStore((s) => s.theme);
  const fontPref = useUIStore((s) => s.fontPref);
  const setFontPref = useUIStore((s) => s.setFontPref);
  const setTheme = useUIStore((s) => s.setTheme);
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const fileRef = useRef(null);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNext, setPwNext] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const { mutateAsync: updateAvatar } = useUpdateAvatar();
  const { mutateAsync: removeAv } = useRemoveAvatar();
  const { mutateAsync: updateMe, isPending: namePending } = useUpdateUser();
  const { mutateAsync: changePassword, isPending: pwPending } =
    useChangePassword();

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  if (!user) return null;

  const dirty =
    name.trim() !== (user.name || "").trim() && name.trim().length > 0;

  const updateProfile = async () => {
    if (!dirty) return;
    await updateMe(name);
    try {
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const exportZip = async () => {
    const notes = [];
    if (notes.length === 0) {
      toast.info("No notes to export");
      return;
    }
    const zip = new JSZip();
    notes.forEach((n) => {
      const safe = (n.title || "untitled")
        .replace(/[^a-z0-9-_ ]/gi, "_")
        .slice(0, 60);
      zip.file(
        `${safe}-${n.id.slice(0, 6)}.md`,
        `# ${n.title}\n\n${htmlToText(n.content)}`,
      );
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "noteflow-export.zip");
    toast.success(
      `Exported ${notes.length} note${notes.length === 1 ? "" : "s"}`,
    );
  };

  const handleDelete = async () => {
    try {
      await deleteAccount();
      toast.success("Account deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onAvatarPick = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      const result = await updateAvatar(form);
      setUser(result);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeAvatar = async () => {
    const result = await removeAv();
    setUser(result);
    toast.success("Avatar removed");
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (pwNext !== pwConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (pwNext.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      await changePassword({ oldPassword: pwCurrent, newPassword: pwNext });
      setPwCurrent("");
      setPwNext("");
      setPwConfirm("");
      toast.success("Password updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-5 py-8 md:px-10 md:py-12 space-y-10">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, appearance and workspace data.
          </p>
        </header>

        {/* Profile */}
        <SettingsSection
          icon={<UserIcon className="h-4 w-4" />}
          title="Profile"
          description="How you appear in NoteFlow."
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              {user?.avatar && (
                <AvatarImage src={user.avatar} alt={user.name || "Avatar"} />
              )}
              {!user?.avatar && (
                <AvatarFallback className="bg-primary/15 text-primary font-semibold text-base">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">
                {user.name || "Unnamed"}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {user.email}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => onAvatarPick(e.target.files?.[0] || null)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload avatar
                </Button>
                {user?.avatar && (
                  <Button size="sm" variant="ghost" onClick={removeAvatar}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </Field>
            <Field label="Email" hint="Email cannot be changed in this build.">
              <Input value={user.email} disabled />
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              size="sm"
              onClick={updateProfile}
              disabled={!dirty || namePending}
            >
              {namePending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection
          icon={<KeyRound className="h-4 w-4" />}
          title="Security"
          description="Change the password used to sign in to your account."
        >
          <form onSubmit={submitPassword} className="grid gap-4 sm:grid-cols-3">
            <Field label="Current password">
              <Input
                type="password"
                autoComplete="current-password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
              />
            </Field>
            <Field label="New password">
              <Input
                type="password"
                autoComplete="new-password"
                value={pwNext}
                onChange={(e) => setPwNext(e.target.value)}
              />
            </Field>
            <Field label="Confirm new password">
              <Input
                type="password"
                autoComplete="new-password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
              />
            </Field>
            <div className="sm:col-span-3 flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={pwPending || !pwCurrent || !pwNext}
              >
                {pwPending ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection
          icon={<Palette className="h-4 w-4" />}
          title="Appearance"
          description="Customize the look and feel of your workspace."
        >
          <Field label="Theme">
            <div className="grid grid-cols-3 gap-3">
              <ThemeCard
                label="Light"
                icon={<Sun className="h-4 w-4" />}
                active={theme === "light"}
                onClick={() => setTheme("light")}
                preview="light"
              />
              <ThemeCard
                label="Dark"
                icon={<Moon className="h-4 w-4" />}
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
                preview="dark"
              />
              <ThemeCard
                label="System"
                icon={<Monitor className="h-4 w-4" />}
                active={theme === "system"}
                onClick={() => setTheme("system")}
                preview="system"
              />
            </div>
          </Field>

          <Field label="Editor font" className="mt-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  v: "sans",
                  label: "Sans",
                  sample: "Aa",
                  className: "font-sans",
                },
                {
                  v: "serif",
                  label: "Serif",
                  sample: "Aa",
                  className: "font-serif-pref",
                },
                {
                  v: "mono",
                  label: "Mono",
                  sample: "Aa",
                  className: "font-mono",
                },
              ].map((f) => {
                const active = fontPref === f.v;
                return (
                  <button
                    key={f.v}
                    type="button"
                    onClick={() => setFontPref(f.v)}
                    className={cn(
                      "group relative rounded-lg border bg-card p-4 text-left transition-colors",
                      "hover:border-primary/50 hover:bg-accent/40",
                      active
                        ? "border-primary ring-1 ring-primary"
                        : "border-border",
                    )}
                  >
                    <div className={cn("text-2xl mb-1", f.className)}>
                      {f.sample}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">
                      {f.label}
                    </div>
                    {active && (
                      <span className="absolute top-2 right-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Field>
        </SettingsSection>

        {/* Data */}
        <SettingsSection
          icon={<Database className="h-4 w-4" />}
          title="Data"
          description="Export your notes as Markdown files."
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
            <div className="min-w-0">
              <div className="text-sm font-medium">Export all notes</div>
              <div className="text-xs text-muted-foreground">
                Download a .zip archive of every note as Markdown.
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={exportZip}>
              <Download className="h-4 w-4" />
              Export .zip
            </Button>
          </div>
        </SettingsSection>

        {/* Account */}
        <SettingsSection
          icon={<ShieldAlert className="h-4 w-4" />}
          title="Account"
          description="Sign out or permanently delete your account."
          tone="destructive"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
            <div className="min-w-0">
              <div className="text-sm font-medium">Sign out</div>
              <div className="text-xs text-muted-foreground">
                End your current session on this device.
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out of NoteFlow?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll need to sign in again to access your notes on this
                    device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        await logout();
                        navigate("/login");
                      } catch (e) {
                        toast.error(e.message);
                      }
                    }}
                  >
                    Sign out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-destructive">
                Delete account
              </div>
              <div className="text-xs text-muted-foreground">
                Permanently remove your account and all notes. This cannot be
                undone.
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove your account, all notes,
                    notebooks, tags and version history. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function SettingsSection({
  icon,
  title,
  description,
  children,
  tone = "default",
}) {
  return (
    <section className="panel p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border",
            tone === "destructive"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-foreground",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h2
            className={cn(
              "font-semibold leading-tight",
              tone === "destructive" && "text-destructive",
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, hint, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ThemeCard({ label, icon, active, onClick, preview }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative rounded-lg border bg-card p-3 text-left transition-colors",
        "hover:border-primary/50 hover:bg-accent/40",
        active ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <div className="mb-3 h-16 overflow-hidden rounded-md border border-border">
        <ThemePreview variant={preview} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {icon}
          {label}
        </div>
        {active && (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>
    </button>
  );
}

function ThemePreview({ variant }) {
  if (variant === "system") {
    return (
      <div className="flex h-full">
        <div className="flex-1">
          <MiniPreview mode="light" />
        </div>
        <div className="flex-1 border-l border-border">
          <MiniPreview mode="dark" />
        </div>
      </div>
    );
  }
  return <MiniPreview mode={variant} />;
}

function MiniPreview({ mode }) {
  const isDark = mode === "dark";
  return (
    <div
      className="h-full w-full p-1.5 flex gap-1"
      style={{ background: isDark ? "hsl(240 10% 5%)" : "hsl(0 0% 100%)" }}
    >
      <div
        className="w-1/3 rounded-sm"
        style={{ background: isDark ? "hsl(240 10% 4%)" : "hsl(240 6% 97%)" }}
      />
      <div className="flex-1 flex flex-col gap-1">
        <div
          className="h-1.5 w-2/3 rounded-sm"
          style={{ background: isDark ? "hsl(240 5% 60%)" : "hsl(240 4% 46%)" }}
        />
        <div
          className="h-1.5 w-full rounded-sm opacity-60"
          style={{ background: isDark ? "hsl(240 5% 60%)" : "hsl(240 4% 46%)" }}
        />
        <div
          className="h-1.5 w-1/2 rounded-sm opacity-40"
          style={{ background: isDark ? "hsl(240 5% 60%)" : "hsl(240 4% 46%)" }}
        />
        <div
          className="mt-auto h-2 w-1/3 rounded-sm"
          style={{ background: "hsl(245 80% 66%)" }}
        />
      </div>
    </div>
  );
}
