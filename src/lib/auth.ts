import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const providers = [
  GitHub({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }),
  Google({
    clientId: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
  }),
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!sbUrl || !sbKey) {
        console.error("Missing Supabase environment variables");
        return null;
      }

      const email = credentials.email as string;
      const password = credentials.password as string;

      if (!email || !password) return null;

      try {
        const res = await fetch(
          `${sbUrl}/auth/v1/token?grant_type=password`,
          {
            method: "POST",
            headers: {
              apikey: sbKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          }
        );

        if (!res.ok) {
          return null;
        }

        const data = await res.json();

        return {
          id: data.user.id,
          email: data.user.email ?? "",
          name:
            data.user.user_metadata?.full_name ??
            data.user.email?.split("@")[0] ??
            null,
          image: data.user.user_metadata?.avatar_url ?? null,
          accessToken: data.access_token,
        };
      } catch (error) {
        console.error("Credentials authorization error:", error);
        return null;
      }
    },
  }),
];

const config: Parameters<typeof NextAuth>[0] = {
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/en/auth/signin",
    error: "/en/auth/signin",
  },
  secret: process.env.AUTH_SECRET,
};

// Only configure the Supabase adapter when env vars are available
// (they may be absent at build time, which is fine)
if (supabaseUrl && supabaseServiceKey) {
  const { SupabaseAdapter } = await import("@auth/supabase-adapter");
  config.adapter = SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceKey,
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth(config);
