'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const signUpSchema = signInSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(100, "Name is too long"),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const isSignUp = mode === "signup";

  const form = useForm<SignUpValues>({
    resolver: zodResolver(
      (isSignUp ? signUpSchema : signInSchema) as unknown as typeof signUpSchema,
    ),
    defaultValues: { name: "", email: "", password: "" },
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
    reset({ name: "", email: "", password: "" });
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
                reset({ name: "", email: "", password: "" });
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
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