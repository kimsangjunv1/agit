"use client";
import { useState } from "react";
export default function HydrationExample() {
    const [renderTarget] = useState(() => (typeof window === "undefined" ? "서버 렌더링" : "클라이언트 렌더링"));
    return (
        <div>
            <p>hydration mismatch 예제: {renderTarget}</p>
        </div>
    );
}
