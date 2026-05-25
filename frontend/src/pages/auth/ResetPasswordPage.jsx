import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/Logo";
import { toast } from "sonner";
import { useResetPassword } from "../../hooks/useAuth";

export function ResetPasswordPage() {
  const [seachParams] = useSearchParams();
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const { mutateAsync } = useResetPassword();
  const submit = async (e) => {
    e.preventDefault();
    const token = seachParams.get("token");
    try {
      // TODO: Add validation
      if (pw.length < 8)
        return toast.error("Password must be at least 8 characters");

      await mutateAsync({ token, password: pw });
      toast.success("Password updated");
      nav("/login");
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <div className="min-h-dvh grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm panel p-6 space-y-5">
        <Logo />
        <h1 className="text-xl font-semibold">Set a new password</h1>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="p">New password</Label>
            <Input
              id="p"
              type="password"
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-primary text-primary-foreground"
          >
            Update password
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
