'use client';

import { Suspense, useEffect, useState, type ComponentProps } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MailCheck, MailIcon, User, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { AuthShell } from '@/components/auth/auth-shell';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import Logo from '@/components/logo';

const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

const signUpSchema = signInSchema
  .extend({
    name: z
      .string()
      .trim()
      .min(2, 'Enter your full name')
      .max(100, 'Name is too long'),
    confirmPassword: z.string().min(8, 'At least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

type AuthMode = 'signin' | 'signup';

function GoogleIcon(props: ComponentProps<'svg'>) {
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

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isSignUp = mode === 'signup';

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (searchParams.get('verified')) {
      toast.success('Email verified', {
        description: 'Your email is confirmed. You can sign in now.',
      });
      router.replace('/auth');
    } else if (searchParams.get('reset')) {
      toast.success('Password reset', {
        description: 'You can now sign in with your new password.',
      });
      router.replace('/auth');
    } else if (searchParams.get('error')) {
      toast.error("Verification link didn't work", {
        description:
          'It may have expired. Sign up again or request a new link.',
      });
      router.replace('/auth');
    }
  }, [searchParams, router]);

  const verificationCallbackURL = () =>
    `${window.location.origin}/auth?verified=1`;

  const sendVerification = async (email: string) => {
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: verificationCallbackURL(),
    });
    if (error) throw new Error(error.message ?? "Couldn't send verification email");
  };

  const goToPendingVerification = (email: string) => {
    setPendingEmail(email);
    setMode('signin');
  };

  const onSignUp = async (values: SignUpValues) => {
    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: verificationCallbackURL(),
      });
      if (error) throw new Error(error.message ?? 'Sign up failed');

      toast.success('Account created', {
        description: 'Check your email to verify your account, then sign in.',
      });
      goToPendingVerification(values.email);
      signUpForm.reset();
    } catch (err) {
      toast.error('Sign up failed', {
        description: errorMessage(err, 'Something went wrong'),
      });
    }
  };

  const onSignIn = async (values: SignInValues) => {
    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.code === 'EMAIL_NOT_VERIFIED') {
          goToPendingVerification(values.email);
          try {
            await sendVerification(values.email);
            toast.info('Verify your email first', {
              description:
                'We just sent a fresh verification link to your inbox.',
            });
          } catch {
            toast.info('Verify your email first', {
              description:
                'Check your inbox for the verification link, or resend it below.',
            });
          }
          return;
        }
        throw new Error(error.message ?? 'Sign in failed');
      }

      toast.success('Welcome back!', {
        description: 'Good to see you again.',
      });
      router.push('/');
    } catch (err) {
      toast.error('Sign in failed', {
        description: errorMessage(err, 'Something went wrong'),
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/`,
      });
      if (error)
        throw new Error(error.message ?? "Couldn't sign in with Google");
    } catch (err) {
      toast.error("Couldn't sign in with Google", {
        description: errorMessage(err, 'Something went wrong'),
      });
      setGoogleLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    try {
      await sendVerification(pendingEmail);
      toast.success('Email sent', {
        description: 'Check your inbox for the new link.',
      });
    } catch (err) {
      toast.error("Couldn't resend email", {
        description: errorMessage(err, 'Something went wrong'),
      });
    } finally {
      setResending(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    signInForm.reset();
    signUpForm.reset();
  };

  const backToSignIn = () => {
    setPendingEmail(null);
    setMode('signin');
    signInForm.reset();
  };

  if (pendingEmail) {
    return (
      <AuthShell>
        <CardHeader className="items-center text-center space-y-3">
          <div className="flex items-center gap-3">
            <MailCheck className="h-10 w-10 text-rose-600" />
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Check your email
            </CardTitle>
          </div>
          <CardDescription className="mb-4">
            We sent a verification link to{' '}
            <span className="font-medium text-foreground">
              {pendingEmail}
            </span>
            . Click it to activate your account, then come back and sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full py-5 rounded-xl"
            onClick={handleResend}
            disabled={resending}
          >
            {resending && <Loader2 className="animate-spin" />}
            {resending ? 'Resending...' : 'Resend email'}
          </Button>
        </CardContent>
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={backToSignIn}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <CardHeader className="text-start">
        <Logo />
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? 'Enter your details to get started.'
            : 'Sign in to continue to your account.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="my-4">
        <Button
          type="button"
          variant="outline"
          className="w-full py-5 rounded-xl"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <GoogleIcon className="size-4" />
          )}
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </Button>
        <div className="relative mt-5">
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

      {isSignUp ? (
        <form onSubmit={signUpForm.handleSubmit(onSignUp)} noValidate>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="py-5 pl-12 rounded-xl"
                  id="name"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  aria-invalid={!!signUpForm.formState.errors.name}
                  {...signUpForm.register('name')}
                />
              </div>
              {signUpForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="py-5 pl-12 rounded-xl"
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!signUpForm.formState.errors.email}
                  {...signUpForm.register('email')}
                />
              </div>
              {signUpForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <PasswordInput
                  className="py-5 pl-12 rounded-xl"
                  id="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={!!signUpForm.formState.errors.password}
                  {...signUpForm.register('password')}
                />
              </div>
              {signUpForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <PasswordInput
                  className="py-5 pl-12 rounded-xl"
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={!!signUpForm.formState.errors.confirmPassword}
                  {...signUpForm.register('confirmPassword')}
                />
              </div>
              {signUpForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full py-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
              disabled={signUpForm.formState.isSubmitting}
            >
              {signUpForm.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}
              {signUpForm.formState.isSubmitting
                ? 'Creating account...'
                : 'Create account'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </form>
      ) : (
        <form onSubmit={signInForm.handleSubmit(onSignIn)} noValidate>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="py-5 pl-12 rounded-xl"
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!signInForm.formState.errors.email}
                  {...signInForm.register('email')}
                />
              </div>
              {signInForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {signInForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <PasswordInput
                  className="py-5 pl-12 rounded-xl"
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!signInForm.formState.errors.password}
                  {...signInForm.register('password')}
                />
              </div>
              {signInForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {signInForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full py-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
              disabled={signInForm.formState.isSubmitting}
            >
              {signInForm.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}
              {signInForm.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </form>
      )}

      <div className="flex justify-center mt-3">
        <button
          type="button"
          onClick={toggleMode}
          className="text-sm text-muted-foreground transition-colors"
        >
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <span className="font-medium text-primary underline-offset-4 hover:underline">
                Sign in
              </span>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <span className="font-medium text-primary underline-offset-4 hover:underline">
                Sign up
              </span>
            </>
          )}
        </button>
      </div>
    </AuthShell>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageContent />
    </Suspense>
  );
}
