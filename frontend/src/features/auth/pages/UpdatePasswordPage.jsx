import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/Logo";

import { Eye, EyeOff, Loader2 } from "lucide-react";

function UpdatePasswordPage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter code, 3 = enter password
  const { isLoading, error, resetPasswordCode, confirmPasswordReset } =
    useAuthStore();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      await resetPasswordCode(email);
      setStep(2);
    } catch {
      // Error handled by store
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      setStep(3);
    } catch {
      // Error handled by store
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    try {
      await confirmPasswordReset(email, code, password);
      navigate("/login");
    } catch {
      // Error handled by store
    }
  };

  const subtitle =
    step === 1
      ? "Enter your email and we'll send a reset code."
      : step === 2
        ? `Enter the 6-digit code sent to ${email}`
        : "Choose a new password for your account.";

  return (
    <div className="min-h-dvh grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm panel p-6 space-y-5">
        <Logo />
        <div>
          <h1 className="text-xl font-semibold">Reset your password</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            {error && (
              <div className="text-destructive text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send reset code"
              )}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
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
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify code"
              )}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">New password</Label>
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
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="New password"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-destructive text-sm">
                  Passwords do not match
                </p>
              )}
            </div>

            {error && (
              <div className="text-destructive text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground"
              disabled={isLoading || password !== confirmPassword}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Reset password"
              )}
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

export default UpdatePasswordPage;