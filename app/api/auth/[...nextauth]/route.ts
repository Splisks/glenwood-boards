// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;
      return allowedEmails.includes(email);
    },

    async jwt({ token }) {
      if (token.email) {
        token.email = token.email.toLowerCase();
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
