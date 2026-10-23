import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Billing Ledger - Financial Operations',
  description: 'Daily Billing, Cash-Bank Operations, and Ledger Reconciliation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-black text-white antialiased selection:bg-ios-blue selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
