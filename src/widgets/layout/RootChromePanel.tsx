"use client";

import { ReactNode } from "react";

import Grid from "@/widgets/layout/chrome/Grid";
import Footer from "@/widgets/layout/chrome/Footer";
import Header from "@/widgets/layout/chrome/Header";
import Navigation from "@/widgets/layout/chrome/Navigation";

import MobileMenu from "@/shared/ui/layout/MobileMenu";

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
            <Grid />
        </>
    );
}
