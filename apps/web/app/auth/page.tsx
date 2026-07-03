'use client';

import { Suspense, useEffect, useState, type ComponentProps } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

const signUpSchema = signInSchema
  .extend({
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(100, "Name is too long"),
    confirmPassword: z.string().min(8, "At least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

function GoogleIcon(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isSignUp = mode === "signup";

  const form = useForm<SignUpValues>({
    resolver: zodResolver(
      (isSignUp ? signUpSchema : signInSchema) as unknown as typeof signUpSchema,
    ),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (searchParams.get("verified")) {
      toast.success("Email verified", {
        description: "Your email is confirmed. You can sign in now.",
      });
      router.replace("/auth");
    } else if (searchParams.get("reset")) {
      toast.success("Password reset", {
        description: "You can now sign in with your new password.",
      });
      router.replace("/auth");
    } else if (searchParams.get("error")) {
      toast.error("Verification link didn't work", {
        description:
          "It may have expired. Sign up again or request a new link.",
      });
      router.replace("/auth");
    }
  }, [searchParams, router]);

  const verificationCallbackURL = () => `${window.location.origin}/auth?verified=1`;

  const onSubmit = async (values: SignUpValues) => {
    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          name: values.name,
          email: values.email,
          password: values.password,
          callbackURL: verificationCallbackURL(),
        });
        if (error) throw new Error(error.message ?? "Sign up failed");
        setPendingEmail(values.email);
      } else {
        const { error } = await authClient.signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: verificationCallbackURL(),
        });
        if (error) {
          if (error.code === "EMAIL_NOT_VERIFIED") {
            setPendingEmail(values.email);
            toast.info("Verify your email first", {
              description: "We just sent a fresh verification link to your inbox.",
            });
            return;
          }
          throw new Error(error.message ?? "Sign in failed");
        }
        toast.success("Signed in", {
          description: "Good to see you again.",
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(isSignUp ? "Sign up failed" : "Sign in failed", {
        description: message,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
      });
      if (error) throw new Error(error.message ?? "Couldn't sign in with Google");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error("Couldn't sign in with Google", { description: message });
      setGoogleLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: pendingEmail,
        callbackURL: verificationCallbackURL(),
      });
      if (error) throw new Error(error.message ?? "Couldn't resend the email");
      toast.success("Email sent", {
        description: "Check your inbox for the new link.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error("Couldn't resend email", { description: message });
    } finally {
      setResending(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    reset({ name: "", email: "", password: "", confirmPassword: "" });
  };

  if (pendingEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted px-4 py-12">
        <Toaster richColors position="top-center" />
        <Card className="w-full max-w-md shadow-lg text-center">
          <CardHeader className="items-center space-y-3">
            <MailCheck className="h-10 w-10 text-primary" />
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Check your email
            </CardTitle>
            <CardDescription>
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{pendingEmail}</span>.
              Click it to activate your account, then come back and sign in.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resending}
            >
              {resending && <Loader2 className="animate-spin" />}
              {resending ? "Resending..." : "Resend email"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setPendingEmail(null);
                setMode("signin");
                reset({ name: "", email: "", password: "", confirmPassword: "" });
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted px-4 py-12">
      <Toaster richColors position="top-center" />
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {isSignUp ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Enter your details to get started."
              : "Sign in to continue to your account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <GoogleIcon className="size-4" />
            )}
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
        </CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <PasswordInput
                id="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting
                ? isSignUp
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="justify-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <span className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign in
                </span>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <span className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign up
                </span>
              </>
            )}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageContent />
    </Suspense>
  );
}