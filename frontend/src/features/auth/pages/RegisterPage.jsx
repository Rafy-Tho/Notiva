import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/Logo";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { registerSchema } from "@/lib/validation";

function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const result = registerSchema.safeParse({ name, email, password });
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
      await register(name, email, password);
      navigate("/verify-email", { state: { email }, replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm panel p-6 space-y-5">
        <Logo />
        <div>
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Start capturing thoughts in seconds.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="n">Name</Label>
            <Input
              id="n"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e">Email</Label>
            <Input
              id="e"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="p">Password</Label>
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
            </div>
            <Input
              id="p"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-primary text-primary-foreground"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create account"
            )}
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
