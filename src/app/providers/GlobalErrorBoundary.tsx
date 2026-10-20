"use client";

import { ErrorBoundary, type FallbackProps, getErrorMessage } from "react-error-boundary";
import { ReactNode } from "react";

function GlobalErrorFallback({ error }: FallbackProps) {
    const message = getErrorMessage(error) ?? "알 수 없는 오류가 발생했습니다.";

    return (
        <div className="flex min-h-[50svh] flex-col items-center justify-center gap-4 p-8">
            <p className="text-[2rem] font-bold">문제가 발생했습니다.</p>
            <p className="text-[1.6rem] text-[var(--color-text-muted)]">{message}</p>
        </div>
    );
}

export default function GlobalErrorBoundary({ children }: { children: ReactNode }) {
    return <ErrorBoundary FallbackComponent={GlobalErrorFallback}>{children}</ErrorBoundary>;
}
