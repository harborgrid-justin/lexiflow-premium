import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Authentication',
    template: '%s | LexiFlow',
  },
  description: 'Secure authentication for LexiFlow - Enterprise Legal OS',
};

/**
 * Auth Layout
 * Provides consistent styling for all authentication pages
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LexiFlow</h1>
          <p className="text-slate-400">Enterprise Legal OS</p>
        </div>

        {/* Auth Content */}
        {children}

        {/* Footer */}
        <div className="text-center text-slate-500 text-xs mt-8 space-y-2">
          <p>&copy; {new Date().getFullYear()} LexiFlow. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Support</a>
          </div>
          <p className="opacity-50">Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}
