import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/Logo";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function RegistrationVerificationPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(
    location.state?.email || searchParams.get("email") || "",
  );
  const [code, setCode] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const { isLoading, error, verifyEmailCode, resendVerificationCode } =
    useAuthStore();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyEmailCode(email, code);
      navigate("/");
    } catch {
      // Error handled by store
    }
  };
  const handleResend = async () => {
    try {
      await resendVerificationCode(email);
      setResendCount((c) => c + 1);
      toast.success("Verification code sent");
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm panel p-6 space-y-5">
        <Logo />
        <div>
          <h1 className="text-xl font-semibold">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to {email}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="text-center text-xl tracking-widest"
              placeholder="000000"
            />
          </div>
          {error && (
            <div className="text-destructive text-sm text-center">{error}</div>
          )}
          <Button
            type="submit"
            className="w-full bg-gradient-primary text-primary-foreground"
            disabled={isLoading || !email || code.length !== 6}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verify email"
            )}
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Resend code ({resendCount})
          </button>
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

export default RegistrationVerificationPage;