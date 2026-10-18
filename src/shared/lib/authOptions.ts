import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "이메일", type: "email" },
                password: { label: "비밀번호", type: "password" },
            },
            async authorize(credentials) {
                const supabase = supabaseAdmin();

                const { data: user, error } = await supabase.from("users").select("*").eq("email", credentials?.email).single();

                if (error || !user) {
                    throw new Error("등록되지 않은 이메일입니다.");
                }

                const isValid = await bcrypt.compare(credentials!.password, user.password);

                if (!isValid) {
                    throw new Error("비밀번호가 일치하지 않습니다.");
                }

                // 로그인 성공
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role ?? "user",
                };
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.role = token.role;
            }

            return session;
        },
    },
};
