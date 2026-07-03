"use client";

import { useState } from "react";
import Link from "next/link";
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

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw new Error(error.message ?? "Couldn't send reset email");
      setSentEmail(values.email);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error("Couldn't send reset email", { description: message });
    }
  };

  if (sentEmail) {
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
              If an account exists for{" "}
              <span className="font-medium text-foreground">{sentEmail}</span>,
              we sent a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link
              href="/auth"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </Link>
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
            Forgot your password?
          </CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to reset it.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="justify-center">
          <Link
            href="/auth"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
