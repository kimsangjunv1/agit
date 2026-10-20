import Link from "next/link";

const NotFound = () => (
    <main className="flex flex-col items-center justify-center gap-[1.6rem] min-h-[100svh] px-[1.6rem]">
        <div className="flex flex-col gap-[0.8rem] text-center max-w-[48rem]">
            <p className="text-[6.4rem] font-bold text-[var(--color-gray-300)] leading-none">404</p>
            <p className="text-[2.4rem] font-bold">페이지를 찾을 수 없습니다</p>
            <p className="text-[1.6rem] text-[var(--color-text-muted)]">요청하신 주소가 변경되었거나 존재하지 않는 페이지예요.</p>
        </div>
        <Link
            href="/"
            className="p-[1.2rem_2.4rem] shadow-[var(--shadow-normal)] bg-[var(--color-orange-500)] text-[var(--color-text-primary)] rounded-[1.2rem] font-bold"
        >
            홈으로
        </Link>
    </main>
);

export default NotFound;
