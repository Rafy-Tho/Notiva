import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/Logo";

import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/sonner";
import { loginSchema } from "@/lib/validation";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0]] = issue.message;
      }
      return false;
    }
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      const to = location.state?.from?.pathname || "/";
      navigate(to, { replace: true });
    } catch (err) {
      if (err.message?.includes("Email not verified")) {
        navigate("/verify-email", { state: { email }, replace: true });
      } else {
        toast.error(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm panel p-6 space-y-5">
        <Logo />
        <div>
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue to NoteFlow.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
                <Link
                  to="/update-password"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Forgot?
                </Link>
              </div>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me on this device
          </label>
          <Button
            type="submit"
            className="w-full bg-gradient-primary text-primary-foreground"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
