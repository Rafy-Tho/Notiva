import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/Logo";
import { toast } from "sonner";
import { useForgetPassword } from "../../hooks/useAuth";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { mutateAsync } = useForgetPassword();
  const submit = async (e) => {
    e.preventDefault();
    try {
      await mutateAsync(email);
      toast.success("Reset link has been sent");
      setSent(true);
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <div className="min-h-dvh grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm panel p-6 space-y-5">
        <Logo />
        <h1 className="text-xl font-semibold">Reset your password</h1>
        {sent ? (
          <p className="text-sm text-muted-foreground">
            If an account exists for {email}, we sent a reset link.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-gradient-primary text-primary-foreground"
              type="submit"
            >
              Send reset link
            </Button>
          </form>
        )}
        <p className="text-xs text-center text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
