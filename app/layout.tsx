import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../components/providers/AuthProvider';
import { QueryProvider } from '../components/providers/QueryProvider';
import { ToastProvider } from '../components/providers/ToastProvider';

export const metadata: Metadata = {
  title: 'Language Admin',
  description: 'Task-based learning admin console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
