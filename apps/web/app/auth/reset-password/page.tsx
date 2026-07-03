'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { AuthShell } from '@/components/auth/auth-shell';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(8, 'At least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const invalidToken = searchParams.get('error') === 'INVALID_TOKEN';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) return;
    try {
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });
      if (error) throw new Error(error.message ?? "Couldn't reset your password");
      router.replace('/auth?reset=1');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      toast.error("Couldn't reset your password", { description: message });
    }
  };

  if (!token || invalidToken) {
    return (
      <AuthShell>
        <CardHeader className="text-start">
          <Logo />
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Link expired
          </CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired. Request a new
            one to continue.
          </CardDescription>
        </CardHeader>
        <div className="flex justify-center mt-3">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Request a new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <CardHeader className="text-start mb-3">
        <Logo />
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Set a new password
        </CardTitle>
        <CardDescription>
          Choose a new password for your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                className="py-5 pl-12 rounded-xl"
                id="password"
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                className="py-5 pl-12 rounded-xl"
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full py-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? 'Resetting...' : 'Reset password'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
