import { Toaster } from 'sonner';

import { AuthHeroPanel } from '@/components/auth/hero-panel';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center bg-linear-to-br from-background via-background to-muted">
      <Toaster richColors position="top-center" />
      <div className="flex w-6/12 justify-center items-center">
        <div className="w-5/12 border-0">{children}</div>
      </div>
      <AuthHeroPanel />
    </div>
  );
}
