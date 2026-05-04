// frontend/src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { login } from "@/lib/api";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize (credentials, req) {
        if (!credentials) return null;
        try {
          const user = await login({
            email: credentials.email,
            password: credentials.password,
          });
          // The backend returns an object with access_token
          // We need to structure it to be recognized by NextAuth
          if (user && user.access_token) {
            // You might want to fetch user details here or store token in session
            // For simplicity, returning a minimal user object with the token
            return {
              id: 'user-id-from-token', // This would ideally come from decoded token or user profile
              email: credentials.email,
              access_token: user.access_token
            };
          }
          return null;
        } catch (error: any) {
          console.error("Login error:", error.message);
          throw new Error(error.message || "Login failed");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add access token to the token object during JWT callback
      if (user) {
        const u = user as any;
        token.access_token = u.access_token;
        token.id = u.id; // Add user ID if available
      }
      return token;
    },
    async session({ session, token }) {
      // Add access token and user id to the session object
      const s = session as any;
      s.access_token = token.access_token;
      s.user.id = token.id;
      return s;
    }
  },
  pages: {
    signIn: '/auth/signin', // Optional: Redirect to a custom sign-in page
  },
  // Use a secret for JWT signing (should be kept secure, e.g., from .env)
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
