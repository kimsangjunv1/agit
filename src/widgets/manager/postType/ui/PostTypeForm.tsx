"use client";

import { useState, type FormEvent } from "react";
import type { PostTypePayload } from "@/entities/postType/model/postType.type";
import UI from "@/shared/ui/common/UIComponent";

type Props = {
    initialValue: PostTypePayload;
    isNew: boolean;
    pending: boolean;
    onSave: (payload: PostTypePayload) => Promise<void>;
};

export default function PostTypeForm({ initialValue, isNew, pending, onSave }: Props) {
    const [value, setValue] = useState({ ...initialValue, sort_no: String(initialValue.sort_no) });
    const inputClass = "w-full rounded-[0.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-[1.2rem] py-[0.8rem] disabled:opacity-60";
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!pending) void onSave({ ...value, sort_no: Number(value.sort_no) });
    };

    return (
        <form
            onSubmit={submit}
            className="flex max-w-[48rem] flex-col gap-[2rem]"
        >
            <label className="flex flex-col gap-[0.8rem] text-[1.4rem]">
                글 종류 이름
                <input
                    required
                    maxLength={40}
                    value={value.title}
                    onChange={(event) => setValue({ ...value, title: event.target.value })}
                    className={inputClass}
                />
            </label>
            <label className="flex flex-col gap-[0.8rem] text-[1.4rem]">
                주소 이름
                <input
                    required
                    maxLength={50}
                    pattern="[a-z][a-z0-9_\-]*"
                    disabled={!isNew}
                    value={value.code}
                    onChange={(event) => setValue({ ...value, code: event.target.value })}
                    className={inputClass}
                    aria-describedby="post-type-code-guide"
                />
                <span
                    id="post-type-code-guide"
                    className="text-[1.2rem] text-[var(--color-text-muted)]"
                >
                    영문 소문자로 시작하고 숫자, 하이픈, 밑줄을 사용할 수 있어요. 글 목록 주소에 사용되며 추가 후 변경할 수 없어요.
                </span>
            </label>
            <label className="flex flex-col gap-[0.8rem] text-[1.4rem]">
                표시 순서
                <input
                    required
                    type="number"
                    min={0}
                    max={9999}
                    step={1}
                    value={value.sort_no}
                    onChange={(event) => setValue({ ...value, sort_no: event.target.value })}
                    className={inputClass}
                />
                <span className="text-[1.2rem] text-[var(--color-text-muted)]">작은 숫자부터 메뉴와 작성 화면에 표시돼요.</span>
            </label>
            <UI.Button
                type="submit"
                disabled={pending}
                className="self-start rounded-[0.8rem] bg-[var(--color-brand-500)] px-[1.6rem] py-[1rem] text-[1.4rem] disabled:opacity-60"
            >
                {pending ? "저장 중..." : isNew ? "추가" : "저장"}
            </UI.Button>
        </form>
    );
}
