"use client";

import { LoginPageProvider } from "./model/LoginContext";
import * as LoginLayer from "@/widgets/login/ui";

export default function Panel() {
    return (
        <LoginPageProvider>
            <LoginLayer.LoginForm />
        </LoginPageProvider>
    );
}
