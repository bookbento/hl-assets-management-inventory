import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { API_URL } from "@/lib/config";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const user = (await res.json()) as {
            access_token?: string;
            user?: { username?: string; role?: string };
          };

          if (!user?.access_token) return null;

          return {
            id: user.user?.username || credentials.username,
            username: user.user?.username || credentials.username,
            role: user.user?.role || "user",
            access_token: user.access_token,
          };
        } catch (error: any) {
          console.error("Login error:", error.message);
          throw new Error(error.message || "Login failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        const t = token as any;
        t.access_token = u.access_token;
        t.id = u.id;
        t.role = u.role;
        t.username = u.username;
      }
      return token;
    },
    async session({ session, token }) {
      const s = session as any;
      const t = token as any;
      s.access_token = t.access_token;
      s.user.id = t.id;
      s.user.role = t.role;
      s.user.username = t.username;
      return s;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
