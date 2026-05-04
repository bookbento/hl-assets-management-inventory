// frontend/src/app/layout.tsx
import './../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/lib/auth-provider';
import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IT Asset Management',
  description: 'Manage your IT assets efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <div className="flex h-screen bg-gray-100">
              <Sidebar />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                <div className="container mx-auto px-6 py-8">
                  {children}
                </div>
              </main>
            </div>
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
