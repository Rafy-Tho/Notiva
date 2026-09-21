import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/Logo";
import { toast } from "sonner";
import { useForgetPassword } from "@/hooks/useAuth";
import { useForm } from "@/lib/formHooks";
import { LoaderCircle } from "lucide-react";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { mutateAsync, isPending } = useForgetPassword();
  const { values, handleChange, handleSubmit, errors, serverErrors } = useForm(
    { email: "" },
    null,
  );

  const submit = async (formData) => {
    try {
      await mutateAsync(formData.email);
      toast.success("Reset link has been sent");
      setSent(true);
    } catch (e) {
      if (e.code && e.code === "VALIDATION_ERROR" && e.errors) {
        handleSubmit(serverErrors);
      } else {
        toast.error(e.message);
      }
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm panel p-6 space-y-5">
        <Logo />
        <h1 className="text-xl font-semibold">Reset your password</h1>
        {sent ? (
          <p className="text-sm text-muted-foreground">
            If an account exists for {values.email}, we sent a reset link.
          </p>
        ) : (
          <form onSubmit={() => handleSubmit(submit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                required
                type="email"
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
              {serverErrors.email && (
                <p className="text-xs text-destructive">{serverErrors.email}</p>
              )}
            </div>
            <Button
              disabled={isPending}
              className={`w-full bg-gradient-primary text-primary-foreground ${
                isPending ? "disabled:opacity-50 cursor-not-allowed" : ""
              }`}
              type="submit"
            >
              {isPending && <LoaderCircle />}
              {`Send reset link`}
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
