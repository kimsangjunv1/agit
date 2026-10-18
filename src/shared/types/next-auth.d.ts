import NextAuth, { DefaultSession } from "next-auth";

import type { UserRole } from "@/shared/types/auth";

// Session 타입 확장
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        email: string;
        name: string;
        role: UserRole;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        name: string;
        role: UserRole;
    }
}
