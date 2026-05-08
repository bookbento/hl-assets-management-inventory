import "./../styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth-provider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IT Asset Management",
  description: "Manage your IT assets efficiently",
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
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
