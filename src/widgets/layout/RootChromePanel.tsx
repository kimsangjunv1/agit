"use client";

import { ReactNode } from "react";

import Footer from "@/widgets/layout/chrome/Footer";
import Header from "@/widgets/layout/chrome/Header";
import MobileMenu from "@/shared/ui/layout/MobileMenu";
import Navigation from "@/widgets/layout/chrome/Navigation";

type RootChromePanelProps = {
    children: ReactNode;
};

export default function RootChromePanel({ children }: RootChromePanelProps) {
    return (
        <>
            <Header />
            <Navigation />
            <MobileMenu />
            {children}
            <Footer />
        </>
    );
}
