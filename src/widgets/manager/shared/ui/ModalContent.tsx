"use client";

import { useEffect, useState } from "react";

import UI from "@/shared/ui/common/UIComponent";
import { CategoryItemManager } from "@/entities/category/model/category.type";
import Image from "next/image";

const PLACEHOLDER_IMAGES = [
    {
        idx: 101,
        create_at: "2025-09-01T09:10:00Z",
        url: "/images/picture/img-dummy-thumbnail-01.png",
    },
];

// 이미지: 관리

// 사진 업로드
// 업로드는 한번에 하나씩
// 업로드 하면 -> 링크 반환 -> 이미지 목록 담아두는 테이블에 저장 ->

// 컴포넌트 설계
// 사진 업로드 후 다시 현재 이미지 목록 Fetch
// 선택한 이미지 주소 onChange로 반환

// Response 값
// idx, create_at,  url
const Box = ({ defaultImageUrl = "/", onChange }: { defaultImageUrl: string; onChange: (e: any) => void }) => {
    const [selectedImage, setSelectedImage] = useState<number>();
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>(defaultImageUrl);

    return (
        <article className="flex flex-col gap-[2.4rem]">
            <section className="flex flex-col gap-[1.2rem] items-center">
                <p className="text-[var(--color-gray-500)]">현재 선택된 이미지</p>
                <img
                    src={selectedImageUrl ?? "/"}
                    alt=""
                    className="w-[12.8rem] h-[12.8rem] object-cover shadow-[var(--shadow-normal)] rounded-[2.4rem]"
                />
            </section>

            <section className="flex flex-col gap-[0.4rem]">
                <p className="text-[var(--color-gray-500)]">업로드된 이미지</p>

                <section className="grid grid-cols-[1fr_1fr_1fr_1fr] grid-rows-[7.2rem_7.2rem_7.2rem_7.2rem] pb-[3.2rem] gap-[0.8rem] h-[calc(1.6rem*10)] overflow-y-auto bg-[var(--color-gray-300)] p-[0.4rem] rounded-[1.6rem]">
                    {PLACEHOLDER_IMAGES.map((e, i) => (
                        <UI.Button
                            key={i}
                            className={` ${e.idx === selectedImage ? "border border-[var(--color-brand-500)]" : ""}`}
                            onClick={() => {
                                onChange(e.url);
                                setSelectedImage(e.idx);
                                setSelectedImageUrl(e.url);
                            }}
                        >
                            <img
                                src={e.url}
                                alt={"사진"}
                                className="object-cover w-full h-full rounded-[1.2rem] shadow-[var(--shadow-normal)]"
                            />
                        </UI.Button>
                    ))}
                </section>
            </section>

            <section className="flex flex-col gap-[0.4rem]">
                <p className="text-[var(--color-gray-500)]">URL 직접입력</p>

                <section>
                    <UI.Input
                        onChange={(e) => {
                            onChange(e.target.value);
                            setSelectedImageUrl(e.target.value);
                        }}
                    />
                </section>
            </section>

            <section className="hidden">
                <UI.FileUpload
                    onChange={(e) => {
                        // updateBlock(rowIndex, blockIndex, { content: html })
                    }}
                    placeholder="배너 이미지를 추가해주세요."
                    buttonText="이미지 추가"
                />
            </section>
        </article>
    );
};

// 카테고리 생성 모달 내용
const AddCategory = ({ onChange }: { onChange: (e: any) => void }) => {
    const [currentState, setCurrentState] = useState({});

    useEffect(() => {
        onChange(currentState);
    }, [currentState]);

    return (
        <article className="flex flex-col gap-[2.4rem]">
            <section className="flex flex-col gap-[1.2rem]">
                <section className="flex flex-col gap-[0.8rem]">
                    <p className="text-[var(--color-gray-500)] font-medium">이름</p>
                </section>

                <section className="flex flex-col gap-[0.8rem]">
                    <UI.Input
                        validationPattern={/^[\p{L}\p{N}\s]+$/u}
                        onChange={(e) => {
                            setCurrentState((prev) => ({
                                ...prev,
                                title: e.target.value,
                            }));
                        }}
                        placeholder="카테고리 이름을 입력해주세요"
                        className={{
                            container: "h-[4.4rem]",
                        }}
                    />
                </section>
            </section>

            <section className="flex flex-col gap-[1.2rem]">
                <section className="flex flex-col gap-[0.8rem]">
                    <p className="text-[var(--color-gray-500)] font-medium">설명</p>
                </section>

                <section className="flex flex-col gap-[0.8rem]">
                    <UI.Input
                        validationPattern={/^[\p{L}\p{N}\s]+$/u}
                        onChange={(e) => {
                            setCurrentState((prev) => ({
                                ...prev,
                                description: e.target.value ?? "",
                            }));
                        }}
                        placeholder="카테고리에 대한 설명을 입력해주세요"
                        className={{
                            container: "h-[4.4rem]",
                        }}
                    />
                </section>
            </section>
        </article>
    );
};

// 카테고리 수정 모달 내용
const ModifyCategory = ({ info, onChange }: { info: CategoryItemManager; onChange: (e: any) => void }) => {
    const [currentState, setCurrentState] = useState({
        title: info.title,
        description: info.description,
        idx: info.idx,
        is_enabled: info.is_enabled,
    });

    useEffect(() => {
        onChange(currentState);
    }, [currentState, info]);

    return (
        <article className="flex flex-col gap-[2.4rem]">
            <section className="flex flex-col gap-[1.2rem]">
                <section className="flex flex-col gap-[0.8rem]">
                    <p className="text-[var(--color-gray-500)] font-medium">이름</p>
                </section>

                <section className="flex flex-col gap-[0.8rem]">
                    <UI.Input
                        defaultValue={info.title}
                        validationPattern={/^[\p{L}\p{N}\s]+$/u}
                        onChange={(e) => {
                            setCurrentState((prev) => ({
                                ...prev,
                                title: e.target.value,
                            }));
                        }}
                        placeholder="카테고리 이름을 입력해주세요"
                        className={{
                            container: "h-[4.4rem]",
                        }}
                    />
                </section>
            </section>

            <section className="flex flex-col gap-[1.2rem]">
                <section className="flex flex-col gap-[0.8rem]">
                    <p className="text-[var(--color-gray-500)] font-medium">설명</p>
                </section>

                <section className="flex flex-col gap-[0.8rem]">
                    <UI.Input
                        defaultValue={info.description}
                        validationPattern={/^[\p{L}\p{N}\s]+$/u}
                        onChange={(e) => {
                            setCurrentState((prev) => ({
                                ...prev,
                                description: e.target.value ?? "",
                            }));
                        }}
                        placeholder="카테고리에 대한 설명을 입력해주세요"
                        className={{
                            container: "h-[4.4rem]",
                        }}
                    />
                </section>
            </section>
        </article>
    );
};

// 초대코드 추가 모달
const AddInvitationCode = ({ onChange }: { onChange: (e: any) => void }) => {
    const [currentState, setCurrentState] = useState({
        is_active: true,
        expire_at: "",
    });

    useEffect(() => {
        onChange(currentState);
    }, [currentState]);

    return (
        <article className="flex flex-col gap-[2.4rem]">
            <section className="flex flex-col gap-[1.2rem]">
                <section className="flex flex-col gap-[0.8rem]">
                    <p className="text-[var(--color-gray-500)] font-medium">활성화 여부</p>
                </section>

                <section className="flex flex-col gap-[0.8rem]">
                    {/* <UI.Input
                        validationPattern={/^[\p{L}\p{N}\s]+$/u}
                        onChange={(e) => {
                            setCurrentState(prev => ({
                                ...prev,
                                is_active: e.target.value
                            }));
                        }}
                        placeholder="카테고리 이름을 입력해주세요"
                        className={{
                            container: "h-[4.2rem]"
                        }}
                    /> */}
                    <UI.Switch
                        states={true}
                        onChange={(event) => {
                            setCurrentState((prev) => ({
                                ...prev,
                                is_active: event,
                            }));
                        }}
                    />
                </section>
            </section>

            <section className="flex flex-col gap-[1.2rem]">
                <section className="flex flex-col gap-[0.8rem]">
                    <p className="text-[var(--color-gray-500)] font-medium">유효기간</p>
                </section>

                <section className="flex flex-col gap-[0.8rem]">
                    <UI.Calendar
                        defaultValue={new Date()}
                        icon={true}
                        // ruleDate={searchPayload.StartDate}
                        onDateSelect={(date) => {
                            setCurrentState((prev) => ({
                                ...prev,
                                expire_at: date,
                            }));
                        }}
                        containerClassName="flex-1"
                        className="bg-[var(--color-gray-100)] text-[var(--color-gray-1000)] rounded-[0.8rem] px-[1.2rem] h-[4.4rem] w-full"
                    />
                </section>
            </section>
        </article>
    );
};

const ModalContent = {
    Image: {
        Box,
    },
    Post: {
        AddCategory,
        ModifyCategory,
    },
    Invitation: {
        AddInvitationCode,
    },
};

export default ModalContent;
