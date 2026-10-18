"use client";

import { signIn } from "next-auth/react";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import UI from "@/shared/ui/common/UIComponent";
import useNavigate from "@/shared/hooks/useNavigate";
import { useToastStore } from "@/shared/stores/useToastStore";
import IconComponent from "@/shared/ui/common/IconComponent";
import { useSetUserWithToast } from "@/widgets/signup/model/useSignupMutations";
import { useGetInvitationCodeCheckQuery } from "@/entities/invitation/api/invitation.query";

const SignupForm = () => {
    const [selectedMenu, setSelectedMenu] = useState<number>(1);

    const SelectedTabContent = (value: number) => {
        switch (value) {
            case 1:
                return <SignupCredentialsForm />;
            default:
                return <SignupCredentialsForm />;
        }
    };

    return <Fragment>{SelectedTabContent(selectedMenu)}</Fragment>;
};

const SignupCredentialsForm = () => {
    const { setToast } = useToastStore();
    const { replaceToUrl, backToUrl } = useNavigate();
    const { data: setUserData, mutate: setUserFetch } = useSetUserWithToast();
    const [currentCode, setCurrentCode] = useState("");
    const { data: getInvitationCodeCheckData, refetch: getInvitationCodeCheckFetch } = useGetInvitationCodeCheckQuery(currentCode);

    const [initGlow, setInitGlow] = useState(false);

    const RULE_NICK_NAME_LENGTH = 2;
    const RULE_ID_LENGTH = 5;
    const RULE_PW_LENGTH = 10;

    const signUpValueRef = useRef({
        email: "",
        name: "",
        password: "",
        reCheckPassword: "",
    });

    const checkValidation = () => {
        const SIGN_UP_VALUE = signUpValueRef.current;

        if (!SIGN_UP_VALUE.name) {
            setToast({ msg: "사용하실 닉네임을 입력해주세요", time: 2 });
            return false;
        }
        if (SIGN_UP_VALUE.name.length < RULE_NICK_NAME_LENGTH) {
            setToast({
                msg: `닉네임은 최소 ${RULE_NICK_NAME_LENGTH}자리 이상이어야 해요`,
                time: 2,
            });
            return false;
        }

        if (!SIGN_UP_VALUE.email) {
            setToast({ msg: "사용하실 아이디를 입력해주세요", time: 2 });
            return false;
        }
        if (SIGN_UP_VALUE.email.length < RULE_ID_LENGTH) {
            setToast({
                msg: `아이디는 최소 ${RULE_ID_LENGTH}자리 이상이어야 해요`,
                time: 2,
            });
            return false;
        }

        if (!SIGN_UP_VALUE.password) {
            setToast({ msg: "비밀번호를 설정해주세요", time: 2 });
            return false;
        }
        if (SIGN_UP_VALUE.password.length < RULE_PW_LENGTH) {
            setToast({
                msg: `비밀번호는 최소 ${RULE_PW_LENGTH}자리 이상이어야 해요`,
                time: 2,
            });
            return false;
        }

        if (!SIGN_UP_VALUE.reCheckPassword) {
            setToast({ msg: "확인용 비밀번호를 설정해주세요", time: 2 });
            return false;
        }
        if (SIGN_UP_VALUE.password !== SIGN_UP_VALUE.reCheckPassword) {
            setToast({
                msg: "입력하신 비밀번호와 확인용 비밀번호가 일치하지 않아요",
                time: 2,
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationResult = checkValidation();
        if (!validationResult) return;

        setUserFetch({
            email: signUpValueRef.current.email,
            name: signUpValueRef.current.name,
            password: signUpValueRef.current.password,
            inviteCode: currentCode,
        });

        // const DEFAULT_PATH = "/login"
        // const params = new URLSearchParams(window.location.search);
        // const callbackUrl = params.get("callbackUrl") ?? DEFAULT_PATH;

        // const res = await signIn("credentials", {
        //     redirect: false,
        //     email: signUpValueRef.current.email,
        //     name: signUpValueRef.current.name,
        //     password: signUpValueRef.current.password,
        //     callbackUrl,
        // });

        // if (res?.ok && res.url) {
        //     setTimeout(() => {
        //         replaceToUrl(res.url ?? DEFAULT_PATH);
        //     }, 100);
        // } else {
        //     setToast({ msg: "아이디 혹은 비밀번호를 다시 확인해주세요", time: 2 });
        // }
    };

    useEffect(() => {
        if (setUserData) {
            replaceToUrl("/login");
        }
    }, [setUserData]);

    return (
        <Fragment>
            <article
                id="list"
                className="px-[2rem] bg-[linear-gradient(90deg,_#ffffff_10%,_var(--color-gray-100),_#ffffff_90%)] h-[100svh] w-full flex items-center justify-center overflow-hidden"
            >
                <motion.form
                    onSubmit={handleSubmit}
                    className="bg-white p-[2.4rem] rounded-[2.4rem] flex items-center flex-col gap-[2.4rem] max-w-[var(--size-mobile)] w-full shadow-[var(--shadow-normal)]"
                    initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    {/* 헤더 */}
                    <section className="flex justify-center w-full">
                        <IconComponent
                            type="graphic-logo-vertical"
                            alt="아지트"
                            width={100}
                            height={108}
                        />
                    </section>
                    {/* 헤더 END */}

                    {/* 바디 */}
                    <section className="w-full flex flex-col items-center justify-center gap-[2.4rem]">
                        {!getInvitationCodeCheckData?.result ? (
                            <Fragment>
                                <Item
                                    type="text"
                                    title="초대코드"
                                    placeholder="초대코드를 입력해주세요"
                                    onChange={(e) => {
                                        setCurrentCode(e.target.value);
                                    }}
                                />
                                <p className="text-[1.2rem] text-[var(--color-gray-500)] text-center">
                                    {getInvitationCodeCheckData?.statusCode === 0 ? "코드입력이 필요합니다." : ""}
                                    {getInvitationCodeCheckData?.statusCode === 1 ? "코드 유효성 검증 완료." : ""}
                                    {getInvitationCodeCheckData?.statusCode === 2 ? "코드가 만료되었습니다." : ""}
                                    {getInvitationCodeCheckData?.statusCode === 3 ? "비활성화된 코드입니다." : ""}
                                    {getInvitationCodeCheckData?.statusCode === 4 ? "이미 사용된 코드입니다." : ""}
                                    {getInvitationCodeCheckData?.statusCode === 5 ? "발급되지 않은 코드입니다." : ""}
                                </p>
                                <UI.Button
                                    className="bg-[var(--color-gray-200)] text-[var(--color-gray-700)] px-[0.8rem] py-[0.4rem] rounded-[0.4rem]"
                                    onClick={() => {
                                        getInvitationCodeCheckFetch();
                                    }}
                                >
                                    초대코드 확인
                                </UI.Button>
                            </Fragment>
                        ) : (
                            ""
                        )}

                        {getInvitationCodeCheckData?.result ? (
                            <Fragment>
                                <Item
                                    type="text"
                                    title="닉네임"
                                    description={`최소 ${RULE_NICK_NAME_LENGTH}자리 이상`}
                                    placeholder="닉네임"
                                    onChange={(e) => {
                                        signUpValueRef.current = {
                                            ...signUpValueRef.current,
                                            name: e.target.value,
                                        };
                                    }}
                                />

                                <Item
                                    type="text"
                                    title="아이디"
                                    description={`최소 ${RULE_ID_LENGTH}자리 이상`}
                                    placeholder="아이디"
                                    onChange={(e) => {
                                        signUpValueRef.current = {
                                            ...signUpValueRef.current,
                                            email: e.target.value,
                                        };
                                    }}
                                />

                                <Item
                                    type="password"
                                    title="비밀번호"
                                    description={`최소 ${RULE_PW_LENGTH}자리 이상`}
                                    placeholder="비밀번호를 입력해주세요"
                                    onChange={(e) => {
                                        signUpValueRef.current = {
                                            ...signUpValueRef.current,
                                            password: e.target.value,
                                        };
                                    }}
                                />

                                <Item
                                    type="password"
                                    title="비밀번호 확인"
                                    description=""
                                    placeholder="비밀번호를 다시 입력해주세요"
                                    onChange={(e) => {
                                        signUpValueRef.current = {
                                            ...signUpValueRef.current,
                                            reCheckPassword: e.target.value,
                                        };
                                    }}
                                />
                            </Fragment>
                        ) : (
                            ""
                        )}
                    </section>
                    {/* 바디 END */}

                    {/* 푸터 */}
                    <section className="flex flex-col gap-[0.8rem] justify-center w-full">
                        <UI.Button
                            type="submit"
                            className={`bg-[var(--color-gray-1000)] text-white py-[1.6rem] rounded-[1.6rem] shadow-[var(--shadow-normal)] flex-1 ${getInvitationCodeCheckData?.result ? "" : "pointer-events-none opacity-50"}`}
                        >
                            등록하기
                        </UI.Button>

                        <UI.Button
                            onClick={() => replaceToUrl("/login")}
                            className="bg-white text-black py-[1.6rem] rounded-[1.6rem] shadow-[var(--shadow-normal)] flex-1"
                        >
                            이전으로
                        </UI.Button>
                    </section>
                    {/* 푸터 END */}

                    {!initGlow ? (
                        <motion.div
                            key={`glow-${initGlow}`}
                            className="absolute inset-0 z-10 pointer-events-none blur-[12px] rounded-full origin-center bg-[radial-gradient(circle,rgba(255,255,255,0)_0%,var(--color-gray-500)_20%,rgba(255,255,255,0)_70%)]"
                            initial={{ scale: 0, opacity: 0.4 }}
                            animate={{ scale: 10, opacity: -10 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            onAnimationComplete={() => setInitGlow(true)}
                        />
                    ) : (
                        ""
                    )}
                </motion.form>
            </article>
        </Fragment>
    );
};

const Item = ({ type, title, description, placeholder, onChange }: { type: string; title: string; description?: string; placeholder: string; onChange: (e: any) => void }) => {
    return (
        <section className="flex flex-col gap-[0.8rem] w-full">
            <div className="flex items-center gap-[0.8rem]">
                <p>{title}</p>
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

export default SignupForm;
