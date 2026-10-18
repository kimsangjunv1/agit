"use client";

import { useEffect } from "react";
import Link from "next/link";

import UI from "@/shared/ui/common/UIComponent";

type ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

const Error = ({ error, reset }: ErrorProps) => {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex flex-col items-center justify-center gap-[1.6rem] min-h-[100svh] px-[1.6rem]">
            <div className="flex flex-col gap-[0.8rem] text-center max-w-[48rem]">
                <p className="text-[2.4rem] font-bold">문제가 발생했습니다</p>
                <p className="text-[1.6rem] text-[#00000090]">페이지를 불러오는 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-[1.2rem]">
                <UI.Button
                    onClick={reset}
                    className="p-[1.2rem_2.4rem] shadow-[var(--shadow-normal)] bg-[var(--color-orange-500)] text-white rounded-[1.2rem] font-bold"
                >
                    다시 시도
                </UI.Button>
                <Link
                    href="/"
                    className="p-[1.2rem_2.4rem] shadow-[var(--shadow-normal)] bg-white rounded-[1.2rem] font-bold text-[var(--color-gray-700)]"
                >
                    홈으로
                </Link>
            </div>
        </main>
    );
};

export default Error;
