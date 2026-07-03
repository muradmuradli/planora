import { Toaster } from 'sonner';

import { AuthHeroPanel } from '@/components/auth/hero-panel';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center bg-linear-to-br from-background via-background to-muted">
      <Toaster richColors position="top-center" />
      <div className="flex w-full justify-center items-center px-4 py-12 sm:px-6 lg:w-6/12 lg:px-0 lg:py-0">
        <div className="w-full max-w-md border-0 lg:w-5/12 lg:max-w-none">
          {children}
        </div>
      </div>
      <AuthHeroPanel />
    </div>
  );
}
