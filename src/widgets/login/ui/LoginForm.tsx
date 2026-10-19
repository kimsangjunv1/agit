"use client";

import { signIn } from "next-auth/react";
import React, { Fragment, useState } from "react";
import { motion } from "motion/react";

import UI from "@/shared/ui/common/UIComponent";
import useNavigate from "@/shared/hooks/useNavigate";
import { useToastStore } from "@/shared/stores/useToastStore";
import IconComponent from "@/shared/ui/common/IconComponent";
import { util } from "@/shared/lib/util";

const LoginForm = () => {
    const [selectedMenu, setSelectedMenu] = useState<number>(1);

    const SelectedTabContent = (value: number) => {
        switch (value) {
            case 1:
                return <CredentialsForm />;

            default:
                return <CredentialsForm />;
        }
    };

    return <Fragment>{SelectedTabContent(selectedMenu)}</Fragment>;
};

const CredentialsForm = () => {
    const [initGlow, setInitGlow] = useState(false);
    const [currentValue, setCurrentValue] = useState({
        email: "",
        password: "",
    });

    const { pushToUrl, replaceToUrl } = useNavigate();
    const { setToast } = useToastStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const DEFAULT_PATH = "/";
        // const DEFAULT_PATH = "/home"

        // 현재 URL의 query에서 callbackUrl 가져오기
        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get("callbackUrl") ?? DEFAULT_PATH; // 기본 이동

        const res = await signIn("credentials", {
            redirect: false,
            email: currentValue.email,
            password: currentValue.password,
            callbackUrl,
        });

        if (res?.ok && res.url) {
            setTimeout(() => {
                replaceToUrl(res.url ?? DEFAULT_PATH);
            }, 100);
        } else {
            setToast({ msg: "아이디 혹은 비밀번호를 다시 확인해주세요", time: 2 });
        }
    };

    return (
        <Fragment>
            <article
                id="list"
                className="px-[2rem] bg-[linear-gradient(90deg,_#ffffff_10%,_var(--color-gray-100),_#ffffff_90%)] h-[100svh] w-full flex items-center justify-center overflow-hidden"
            >
                <motion.form
                    onSubmit={handleSubmit}
                    className="flex items-start justify-start flex-col gap-[2.4rem] max-w-[var(--size-mobile)] w-full"
                    initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    {/* 헤더 */}
                    <section className="flex justify-start w-full">
                        <IconComponent
                            type="graphic-logo-horizontal"
                            alt="아지트"
                            width={52}
                            height={52}
                        />
                    </section>
                    {/* 헤더 END */}

                    {/* 바디 */}
                    <section className="w-full flex flex-col gap-[1.6rem]">
                        <Item
                            type="text"
                            title="아이디"
                            placeholder="아이디"
                            onChange={(e) =>
                                setCurrentValue((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                        />

                        <Item
                            type="password"
                            title="비밀번호"
                            placeholder="비밀번호"
                            onChange={(e) =>
                                setCurrentValue((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                }))
                            }
                        />
                    </section>
                    {/* 바디 END */}

                    {/* 푸터 */}
                    <section className="flex flex-col gap-[0.8rem] justify-center w-full">
                        <UI.Button
                            type="submit"
                            className="bg-[var(--color-gray-1000)] text-white py-[1.6rem] flex-1"
                        >
                            로그인
                        </UI.Button>
                    </section>
                    {/* 푸터 END */}

                    {!initGlow ? (
                        <motion.div
                            key={`glow-${initGlow}`}
                            className="absolute inset-0 z-10 pointer-events-none blur-[12px] rounded-full origin-center bg-[radial-gradient(circle,rgba(255,255,255,0)_0%,var(--color-gray-500)_20%,rgba(255,255,255,0)_70%)]"
                            initial={{ scale: 0, opacity: 0.4 }}
                            animate={{ scale: 10, opacity: -10 }}
                            transition={{ duration: 3, ease: "easeOut", repeat: 0 }}
                            onAnimationComplete={() => setInitGlow(true)}
                        />
                    ) : null}
                </motion.form>
            </article>
        </Fragment>
    );
};

const Item = ({ type, title, description, placeholder, onChange }: { type: string; title: string; description?: string; placeholder: string; onChange: (e: any) => void }) => {
    return (
        <section className="flex flex-col gap-[0.4rem]">
            <div className="flex items-center gap-[0.8rem]">
                <p className="text-[1.4rem]">{title}</p>
                {description && <p className="text-[1.2rem] text-[var(--color-gray-500)]">{description}</p>}
            </div>
            <UI.Input
                type={type}
                placeholder={placeholder}
                onChange={onChange}
            />
        </section>
    );
};

export default LoginForm;
