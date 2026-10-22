"use client";

import { AnimatePresence, motion, Reorder, useDragControls } from "motion/react";
import React, { forwardRef, Fragment, ReactNode, Suspense, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";

import {
    ButtonProps,
    CalendarModalProps,
    CheckBoxProps,
    DropDownProps,
    FileUploadProps,
    FilterProps,
    InputProps,
    MiniModalProps,
    MultiSelectProps,
    NumberInputProps,
    PaginationProps,
    PasswordInputProps,
    RadioProps,
    SelectProps,
    SwitchProps,
    TabComponentProps,
    TextAreaProps,
} from "@/shared/types/ui.type";
import useNavigate from "@/shared/hooks/useNavigate";
import { useToastStore } from "@/shared/stores/useToastStore";
import IconComponent from "@/shared/ui/common/IconComponent";
import FloatingSelector from "@/shared/ui/common/FloatingSelector";
import Window from "@/shared/ui/common/Window";
import { util } from "@/shared/lib/util";
import { useDirtyStore } from "@/shared/stores/useDirtyStore";
import { useModalStore } from "@/shared/stores/useModalStore";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, type FallbackProps, getErrorMessage } from "react-error-boundary";

const CheckBox = ({ defaultState = false, className, checked, guide, desc_no, preventClick = false, onChange }: CheckBoxProps) => {
    const [currentState, setCurrentState] = useState<boolean>(defaultState);

    useEffect(() => {
        setCurrentState(defaultState);
    }, [defaultState]);

    return (
        <div className={`flex items-center justify-center ${className?.container ? className.container : ""}`}>
            <UI.Button
                className={`flex items-center gap-[0.4rem] ${className?.button ? className.button : ""}`}
                onClick={() => {
                    onChange(!currentState);

                    if (!preventClick) {
                        setCurrentState(!currentState);
                    }
                }}
            >
                <div
                    className={`w-[2rem] h-[2rem] rounded-[0.8rem] m-[0.4rem] relative transition-colors ${currentState ? "bg-[var(--color-brand-500)] shadow-[var(--shadow-normal)]" : "bg-[var(--color-gray-200)] border-[0.4rem] border-[var(--color-gray-300)] hover:bg-[var(--color-gray-200)]"}`}
                    data-description={desc_no}
                >
                    <p
                        className={`absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] font-bold text-[1.6rem] pointer-events-none ${currentState ? "text-[var(--color-text-primary)]" : "hidden"}`}
                    >
                        ✓
                    </p>
                </div>
                {guide ? <p>{guide}</p> : ""}
            </UI.Button>
        </div>
    );
};

const Radio = ({ list, defaultValue = 0, className, desc_no, onChange }: RadioProps) => {
    const [currentSelected, setCurrentSelected] = useState<number>(defaultValue);

    const DEFAULT_LIST = [
        {
            title: "사용함",
            value: 1,
        },
        {
            title: "사용 안함",
            value: 0,
        },
    ];
    return (
        <section
            className={`flex gap-[1.2rem] ${className?.container ?? ""}`}
            data-description={desc_no}
        >
            {(list ?? DEFAULT_LIST).map((e, i) => (
                <motion.button
                    key={i}
                    type="button"
                    className={`item flex items-center gap-[0.8rem] p-[0.4rem] hover:bg-[var(--color-gray-200)] rounded-[0.8rem] transition-colors ${className?.button ?? ""}`}
                    onClick={() => {
                        setCurrentSelected(e.value);
                        onChange(e.value);
                    }}
                    whileTap={{ scale: 0.9 }}
                    data-description={desc_no}
                >
                    <div className={`w-[2rem] h-[2rem] relative rounded-full ${currentSelected === e.value ? "bg-[var(--color-blue-1000)]" : "border border-[var(--color-gray-400)]"}`}>
                        <div
                            className={`absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] rounded-full w-[0.8rem] h-[0.8rem] ${currentSelected === e.value ? "bg-[var(--color-surface)]" : "bg-transparent"}`}
                        />
                    </div>
                    <p className="font-medium pointer-events-none">{e.title}</p>
                </motion.button>
            ))}
        </section>
    );
};

const Switch = ({ states, onChange, desc_no }: SwitchProps) => {
    return (
        <motion.section
            className={`switch w-[calc(1.6rem*2+0.4rem)] h-[2rem] p-[0.4rem] rounded-full flex cursor-pointer ${states ? "justify-end" : "justify-start"}`}
            animate={{
                background: states ? "var(--color-blue-1000)" : "var(--color-gray-400)",
            }}
            onClick={() => onChange(!states)}
            data-description={desc_no}
        >
            <motion.div
                layout
                className="w-[1.6rem] h-[1.6rem] bg-[var(--color-surface)] rounded-full"
                transition={{
                    duration: 0.5,
                    ease: [0, 0.9, 0.95, 1],
                }}
            />
        </motion.section>
    );
};

const Input = forwardRef<{ reset: () => void }, InputProps & { phoneNumber?: boolean; validationPattern?: RegExp }>(
    (
        {
            disabled = false,
            name = "input",
            desc_no,
            defaultValue,
            icon = false,
            type = "text",
            placeholder = "placeholder 지정이 필요해요",
            validationPattern,
            guide,
            className,
            autoComplete = "on",
            phoneNumber = false, // 새 옵션
            onChange,
            onInput,
            onBlur,
        },
        ref,
    ) => {
        const [value, setValue] = useState(defaultValue || "");

        useImperativeHandle(ref, () => ({
            reset() {
                setValue("");
                if (onChange) {
                    onChange({
                        target: { value: "" },
                    } as React.ChangeEvent<HTMLInputElement>);
                }
            },
        }));

        useEffect(() => {
            if (defaultValue !== undefined) {
                setValue(defaultValue);
            }
        }, [defaultValue]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let val = e.target.value;

            if (phoneNumber) {
                // 숫자만 허용
                val = val.replace(/\D/g, "");
            }

            if (validationPattern) {
                // val에서 패턴에 맞지 않는 문자 제거
                val = val
                    .split("")
                    .filter((char) => validationPattern.test(char))
                    .join("");
            }

            setValue(val);

            if (onChange) {
                onChange({ ...e, target: { ...e.target, value: val } });
            }
        };

        return (
            <section
                className={`flex items-center gap-[0.8rem] max-h-[var(--input-height)] h-full transition-colors bg-[var(--color-surface)] border border-[var(--color-gray-200)] hover:border-[var(--color-brand-500)] relative ${className?.container ? className?.container : "px-[1.2rem] border border-[var(--color-gray-200)] hover:border-[var(--color-gray-500)] focus:border-[var(--color-gray-500)]"}`}
                data-description={desc_no}
            >
                {guide && <p className="absolute top-[50%] right-[1.6rem] transform -translate-y-1/2">{guide}</p>}
                <input
                    name={name}
                    disabled={disabled}
                    type={type}
                    placeholder={placeholder}
                    onInput={onInput}
                    onChange={handleChange} // 여기서 숫자 필터 적용
                    onBlur={onBlur}
                    value={value}
                    autoComplete={autoComplete}
                    data-description={desc_no}
                    className={`w-full ${className?.input ? className.input : ""} `}
                />
                {icon && (
                    <IconComponent
                        type="colored-lens"
                        alt="돋보기"
                    />
                )}
            </section>
        );
    },
);

Input.displayName = "Input";

const NumberInput = ({
    disabled = false,
    name = "number-input",
    desc_no,
    defaultValue = 0,
    icon = false,
    placeholder = "숫자를 입력하세요",
    guide,
    className,
    autoComplete = "off",
    max = 1_000_000, // 기본 상한 10억
    comma = true,
    onChange,
    onInput,
    onBlur,
}: NumberInputProps) => {
    const inputValueRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: any) => {
        let value = e.target.value.replace(/,/g, "");

        // 숫자만 허용
        value = value.replace(/[^0-9]/g, "");

        // 빈 값 처리
        if (value === "") value = "0";

        // 정수 변환
        let numValue = parseInt(value, 10);

        // 음수 방지
        if (numValue < 0) numValue = 0;

        // 상한 제한
        if (numValue > max) numValue = max;

        // input 값 강제 업데이트
        const FINAL_VALUE = parseInt(value) >= max ? max : numValue;

        e.target.value = `${comma ? util.string.getCommaOnPrice(FINAL_VALUE) : FINAL_VALUE}`;

        onChange?.({ target: { value: numValue.toString() } });
    };

    const handleBlur = (e: any) => {
        let value = parseInt(e.target.value, 10);

        // blur 시점에서도 최소 0 보장
        if (isNaN(value) || value < 0) {
            value = 0;
            e.target.value = "0";
            onChange?.({ target: { value: "0" } });
        }

        onBlur?.(e);
    };

    useEffect(() => {
        if (inputValueRef.current) {
            const INIT_VALUE = comma ? util.string.getCommaOnPrice(defaultValue) : defaultValue;

            inputValueRef.current.value = `${INIT_VALUE}`;
        }
    }, [defaultValue]);

    return (
        <section
            className={`flex items-center gap-[0.8rem] px-[1.6rem] transition-colors rounded-[0.8rem] relative ${className?.container ? className.container : "border border-[var(--color-gray-200)] hover:border-[var(--color-blue-1000)] focus:border-[var(--color-blue-1000)]"}`}
            data-description={desc_no}
        >
            {guide && <p className="absolute top-[50%] right-[1.6rem] transform translate-y-[-50%] translate-x-0">{guide}</p>}
            {icon && (
                <IconComponent
                    type="colored-lens"
                    alt="돋보기"
                />
            )}
            <input
                ref={inputValueRef}
                type="text"
                inputMode="numeric" // 모바일 키패드 숫자 전용
                name={name}
                disabled={disabled}
                placeholder={placeholder}
                onInput={onInput}
                onChange={handleChange}
                onBlur={handleBlur}
                // value={ `${ defaultValue }` }
                className={`w-full ${className?.input ? className.input : ""}`}
                defaultValue={defaultValue}
                autoComplete={autoComplete}
                data-description={desc_no}
            />
        </section>
    );
};

const PasswordInput = ({
    disabled = false,
    name = "password-input",
    desc_no,
    defaultValue = "",
    placeholder = "비밀번호를 입력하세요",
    guide,
    className,
    autoComplete = "off",
    digit,
    showToggle = true,
    onChange,
    onInput,
    onBlur,
}: PasswordInputProps & { digit?: number }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [visible, setVisible] = useState(false);
    const { setToast } = useToastStore();

    const handleChange = (e: any) => {
        let value = e.target.value;

        // 숫자만 허용
        value = value.replace(/[^0-9]/g, "");

        // digit 제한 적용
        if (digit && value.length > digit) {
            // 이전 값으로 되돌림
            e.target.value = inputRef.current?.value || "";
            return;
        }

        // 값 업데이트
        e.target.value = value;
        onChange?.({ target: { value } });
    };

    const handleBlur = (e: any) => {
        onBlur?.(e);
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = defaultValue;
        }
    }, [defaultValue]);

    return (
        <section
            className={`flex items-center gap-[0.8rem] px-[1.6rem] border border-[var(--color-gray-200)] hover:border-[var(--color-blue-1000)] focus-within:border-[var(--color-blue-1000)] transition-colors rounded-[0.8rem] relative ${className?.container ?? ""}`}
            data-description={desc_no}
        >
            {guide && <p className="absolute top-[50%] right-[1.6rem] transform -translate-y-1/2">{guide}</p>}
            <input
                ref={inputRef}
                type={visible ? "text" : "password"}
                name={name}
                disabled={disabled}
                placeholder={placeholder}
                onInput={onInput}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={(e) => {
                    if (!digit) return;

                    const input = e.currentTarget;

                    if (input.value.length > digit) {
                        setToast({ msg: `최대 ${digit}자리까지 입력이 가능해요`, time: 2 });
                        input.value = input.value.slice(0, digit);
                    }
                }}
                className={`w-full ${className?.input ?? ""}`}
                autoComplete={autoComplete}
            />
            {showToggle && (
                <button
                    type="button"
                    className={`ml-2 ${className?.toggle ?? ""}`}
                    onClick={() => setVisible((prev) => !prev)}
                >
                    {visible ? "숨기기" : "보기"}
                </button>
            )}
        </section>
    );
};

const TextArea = ({ onChange, maxLength, placeholder = "내용을 입력하세요.", className, defaultValue = "", desc_no }: TextAreaProps) => {
    const [currentValue, setCurrentValue] = useState(defaultValue);

    return (
        <div
            className={`relative w-full ${className?.container}`}
            data-description={desc_no}
        >
            <textarea
                value={currentValue}
                onChange={(e) => {
                    setCurrentValue(e.target.value);
                    onChange(e);
                }}
                maxLength={maxLength}
                placeholder={placeholder}
                className={`w-full border rounded resize-none tab-size-[4] ${className?.textarea}`}
            />
            {maxLength && (
                <span className="absolute text-[var(--color-gray-600)] bottom-[1.6rem] right-[1.6rem]">
                    {defaultValue.length}/{maxLength}자
                </span>
            )}
        </div>
    );
};

const Select = ({ list = [], trackingData, defaultValue, className, desc_no, onChange }: SelectProps) => {
    const containerRef = useRef<HTMLElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const [showMenu, setShowMenu] = useState(false);
    const [currentValue, setCurrentValue] = useState();
    // const [ currentValue, setCurrentValue ] = useState( defaultValue ? defaultValue : INIT_VALUE?.value );
    const [positionStyle, setPositionStyle] = useState<{
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    }>({ left: 0 });

    const detectOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            setShowMenu(false);
        }
    };

    useEffect(() => {
        if (showMenu) {
            document.addEventListener("click", detectOutsideClick);

            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const dropdownWidth = buttonRef.current.offsetWidth;
                const dropdownHeight = 200; // 예상 높이 (필요하면 동적 측정 가능)
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // 가로 위치 계산
                if (rect.left + dropdownWidth > viewportWidth) {
                    setPositionStyle({ right: 0 });
                } else {
                    setPositionStyle({ left: 0 });
                }

                // 세로 위치 계산
                if (rect.bottom + dropdownHeight > viewportHeight) {
                    setPositionStyle({ bottom: rect.height + 4 });
                } else {
                    setPositionStyle({ top: rect.height + 4 });
                }
            }
        }
        return () => {
            document.removeEventListener("click", detectOutsideClick);
        };
    }, [showMenu]);

    useEffect(() => {
        setCurrentValue(defaultValue);
    }, [trackingData, defaultValue]);

    useEffect(() => {
        onChange(defaultValue);
    }, [defaultValue]);

    return (
        <section
            ref={containerRef}
            className={`switch rounded-[0.8rem] relative ${className?.container ? className.container : ""}`}
        >
            <button
                ref={buttonRef}
                className={`${
                    className?.button ? className.button : "min-w-[12.8rem] h-[var(--input-height)] rounded-[0.8rem] bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)] px-[1.2rem]"
                    // className?.button ? className.button : "h-full"
                } flex justify-between items-center text-left transition-colors`}
                onClick={() => setShowMenu(!showMenu)}
                data-description={desc_no}
            >
                <p className="pointer-events-none">{list.find((e) => e.value === currentValue)?.title}</p>

                <IconComponent
                    type="colored-arrow-below"
                    alt="더보기"
                    className={`${showMenu ? "rotate-180" : ""} transition-transform`}
                />
            </button>

            <AnimatePresence>
                {showMenu && (
                    <motion.section
                        className="absolute bg-[var(--color-surface)] backdrop-blur-sm max-h-[23.2rem] min-w-[calc(1.6rem*5)] overflow-y-auto flex flex-col gap-[0.4rem] shadow-[var(--shadow-normal)] p-[0.4rem] rounded-[1.2rem] z-1 overflow-hidden"
                        style={{
                            width: buttonRef.current?.offsetWidth,
                            ...positionStyle,
                        }}
                        initial={{ opacity: 0, transform: "scale(0.99)", height: "0px" }}
                        animate={{ opacity: 1, transform: "scale(1)", height: "auto" }}
                        exit={{ opacity: 0, transform: "scale(0.99)", height: "0px" }}
                        transition={{
                            delay: 0,
                            type: "spring",
                            mass: 0.1,
                            stiffness: 100,
                            damping: 10,
                        }}
                    >
                        <AnimatePresence>
                            {list.map((e, i) => (
                                <motion.button
                                    key={`${e}-${i}`}
                                    type="button"
                                    className={`text-left hover:bg-[var(--color-surface)] text-[var(--color-gray-700)] rounded-[1.2rem] p-[1.2rem] transition-colors ${
                                        // e.value === defaultValue
                                        e.value === currentValue ? "bg-[var(--color-surface)] shadow-[var(--shadow-normal)]" : "bg-transparent"
                                    }`}
                                    onClick={() => {
                                        console.log("click 발생");
                                        setCurrentValue(e.value);
                                        onChange(e.value);
                                        setShowMenu(false);
                                    }}
                                    initial={{ opacity: 0, transform: "scale(0.8)" }}
                                    animate={{ opacity: 1, transform: "scale(1)" }}
                                    exit={{ opacity: 0, transform: "scale(0.8)" }}
                                    transition={{
                                        delay: 0.03 * (i + 1),
                                        type: "spring",
                                        mass: 0.1,
                                        stiffness: 100,
                                        damping: 10,
                                    }}
                                >
                                    {e.title}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </motion.section>
                )}
            </AnimatePresence>
        </section>
    );
};

const Filter = forwardRef<{ reset: () => void }, FilterProps>(({ list = [], defaultValue, className, style, desc_no, elementRef, onChange, onConfirm, onCancel }, ref) => {
    const [showMenu, setShowMenu] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [initList, setInitList] = useState<{ title: string; state: boolean; value?: any }[]>([]);
    const [currentList, setCurrentList] = useState<{ title: string; state: boolean; value?: any }[]>(list);
    const [positionStyle, setPositionStyle] = useState<{
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    }>({ left: 0 });

    const { setToast } = useToastStore();

    const filterContainerRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const allItems = list;
    const activeItems = currentList?.filter((e) => e.state);

    const close = () => {
        setCurrentList(initList);
        setShowMenu(false);
    };

    const detectOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            close();
        }
    };

    useImperativeHandle(ref, () => ({
        reset: () => {
            setCurrentList(list.map((item) => ({ ...item, state: true })));
        },
    }));

    useEffect(() => {
        if (showMenu) {
            document.addEventListener("click", detectOutsideClick);

            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const dropdownWidth = buttonRef.current.offsetWidth;
                const dropdownHeight = 200;
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                if (rect.left + dropdownWidth > viewportWidth) {
                    setPositionStyle({ right: 0 });
                } else {
                    setPositionStyle({ left: 0 });
                }

                if (rect.bottom + dropdownHeight > viewportHeight) {
                    setPositionStyle({ bottom: rect.height + 4 });
                } else {
                    setPositionStyle({ top: rect.height + 4 });
                }
            }
        }

        return () => {
            document.removeEventListener("click", detectOutsideClick);
        };
    }, [showMenu]);

    useEffect(() => {
        onChange?.(currentList);
        setCurrentIndex(0);

        if (!activeItems?.length) return;
    }, [currentList]);

    useEffect(() => {
        setInitList(list);
    }, []);

    useEffect(() => {
        if (filterContainerRef.current) {
            setContainerHeight(filterContainerRef.current?.scrollHeight);
        }
    }, [filterContainerRef.current]);

    return (
        <motion.section
            ref={containerRef}
            className={`switch rounded-[0.8rem] relative`}
        >
            <motion.button
                ref={buttonRef}
                layout="size"
                className={`${className?.button ?? "h-full"} min-w-[20rem] flex items-center text-left px-[1.2rem] rounded-[0.8rem] bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)] transition-colors`}
                data-description={desc_no}
                onClick={() => setShowMenu(!showMenu)}
            >
                {activeItems?.length > 0 ? (
                    // <div className="h-[1.6rem] max-w-[calc(1.6rem*7)] relative whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="h-[1.6rem] max-w-[calc(1.6rem*7)] relative">
                        <AnimatePresence mode="wait">
                            {activeItems.map((item, i) =>
                                i === currentIndex ? (
                                    <motion.p
                                        layout
                                        key={`${activeItems[currentIndex]}`}
                                        className="w-full overflow-hidden pointer-events-none whitespace-nowrap text-ellipsis"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                            type: "spring",
                                            mass: 0.1,
                                            stiffness: 100,
                                            damping: 10,
                                        }}
                                    >
                                        {item.title}
                                    </motion.p>
                                ) : null,
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.p
                        className="pointer-events-none"
                        layout
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{
                            type: "spring",
                            mass: 0.1,
                            stiffness: 100,
                            damping: 10,
                        }}
                    >
                        항목을 선택해주세요
                    </motion.p>
                )}

                {activeItems.length ? (
                    <motion.p
                        key={`${activeItems[currentIndex]}`}
                        // key={ activeItems.find((e, idx) => idx === currentIndex )?.title }
                        layout="position"
                        className="ml-[0.4rem]"
                    >
                        {activeItems.length === allItems.length ? ` ・ 전체` : ` ・ ${activeItems.length}개`}
                    </motion.p>
                ) : null}

                <IconComponent
                    type="colored-arrow-below"
                    alt="더보기"
                    className={`${showMenu ? "rotate-180" : ""} transition-transform absolute right-[1.6rem] top-[50%] transform translate-y-[-50%]`}
                />
            </motion.button>

            <AnimatePresence>
                {showMenu && (
                    <motion.section
                        key={"as"}
                        ref={filterContainerRef}
                        className={`absolute bg-[var(--color-surface)] overflow-y-auto scrollbar-hide top-[calc(4.4rem+0.8rem)] flex flex-col gap-[0.4rem] shadow-[var(--shadow-normal)] p-[0.4rem] rounded-[1.2rem] min-w-[26rem] z-1 ${className?.container ?? ""}`}
                        style={{
                            width: buttonRef.current?.offsetWidth,
                            ...style,
                            ...positionStyle,
                        }}
                        initial={{ opacity: 0, transform: "scale(0.99)", height: `0px` }}
                        animate={{
                            opacity: 1,
                            transform: "scale(1)",
                            height: containerHeight,
                            // height: containerHeight + (16 * currentList.length) + 24
                            // height: (filterContainerRef.current?.scrollHeight ?? 0) + (16*currentList.length) + 24
                            // height: ref
                            //     ? (containerHeight > currentList.length * (26 + 38 + 16 + 24)
                            //         ? `auto`
                            //         : `calc(${containerHeight}px - 4.2rem - (1.6rem * 2))`)
                            //     : "auto"
                        }}
                        exit={{ opacity: 0, transform: "scale(0.99)", height: `0px` }}
                        transition={{
                            delay: 0,
                            type: "spring",
                            mass: 0.1,
                            stiffness: 100,
                            damping: 10,
                        }}
                    >
                        <motion.section
                            key={`mini-modal-header`}
                            className={`text-left text-[var(--color-gray-700)] rounded-[1.2rem] transition-colors`}
                            initial={{ opacity: 0, transform: "scale(0.8)" }}
                            animate={{ opacity: 1, transform: "scale(1)" }}
                            exit={{ opacity: 0, transform: "scale(0.8)" }}
                            transition={{
                                delay: 0.1 * 1,
                                type: "spring",
                                mass: 0.1,
                                stiffness: 100,
                                damping: 10,
                            }}
                        >
                            <UI.Button
                                onClick={() => {
                                    setCurrentList((prev) =>
                                        prev.map((items) => ({
                                            ...items,
                                            state: true,
                                            // state: currentList.some(e => e.state === true) ? false : true
                                        })),
                                    );
                                }}
                                className="text-right w-full py-[1.2rem] underline"
                            >
                                전체선택
                            </UI.Button>
                        </motion.section>

                        <section className="max-h-[22rem] overflow-y-auto">
                            {currentList.map((item, key) => (
                                <motion.div
                                    key={`${item}-${key}`}
                                    initial={{ opacity: 0, transform: "scale(0.8)" }}
                                    animate={{ opacity: 1, transform: "scale(1)" }}
                                    exit={{ opacity: 0, transform: "scale(0.8)" }}
                                    transition={{
                                        delay: 0.1 * (key + 1),
                                        type: "spring",
                                        mass: 0.1,
                                        stiffness: 100,
                                        damping: 10,
                                    }}
                                >
                                    <UI.CheckBox
                                        defaultState={item.state}
                                        checked={item.state}
                                        preventClick={currentList.filter((it) => it.state).length === 1}
                                        onChange={(e) => {
                                            // true 상태인 항목 수
                                            const activeCount = currentList.filter((it) => it.state).length;

                                            // 마지막 하나를 false로 바꾸려는 경우
                                            if (activeCount === 1 && item.state === true && e === false) {
                                                setToast({ msg: "하나 이상 선택하세요.", time: 2 });
                                                console.log("하나 이상 선택하세요.");

                                                return; // 상태 업데이트 막기
                                            }

                                            // 정상 업데이트
                                            setCurrentList((prev) => prev.map((items) => (items.title === item.title ? { ...items, state: e } : items)));
                                        }}
                                        guide={item.title}
                                        className={{ button: "justify-start flex-1 w-full" }}
                                    />
                                </motion.div>
                            ))}
                        </section>

                        <motion.section
                            key={`mini-modal-footer`}
                            className={`text-left flex flex-1 justify-end gap-[0.8rem] text-[var(--color-gray-700)] mt-[2.4rem] rounded-[1.2rem] transition-colors`}
                            initial={{ opacity: 0, transform: "scale(0.8)" }}
                            animate={{ opacity: 1, transform: "scale(1)" }}
                            exit={{ opacity: 0, transform: "scale(0.8)" }}
                            transition={{
                                delay: 0.1 * 3,
                                type: "spring",
                                mass: 0.1,
                                stiffness: 100,
                                damping: 10,
                            }}
                        >
                            <UI.Button
                                className={`bg-[var(--color-gray-200)] font-medium whitespace-nowrap rounded-[0.8rem] px-[1.6rem] h-[4.4rem]`}
                                onClick={() => {
                                    close();

                                    onCancel?.(initList);
                                }}
                            >
                                닫기
                            </UI.Button>

                            <UI.Button
                                className={`text-[var(--color-text-primary)] bg-[var(--color-blue-1000)] font-medium whitespace-nowrap rounded-[0.8rem] w-[12.8rem] h-[4.4rem]`}
                                onClick={(e) => {
                                    setShowMenu(false);

                                    onConfirm?.(currentList);
                                }}
                            >
                                완료
                            </UI.Button>
                        </motion.section>
                    </motion.section>
                )}
            </AnimatePresence>
        </motion.section>
    );
});

Filter.displayName = "Filter";

const MiniModal = ({ element, className, defaultValue, desc_no, onConfirm, onCancel, onChange }: MiniModalProps) => {
    const containerRef = useRef<HTMLElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const [showMenu, setShowMenu] = useState(false);
    const [currentValue, setCurrentValue] = useState("test");
    const [positionStyle, setPositionStyle] = useState<{
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    }>({ left: 0 });

    const detectOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            setShowMenu(false);
        }
    };

    useEffect(() => {
        if (showMenu) {
            document.addEventListener("click", detectOutsideClick);

            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const dropdownWidth = buttonRef.current.offsetWidth;
                const dropdownHeight = 200; // 예상 높이 (필요하면 동적 측정 가능)
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // 가로 위치 계산
                if (rect.left + dropdownWidth > viewportWidth) {
                    setPositionStyle({ right: 0 });
                } else {
                    setPositionStyle({ left: 0 });
                }

                // 세로 위치 계산
                if (rect.bottom + dropdownHeight > viewportHeight) {
                    setPositionStyle({ bottom: rect.height + 4 });
                } else {
                    setPositionStyle({ top: rect.height + 4 });
                }
            }
        }
        return () => {
            document.removeEventListener("click", detectOutsideClick);
        };
    }, [showMenu]);

    useEffect(() => {
        onChange(currentValue);
    }, [currentValue]);

    return (
        <section
            ref={containerRef}
            // className={`switch rounded-[0.8rem] relative p-[2.0rem] ${ className?.container ? className.container : "" }`}
            className={`switch rounded-[0.8rem] relative`}
            data-description={desc_no}
        >
            <button
                ref={buttonRef}
                className={`${
                    className?.button ? className.button : "h-full"
                } min-w-[12.8rem] flex justify-between items-center text-left px-[1.2rem] rounded-[0.8rem] bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)] transition-colors`}
                onClick={() => setShowMenu(!showMenu)}
            >
                <p>{defaultValue}</p>
                <IconComponent
                    type="colored-arrow-below"
                    alt="더보기"
                    className={`${showMenu ? "rotate-180" : ""} transition-transform`}
                />
            </button>

            <AnimatePresence>
                {showMenu && (
                    <motion.section
                        className={`absolute bg-[var(--color-surface)] flex flex-col gap-[0.4rem] border border-[var(--color-gray-200)] rounded-[1.2rem] z-1 w-[26rem] ${className?.container ? className.container : ""}`}
                        style={{
                            // width: buttonRef.current?.offsetWidth,
                            ...positionStyle,
                        }}
                        initial={{ opacity: 0, transform: "scale(0.99)" }}
                        animate={{ opacity: 1, transform: "scale(1)" }}
                        exit={{ opacity: 0, transform: "scale(0.99)" }}
                        transition={{
                            delay: 0,
                            type: "spring",
                            mass: 0.1,
                            stiffness: 100,
                            damping: 10,
                        }}
                    >
                        <AnimatePresence>
                            <motion.section
                                key={`mini-modal-header`}
                                className={`text-left text-[var(--color-gray-700)] rounded-[1.2rem] transition-colors`}
                                initial={{ opacity: 0, transform: "scale(0.8)" }}
                                animate={{ opacity: 1, transform: "scale(1)" }}
                                exit={{ opacity: 0, transform: "scale(0.8)" }}
                                transition={{
                                    delay: 0.1 * 1,
                                    type: "spring",
                                    mass: 0.1,
                                    stiffness: 100,
                                    damping: 10,
                                }}
                            >
                                {element.header}
                            </motion.section>

                            <motion.section
                                key={`mini-modal-body`}
                                className={`text-left text-[var(--color-gray-700)] rounded-[1.2rem] transition-colors`}
                                initial={{ opacity: 0, transform: "scale(0.8)" }}
                                animate={{ opacity: 1, transform: "scale(1)" }}
                                exit={{ opacity: 0, transform: "scale(0.8)" }}
                                transition={{
                                    delay: 0.1 * 2,
                                    type: "spring",
                                    mass: 0.1,
                                    stiffness: 100,
                                    damping: 10,
                                }}
                            >
                                {element.body}
                            </motion.section>

                            <motion.section
                                key={`mini-modal-footer`}
                                className={`text-left flex flex-1 justify-end gap-[0.4rem] text-[var(--color-gray-700)] mt-[2.4rem] rounded-[1.2rem] transition-colors`}
                                initial={{ opacity: 0, transform: "scale(0.8)" }}
                                animate={{ opacity: 1, transform: "scale(1)" }}
                                exit={{ opacity: 0, transform: "scale(0.8)" }}
                                transition={{
                                    delay: 0.1 * 3,
                                    type: "spring",
                                    mass: 0.1,
                                    stiffness: 100,
                                    damping: 10,
                                }}
                            >
                                <UI.Button
                                    className={`bg-[var(--color-gray-200)] font-medium whitespace-nowrap rounded-[0.8rem] px-[1.6rem] h-[4.4rem]`}
                                    onClick={(e) => {
                                        onCancel(e);
                                    }}
                                >
                                    닫기
                                </UI.Button>

                                <UI.Button
                                    className={`text-[var(--color-text-primary)] bg-[var(--color-blue-1000)] font-medium whitespace-nowrap rounded-[0.8rem] w-[12.8rem] h-[4.4rem]`}
                                    onClick={(e) => {
                                        onConfirm(e);
                                    }}
                                >
                                    완료
                                </UI.Button>
                                {element.footer}
                            </motion.section>
                        </AnimatePresence>
                    </motion.section>
                )}
            </AnimatePresence>
        </section>
    );
};

const DropDown = ({ children, className, list, height = "var(--input-height)", desc_no, prevent = false }: DropDownProps) => {
    const containerRef = useRef<HTMLElement>(null);
    const floatingRef = useRef<HTMLElement>(null);

    const [isShowList, setIsShowList] = useState(false);
    const [positionStyle, setPositionStyle] = useState<{
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    }>({ left: 0 });

    const detectOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            setIsShowList(false);
        }
    };

    useEffect(() => {
        if (isShowList) {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();

                const dropdownWidth = containerRef.current.offsetWidth;
                const dropdownHeight = 200; // 예상 높이 (필요하면 동적 측정 가능)

                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // 가로 위치 계산
                if (rect.left + dropdownWidth > viewportWidth) {
                    setPositionStyle({ right: 0 });
                } else {
                    setPositionStyle({ left: 0 });
                }

                // 세로 위치 계산
                if (rect.bottom + dropdownHeight > viewportHeight) {
                    setPositionStyle({ bottom: rect.height + 4 });
                } else {
                    setPositionStyle({ top: rect.height + 4 });
                }
            }

            document.addEventListener("click", detectOutsideClick);
        }
        return () => {
            document.removeEventListener("click", detectOutsideClick);
        };
    }, [isShowList]);

    return (
        <section
            ref={containerRef}
            className={`${className?.container ?? ""} relative cursor-pointer`}
            onClick={(e) => {
                if (prevent) {
                    e.preventDefault();
                }
                setIsShowList(!isShowList);
            }}
            data-description={desc_no}
        >
            {children}
            <AnimatePresence>
                {isShowList && (
                    <motion.section
                        ref={floatingRef}
                        // className={`${className?.inner ?? ""} absolute z-[100] flex flex-col cursor-pointer whitespace-nowrap bg-[#000000]`}
                        className={`${className?.inner ?? ""} absolute z-[100] grid grid-cols-1 cursor-pointer whitespace-nowrap bg-[var(--color-surface-floating)]`}
                        initial={{ opacity: 0, transform: "scale(0.99)", height: "0px" }}
                        animate={{
                            opacity: 1,
                            transform: "scale(1)",
                            height: (floatingRef.current?.scrollHeight ? floatingRef.current?.scrollHeight : 0) + 10,
                        }}
                        exit={{ opacity: 0, transform: "scale(0.99)", height: "0px" }}
                        transition={{
                            delay: 0,
                            type: "spring",
                            mass: 0.1,
                            stiffness: 100,
                            damping: 10,
                        }}
                        style={{
                            ...positionStyle,
                        }}
                    >
                        {list.map((e, index) => (
                            <Fragment key={index}>
                                {e.element ? (
                                    <Fragment>{e.element}</Fragment>
                                ) : (
                                    <motion.button
                                        key={index}
                                        type="button"
                                        value={e.value}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                            delay: 0,
                                            duration: 0.28,
                                            ease: [0.45, 0, 0.55, 1],
                                        }}
                                        className={`${e.className} item px-[1.6rem] py-[1.2rem] h-[calc((1.2rem*2)+1.6rem)] hover:bg-[#ff4321] transition-colors duration-200 truncate`}
                                        onClick={() => {
                                            e.onClick?.();
                                        }}
                                        data-description={desc_no}
                                    >
                                        {e.title}
                                    </motion.button>
                                )}
                            </Fragment>
                        ))}
                    </motion.section>
                )}
            </AnimatePresence>
        </section>
    );
};

const Calendar = ({
    className = "bg-[var(--color-gray-100)] text-[var(--color-gray-1000)] rounded-[0.8rem] px-[1.2rem] h-[4.4rem]",
    containerClassName,
    icon = false,
    desc_no,
    defaultValue = new Date(),
    onClose,
    onDateSelect,
    limitMonths = 12,
    limitMessage = "더 이상 이전 달을 조회할 수 없습니다.",
    ruleDate, // "YYYY-MM-DD" string
    center = false,
    onRuleAdjust, // 상대 Calendar를 보정하기 위한 callback
}: CalendarModalProps & {
    ruleDate?: string;
    onRuleAdjust?: (newDate: string) => void;
}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(defaultValue);
    const [positionStyle, setPositionStyle] = useState<{
        left?: number;
        right?: number;
    }>({ left: 0 });

    const { setToast } = useToastStore();
    const containerRef = useRef<HTMLElement>(null);
    const calendarRef = useRef<HTMLButtonElement>(null);

    const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const parseRuleDate = () => (ruleDate ? new Date(ruleDate) : null);

    const convertDateToStr = (date: Date, isEnd?: boolean) => {
        const base = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return isEnd ? `${base}T23:59:59` : `${base}T00:00:00`;
    };

    const adjustDateToLimit = (date: Date) => {
        if (!ruleDate || !limitMonths) return date;

        const rule = parseRuleDate()!;
        const min = new Date(rule.getFullYear(), rule.getMonth(), 1, 12);
        min.setMonth(min.getMonth() - limitMonths);
        min.setDate(1);

        const max = new Date(rule.getFullYear(), rule.getMonth(), 1, 12);
        max.setMonth(max.getMonth() + limitMonths);
        max.setDate(getDaysInMonth(max.getFullYear(), max.getMonth()));

        if (date.getTime() < min.getTime()) return min;
        if (date.getTime() > max.getTime()) return max;

        return date;
    };

    const handleDateClick = (day: number) => {
        const isEnd = String(desc_no).includes("종료일");

        // 종료일이면 23:59:59, 아니면 정오
        const SELECTED_DATE = isEnd
            ? // ? new Date(year, month, day, 23, 59, 59, 999)
              new Date(year, month, day, 23, 59, 59)
            : new Date(year, month, day, 12);

        setCurrentDate(SELECTED_DATE);
        setModalOpen(false);

        if (onDateSelect) onDateSelect(convertDateToStr(SELECTED_DATE, isEnd));
    };

    const prevMonth = () => {
        const PREV_DATE = new Date(year, month - 1, 1, 12);
        setCurrentDate(PREV_DATE);

        if (onDateSelect) onDateSelect(convertDateToStr(PREV_DATE, String(desc_no).includes("종료일")));
    };

    const nextMonth = () => {
        const NEXT_DATE = new Date(year, month + 1, 1, 12);
        setCurrentDate(NEXT_DATE);

        if (onDateSelect) onDateSelect(convertDateToStr(NEXT_DATE, String(desc_no).includes("종료일")));
    };

    const detectOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            setModalOpen(false);
        }
    };

    useEffect(() => {
        if (modalOpen) {
            document.addEventListener("click", detectOutsideClick);

            if (calendarRef.current) {
                const rect = calendarRef.current.getBoundingClientRect();
                const calendarWidth = 320;
                const viewportWidth = window.innerWidth;
                if (rect.left + calendarWidth > viewportWidth) setPositionStyle({ right: 0 });
                else setPositionStyle({ left: 0 });
            }
        }
        return () => document.removeEventListener("click", detectOutsideClick);
    }, [modalOpen]);

    useEffect(() => {
        if (!ruleDate) return;

        const descriptionKey = `${desc_no}`;
        const rule = new Date(ruleDate);

        if (descriptionKey.includes("종료일") && rule > currentDate) {
            const endDate = new Date(rule.getFullYear(), rule.getMonth(), rule.getDate(), 23, 59, 59, 999);
            console.log("endDate", endDate);
            setCurrentDate(endDate);
            if (onDateSelect) onDateSelect(convertDateToStr(endDate, true));
            return;
        }

        if (descriptionKey.includes("시작일") && rule < currentDate) {
            const startDate = new Date(rule.getFullYear(), rule.getMonth(), rule.getDate(), 12);
            setCurrentDate(startDate);
            if (onDateSelect) onDateSelect(convertDateToStr(startDate, false));
            return;
        }

        const SELECTED_DATE = adjustDateToLimit(currentDate);
        setCurrentDate(SELECTED_DATE);
        if (onDateSelect) onDateSelect(convertDateToStr(SELECTED_DATE, descriptionKey.includes("종료일")));
    }, [ruleDate]);

    useEffect(() => {
        console.log("currentDate", currentDate);
    }, [currentDate]);

    return (
        <section
            ref={containerRef}
            className={`relative calendar ${containerClassName ? containerClassName : ""}`}
        >
            <UI.Button
                ref={calendarRef}
                onClick={() => setModalOpen(!modalOpen)}
                className={`${className} ${icon ? "flex gap-[2.8rem] items-center justify-between" : ""} hover:bg-[var(--color-gray-200)] transition-colors`}
                // whileTap={{ scale: 0.95 }}
                desc_no={desc_no}
                rippleColor="#65778a"
            >
                {currentDate.toLocaleDateString("sv-SE")}
                {icon && (
                    <IconComponent
                        type="outlined-calendar"
                        alt="캘린더"
                    />
                )}
            </UI.Button>

            <AnimatePresence>
                {modalOpen && (
                    <motion.section
                        className={`${center ? "fixed top-[50%!important] left-[50%!important] transform translate-x-[-50%!important] translate-y-[-50%!important]" : "absolute"} flex items-center justify-center z-[1000] bg-[var(--color-surface)] rounded-[1.2rem] shadow-[var(--shadow-normal)] overflow-hidden`}
                        style={{
                            top: (calendarRef.current?.offsetHeight ?? 0) + 4,
                            ...positionStyle,
                        }}
                        initial={{ opacity: 0, transform: "scale(0.99)", height: "0px" }}
                        animate={{ opacity: 1, transform: "scale(1)", height: "auto" }}
                        exit={{ opacity: 0, transform: "scale(0.99)", height: "0px" }}
                        transition={{
                            delay: 0,
                            type: "spring",
                            mass: 0.1,
                            stiffness: 150,
                            damping: 10,
                        }}
                    >
                        <div
                            className="p-[2.4rem] w-[calc(1.6rem*20)] flex flex-col gap-[2.4rem]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <section className="flex items-center justify-between mb-4">
                                <button
                                    onClick={prevMonth}
                                    className="px-2 py-1 rounded hover:bg-gray-200"
                                    type="button"
                                >
                                    <IconComponent
                                        type="outlined-arrow-below"
                                        alt="이전"
                                        className="rotate-90"
                                    />
                                </button>
                                <h6 className="font-semibold text-[2rem]">
                                    {month + 1}월 {year}
                                </h6>
                                <button
                                    onClick={nextMonth}
                                    className="px-2 py-1 rounded hover:bg-gray-200"
                                    type="button"
                                >
                                    <IconComponent
                                        type="outlined-arrow-below"
                                        alt="다음"
                                        className="rotate-270"
                                    />
                                </button>
                            </section>

                            <section>
                                <section className="grid w-full grid-cols-7 mb-2 text-sm text-center gap-[2rem]">
                                    {DAYS.map((day, index) => (
                                        <p
                                            key={day}
                                            className={`${index === 0 ? "text-[var(--color-red-500)]" : "text-[var(--color-gray-1000)]"} w-[2.8rem] place-self-center`}
                                        >
                                            {day}
                                        </p>
                                    ))}
                                </section>

                                <section className="grid grid-cols-7 gap-[2rem]">
                                    {Array(firstDay)
                                        .fill(null)
                                        .map((_, idx) => (
                                            <div key={"empty-" + idx} />
                                        ))}
                                    {Array(daysInMonth)
                                        .fill(null)
                                        .map((_, idx) => {
                                            const day = idx + 1;
                                            const dateObj = new Date(year, month, day, 12); // ← 여기 추가

                                            const today = new Date();
                                            const isToday = dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();

                                            const isSelected =
                                                dateObj.getDate() === currentDate.getDate() && dateObj.getMonth() === currentDate.getMonth() && dateObj.getFullYear() === currentDate.getFullYear();

                                            return (
                                                <motion.button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => handleDateClick(day)}
                                                    className={`text-center py-1 hover:bg-[var(--color-gray-200)] transition-colors w-[2.8rem] h-[2.8rem] rounded-full
                                                    ${isSelected ? "bg-[var(--color-blue-1000)] text-[var(--color-text-primary)]" : isToday ? "bg-[var(--color-gray-100)] text-[var(--color-gray-700)]" : ""}`}
                                                >
                                                    {day}
                                                </motion.button>
                                            );
                                        })}
                                </section>
                            </section>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </section>
    );
};

const MultiSelect = ({ data, onChange }: MultiSelectProps) => {
    const [list, setList] = useState(data);

    useEffect(() => {
        onChange(list);
    }, [list]);

    return (
        <section className="flex gap-[0.8rem]">
            {list.map((e: any, i: number) => (
                <motion.button
                    key={i}
                    className={`p-[1.6rem] rounded-[0.8rem] ${e.state ? "bg-[var(--color-blue-100)] text-[var(--color-text-primary)]" : "bg-[var(--color-gray-100)]"}`}
                    onClick={() => {
                        setList((prev) => prev.map((item) => (item.id === e.id ? { ...item, state: !item.state } : item)));
                    }}
                    whileTap={{ scale: 0.9 }}
                >
                    {e.title}
                </motion.button>
            ))}
        </section>
    );
};

const FileUpload = ({ placeholder = "파일을 여기에 드래그하거나", buttonText = "파일 선택", onChange }: FileUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = (file: File) => {
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            // onChange?.(reader.result as string);
            onChange?.(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files[0]);
        }
    };

    const handleDragOver = (e: any) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: any) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files[0]);
        }
    };

    return (
        <section
            className={`relative w-full h-64 border rounded-lg flex items-center justify-center ${isDragging ? "border-blue-400 bg-blue-50" : "border-[var(--color-gray-200)] bg-[var(--color-surface)]"}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {preview ? (
                <img
                    src={preview}
                    alt="preview"
                    className="absolute top-0 left-0 object-cover w-full h-full rounded-lg"
                />
            ) : (
                <div className="flex flex-col items-center gap-[0.8rem] text-center">
                    <p className="text-gray-500">{placeholder}</p>
                    <button
                        type="button"
                        className="h-[4.4rem] px-[1.2rem] text-[var(--color-text-primary)] bg-[var(--color-gray-200)] rounded-[0.8rem]"
                        onClick={() => inputRef.current?.click()}
                    >
                        {buttonText}
                    </button>
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={handleInputChange}
            />
        </section>
    );
};

const Tab = ({ list, type = "button", className, preventTargetIdx = 999, preventMsg = "제한 설정 됨", defaultSelect = 0, onClick }: TabComponentProps) => {
    const [menuState, setMenuState] = useState(defaultSelect);

    const { setToast } = useToastStore();
    const { isDirty, resetDirty } = useDirtyStore();
    const { setModal } = useModalStore();

    const { pushToUrl } = useNavigate();

    const setPreventModal = ({ onClick }: { onClick: () => void }) =>
        setModal({
            type: "CHECK",
            title: "저장하지 않고 나가시겠어요?",
            description: "변경 사항이 모두 사라져요.",
            // description: msg,
            cancel: { text: "취소" },
            confirm: {
                text: "나가기",
                onClick: () => {
                    onClick();
                    resetDirty();
                },
            },
            isOpen: true,
        });

    useEffect(() => {
        setMenuState(defaultSelect);
        onClick(defaultSelect);
    }, [defaultSelect]);

    return (
        <section className={`${className?.container ? className.container : ""}`}>
            {list &&
                list.map((e, i) => (
                    <section key={i}>
                        <motion.button
                            key={i}
                            value={e.value}
                            // className={ `${ e.value === menuState ? `${ className?.active }` : `${ className?.normal }` } ${ className?.button }` }
                            className="px-[2rem] py-[1.2rem]"
                            onClick={() => {
                                const MOVE_TAB = () => {
                                    setMenuState(e.value);
                                    onClick(e.value);
                                };

                                if (preventTargetIdx !== 999 && preventTargetIdx !== i) {
                                    setToast({ msg: preventMsg });

                                    return;
                                }

                                if (isDirty) {
                                    setPreventModal({
                                        onClick: () => MOVE_TAB(),
                                    });

                                    return;
                                }

                                if (type === "button") {
                                    MOVE_TAB();
                                } else {
                                    pushToUrl(e.route ?? "/");
                                }
                            }}
                        >
                            {e.title}
                        </motion.button>

                        {e.value === menuState ? (
                            <motion.p
                                layout
                                key={"tab"}
                                id="underline"
                                layoutId="underline"
                                className="h-[0.4rem] w-full bg-[var(--color-surface-floating)]"
                            />
                        ) : (
                            ""
                        )}
                    </section>
                ))}
        </section>
    );
};

const Button = ({ children, className, type = "button", disabled = false, rippleColor = "#ffffff", ref, test, desc_no, onClick, onPointerDown, "aria-pressed": ariaPressed }: ButtonProps) => {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    return (
        <motion.button
            type={type}
            ref={ref}
            aria-pressed={ariaPressed}
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const newRipple = { x, y, id: Date.now() };
                setRipples((prev) => [...prev, newRipple]);

                if (onClick) onClick(e);

                // 0.8초 후 리플 제거
                setTimeout(() => {
                    setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
                }, 1500);
            }}
            onPointerDown={onPointerDown}
            className={`${className ? className : "relative"} relative overflow-hidden transition-opacity ${disabled ? "opacity-[0.5]" : ""}`}
            disabled={disabled}
            whileTap={{ scale: 0.95 }}
            data-testid={test ?? ""}
            data-description={desc_no}
        >
            {ripples.map((ripple) => (
                <motion.div
                    key={ripple.id}
                    className="absolute pointer-events-none w-full h-full z-10 rounded-full blur-[12px] [transform:translate(-50%,-50%)]"
                    style={{
                        left: `calc(${ripple.x}px - 50%)`,
                        top: `calc(${ripple.y}px - 50%)`,
                        background: `radial-gradient(circle, ${rippleColor}00 0%, ${rippleColor} 50%, ${rippleColor}00 70%)`,
                    }}
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 8, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            ))}

            {children}
        </motion.button>
    );
};

const Pagination = ({ totalCount, pageSize, currentPage, desc_no, onPageChange }: PaginationProps) => {
    const totalPages = Math.ceil(totalCount / pageSize);
    const maxVisible = 5;

    // 현재 페이지 기준으로 보이는 페이지 범위 계산
    const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    const pageNumbers = [];

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div
            className="flex items-center justify-center gap-2 mt-4"
            data-description={desc_no}
        >
            {/* 처음 */}
            <button
                onClick={() => onPageChange(currentPage - 10 <= 1 ? 1 : currentPage - 10)}
                disabled={currentPage === 1}
                className="bg-transparent rounded-full p-[0.4rem] hover:bg-[var(--color-gray-200)] disabled:opacity-50"
            >
                - 10(임시)
                {/* <IconComponent type='colored-arrow-below' className='rotate-90' width={24} height={24} alt='이전' /> */}
            </button>

            {/* 이전 */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-transparent rounded-full p-[0.4rem] hover:bg-[var(--color-gray-200)] disabled:opacity-50"
            >
                {/* 이전 */}
                <IconComponent
                    type="colored-arrow-below"
                    className="rotate-90"
                    width={24}
                    height={24}
                    alt="이전"
                />
            </button>

            {/* 페이지 번호 */}
            {pageNumbers.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`rounded-full w-[3.2rem] h-[3.2rem] text-[var(--color-gray-1000)] transition-colors ${
                        page === currentPage ? "bg-[var(--color-gray-100)] hover:bg-[var(--color-surface-floating)] hover:text-[var(--color-text-primary)]" : "hover:bg-[var(--color-gray-200)]"
                    }`}
                >
                    {page}
                </button>
            ))}

            {/* 다음 */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-transparent rounded-full p-[0.4rem] hover:bg-[var(--color-gray-200)] disabled:opacity-50"
            >
                {/* 다음 */}
                <IconComponent
                    type="colored-arrow-below"
                    className="rotate-270"
                    width={24}
                    height={24}
                    alt="이전"
                />
            </button>

            {/* 끝 */}
            <button
                onClick={() => onPageChange(currentPage + 10 >= totalPages ? totalPages : currentPage + 10)}
                disabled={currentPage === totalPages}
                className="bg-transparent rounded-full p-[0.4rem] hover:bg-[var(--color-gray-200)] disabled:opacity-50"
            >
                + 10(임시)
                {/* <IconComponent type='colored-arrow-below' className='rotate-270' width={24} height={24} alt='이전' /> */}
            </button>
        </div>
    );
};

type TableProps = {
    className?: string;
    desc_no?: string;
    // className?: {
    //     // container?: string;
    //     // header?: string;
    //     // body?: string;
    //     // row?: string;
    //     // col?: string;
    // };
    children: React.ReactNode;
};

const Table = ({ className, desc_no, children }: TableProps) => {
    return (
        <section
            className={`${className ?? ""}`}
            data-description={desc_no}
        >
            <section className="table-inner border border-[var(--color-gray-200)] rounded-[0.8rem]">{children}</section>
        </section>
    );
};

const TableHeader = ({ children, desc_no, className }: { children: React.ReactNode; desc_no?: string; className?: string }) => {
    return (
        <section
            className={`
                ${className ?? ""} 
                grid font-semibold bg-gray-100 border-b border-b-[var(--color-gray-200)] p-[0.4rem]
            `}
            data-description={desc_no}
        >
            {children}
        </section>
    );
};

const TableBody = ({
    children,
    desc_no,
    className,
    reorder = false,
    values,
    onReorder,
}: {
    children: React.ReactNode;
    desc_no?: string;
    className?: string;
    reorder?: boolean;
    values?: any[];
    onReorder?: (newOrder: any[]) => void;
}) => {
    if (reorder) {
        return (
            <Reorder.Group
                axis="y"
                values={values ?? []}
                onReorder={onReorder ?? (() => {})}
                // onReorder={onReorder ?? (() => {})}
                className={`${className ?? ""} flex flex-col`}
                data-description={desc_no}
            >
                {children}
            </Reorder.Group>
        );
    }

    return (
        <section
            className={`${className ?? ""} flex flex-col`}
            data-description={desc_no}
        >
            {children}
        </section>
    );
};

const TableRow = ({ children, className, reorder = false, value }: { children: React.ReactNode; className?: string; reorder?: boolean; value?: any }) => {
    const controls = useDragControls();

    if (reorder) {
        return (
            <Reorder.Item
                value={value}
                dragListener={false} // 기본 drag 막기
                dragControls={controls} // handle로만 drag 허용
                className={`
          ${className ?? ""} 
          grid border-b border-b-[var(--color-gray-200)] last:border-b-0 p-[0.4rem]
        `}
            >
                {/* 순서 변경 버튼 (이걸로만 drag 시작) */}
                <button
                    onPointerDown={(e) => controls.start(e)}
                    className="mr-2 cursor-grab"
                >
                    ☰
                </button>
                {children}
            </Reorder.Item>
        );
    }

    return <div className={`${className ?? ""} grid border-b border-b-[var(--color-gray-200)] last:border-b-0 p-[0.4rem]`}>{children}</div>;
};

const TableCell = ({
    children,
    className,
    desc_no,
    onClick,
}: {
    children?: React.ReactNode;
    className?: {
        container?: string;
        text?: string;
    };
    desc_no?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => {
    return (
        <div
            className={`
                ${typeof children === "string" ? "pointer-events-none" : ""}
                ${className?.container ? className.container : "px-[2rem] py-[1.2rem]"}
                flex items-center justify-center flex-1 rounded-[0.8rem]
            `}
            onClick={onClick}
            data-description={desc_no}
        >
            {typeof children === "string" ? (
                <p
                    className={`${className?.text ?? ""} flex-1`}
                    // className={`${className ?? ""} flex-1`}
                    data-description={desc_no}
                >
                    {children}
                </p>
            ) : (
                children
            )}
        </div>
    );
};

const ColorPicker = ({ defaultValue, onChange }: { defaultValue?: string; onChange: (e: string) => void }) => {
    const [colorMode, setColorMode] = useState(0);
    const [selectedColor, setSelectedColor] = useState("");
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [positionStyle, setPositionStyle] = useState<{
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    }>({ left: 0 });

    const containerRef = useRef<HTMLElement>(null);

    const COLOR_GROUPS: Record<string, string[]> = {
        transparent: ["#FFFFFF00"],
        red: ["#FFE0E0"],
        orange: ["#FFE5CC"],
        yellow: ["#FFFCD9"],
        green: ["#D6FADC"],
        sky: ["#D1F1FF"],
        blue: ["#D6E4FF"],
        purple: ["#E8D6FF"],
        gray: ["#F3F4F6"],
    };

    const COLOR_SPECIAL_GROUPS: Record<string, string[]> = {
        transparent: ["#FFFFFF00"],
        red: ["#993333"],
        orange: ["#994600"],
        yellow: ["#997F00"],
        green: ["#147F37"],
        sky: ["#0D6E99"],
        blue: ["#164899"],
        purple: ["#4B1699"],
        gray: ["#1F2937"],
    };

    const baseColors = Object.keys(COLOR_GROUPS);
    const baseSpecialColors = Object.keys(COLOR_SPECIAL_GROUPS);

    const detectOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            setIsColorPickerOpen(false);
        }
    };

    useEffect(() => {
        if (isColorPickerOpen) {
            document.addEventListener("click", detectOutsideClick);
        }

        return () => {
            document.removeEventListener("click", detectOutsideClick);
        };
    }, [isColorPickerOpen]);

    useEffect(() => {
        if (isColorPickerOpen) {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();

                const dropdownWidth = containerRef.current.offsetWidth;
                const dropdownHeight = 200; // 예상 높이 (필요하면 동적 측정 가능)

                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // 가로 위치 계산
                if (rect.left + dropdownWidth > viewportWidth) {
                    setPositionStyle({ right: 0 });
                } else {
                    setPositionStyle({ left: 0 });
                }

                // 세로 위치 계산
                if (rect.bottom + dropdownHeight > viewportHeight) {
                    setPositionStyle({ bottom: rect.height + 4 });
                } else {
                    setPositionStyle({ top: rect.height + 4 });
                }
            }

            document.addEventListener("click", detectOutsideClick);
        }
        return () => {
            document.removeEventListener("click", detectOutsideClick);
        };
    }, [isColorPickerOpen]);

    return (
        <section
            className="relative"
            ref={containerRef}
        >
            {/* 상위 색상 선택 */}
            <section className="flex items-center justify-center h-full">
                <button
                    className="w-[2rem] h-[2rem] border border-[var(--color-gray-200)] rounded-full"
                    type="button"
                    style={{
                        backgroundColor: selectedColor !== "" ? selectedColor : defaultValue ? defaultValue : "black",
                    }}
                    onClick={() => {
                        setIsColorPickerOpen(!isColorPickerOpen);
                    }}
                />
                {/* <input
                    type="text"
                    onChange={(e) => {
                        const VALUE = e.target.value ?? "#ffffff";
                        setSelectedColor( VALUE );
                        onChange({
                            target: field.id,       // "info.style.align"
                            value: VALUE    // "left"
                        });
                    }}
                    value={ value || "#ffffff"}
                />
                <section>
                    <input type="text" defaultValue={ 100 } />
                    <p>%</p>
                </section> */}
            </section>

            {/* 세부 색상 선택 */}
            {isColorPickerOpen && (
                <section
                    className={`absolute z-[100] flex flex-col cursor-pointer whitespace-nowrap rounded-2xl p-[0.4rem] bg-[var(--color-surface)] shadow-[var(--shadow-normal)]`}
                    // className={`absolute left-0 z-[100] top-[calc(3.8rem+0.8rem)] backdrop-blur-[20px] bg-white shadow-[var(--shadow-popup)] rounded-[1.6rem] flex flex-col overflow-hidden detect`}
                    style={{
                        ...positionStyle,
                    }}
                >
                    <div className="flex items-center justify-between p-[0.8rem]">
                        <section className="title">
                            <h6>colors</h6>
                        </section>

                        <section className="function">
                            <section className="backdrop-blur-[20px] bg-gray-100 rounded-[0.8rem] gap-[0.4rem] p-[0.4rem] flex">
                                <button
                                    className={`text-[#9198a0] rounded-[0.4rem] p-[0.4rem] text-[1.2rem] font-semibold transition-colors duration-250 ease-[cubic-bezier(.075,.82,.165,1)] ${colorMode === 0 ? "text-gray-700 bg-[var(--color-surface)] shadow-[var(--shadow-normal)]" : ""} detect`}
                                    onClick={() => setColorMode(0)}
                                >
                                    일반
                                </button>
                                <button
                                    className={`text-[#9198a0] rounded-[0.4rem] p-[0.4rem] text-[1.2rem] font-semibold transition-colors duration-250 ease-[cubic-bezier(.075,.82,.165,1)] ${colorMode === 1 ? "text-gray-700 bg-[var(--color-surface)] shadow-[var(--shadow-normal)]" : ""} detect`}
                                    onClick={() => setColorMode(1)}
                                >
                                    특별
                                </button>
                            </section>
                        </section>
                    </div>

                    {/* <div className="p-[0.4rem] rounded-[1.2rem] h-[3.8rem] gap-[0.8rem] flex justify-between items-center bg-[#ffffff8a]">
                        <input
                            type="text"
                            className="detect bg-transparent rounded-[0.8rem] text-gray-500 p-0 h-auto transition-[background] duration-500 ease-[cubic-bezier(0.075,0.82,0.9,1)] bg-white"
                            onChange={(e) => {
                                const VALUE = e.target.value ?? "#ffffff";
                                setSelectedColor( VALUE );
                                onChange({
                                    target: field.id,       // "info.style.align"
                                    value: VALUE    // "left"
                                });
                            }}
                            value={value || "#ffffff"}
                        />

                        <div>
                            <input type="text" defaultValue={ 100} className="detect" />
                            <p>%</p>
                        </div>
                    </div> */}

                    <div>
                        {(colorMode === 0 ? baseColors : baseSpecialColors).map((colorKey, i) => (
                            <section
                                key={i}
                                className="flex-1"
                            >
                                {(colorMode === 0 ? COLOR_GROUPS : COLOR_SPECIAL_GROUPS)[colorKey].map((shade, i) => (
                                    <button
                                        key={i}
                                        className={`detect h-[1.2rem] w-[1.2rem]`}
                                        style={{
                                            backgroundColor: shade,
                                        }}
                                        onClick={() => {
                                            setSelectedColor(shade);
                                            // setValue( shade );
                                            onChange(shade);
                                        }}
                                    />
                                ))}
                            </section>
                        ))}
                    </div>
                </section>
            )}
        </section>
    );
};

interface ErrorBoundaryWrapperProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<FallbackProps>;
    loading?: React.ReactNode;
}

const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ children, fallback: Fallback = UI.Error, loading: Loading = <UI.Loading /> }) => {
    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ErrorBoundary
                    FallbackComponent={Fallback}
                    onReset={reset}
                >
                    <Suspense fallback={Loading}>{children}</Suspense>
                </ErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    );
};

const Empty = ({ title = "결과가 없습니다", desc_no, className }: { title?: string; desc_no?: string; className?: string }) => {
    return (
        <div
            className={`col-span-3 p-[2rem] w-full flex items-center justify-center flex-col gap-[2.4rem] opacity-[0.2] ${className ? className : ""}`}
            data-description={desc_no}
        >
            <IconComponent
                type="graphic-case-empty"
                alt="없음"
                width={52}
                height={52}
            />
            <p className="text-center text-[var(--color-text-primary)] pointer-events-none">{title}</p>
        </div>
    );
};

const Loading = () => {
    return (
        <div>
            <p>Loading...</p>
        </div>
    );
};

const ErrorRetry = ({ onRetry }: { onRetry?: () => void }) => (
    <article
        role="alert"
        className="h-[100svh!important] w-[100dvw!important] flex flex-col items-center justify-center gap-[1.6rem]"
    >
        <div className="alert-inner flex flex-col gap-[1.6rem] shadow-[var(--shadow-normal)] rounded-[1.6rem] bg-[var(--color-surface)] p-[0.4rem]">
            <section className="flex flex-col gap-[1.6rem] px-[1.6rem] py-[0.8rem]">
                <p>에러 발생!</p>
            </section>

            <UI.Button
                onClick={onRetry}
                className="p-[1.6rem] shadow-[var(--shadow-normal)] bg-[var(--color-orange-500)] rounded-[1.2rem]"
            >
                다시 시도
            </UI.Button>
        </div>
    </article>
);

const Error = ({ error, resetErrorBoundary }: FallbackProps) => {
    const message = getErrorMessage(error) ?? "알 수 없는 오류가 발생했습니다.";

    return (
        <article
            role="alert"
            className="h-[100svh!important] w-[100dvw!important] flex flex-col items-center justify-center gap-[1.6rem]"
        >
            <div className="alert-inner flex flex-col gap-[1.6rem] shadow-[var(--shadow-normal)] rounded-[1.6rem] bg-[var(--color-surface)] p-[0.4rem]">
                <section className="flex flex-col gap-[1.6rem] px-[1.6rem] py-[0.8rem]">
                    <p>에러 발생!</p>
                    <pre>{message}</pre>
                </section>

                <UI.Button
                    onClick={resetErrorBoundary}
                    className="p-[1.6rem] shadow-[var(--shadow-normal)] bg-[var(--color-orange-500)] rounded-[1.2rem]"
                >
                    다시 시도
                </UI.Button>
            </div>
        </article>
        // <article
        //     className={`${ className ? className : "" } col-span-3 w-full flex items-center justify-center h-[var(--empty-element-height)]`}
        //     data-description={ desc_no }
        // >
        //     <div className={`error-inner flex-1 h-full items-center justify-center p-[2.0rem] bg-[var(--color-gray-100)] rounded-[1.2rem] flex flex-col gap-[1.6rem]`}>
        //         <p className='whitespace-break-spaces leading-[1.5] pointer-events-none text-center text-[var(--color-gray-500)]'>{ title }</p>
        //         <UI.Button
        //             onClick={ onClick }
        //             // className='bg-[var(--color-blue-1000)] rounded-[0.8rem]'
        //             className='h-[4.2rem] rounded-[0.6rem] text-white bg-[var(--color-blue-1000)] px-[5.2rem]'
        //         >
        //             다시 시도
        //         </UI.Button>
        //     </div>
        // </article>
    );
};

const UI = {
    Select,
    Switch,
    Calendar,
    Input,
    Radio,
    MultiSelect,
    CheckBox,
    FileUpload,
    Tab,
    Button,
    TextArea,
    Pagination,
    MiniModal,
    DropDown,
    NumberInput,
    PasswordInput,
    Filter,
    ColorPicker,
    Empty,
    Error,
    ErrorRetry,
    Loading,
    ErrorBoundaryWrapper,
    Window,
    FloatingSelector,
    Table: Object.assign(Table, {
        Header: TableHeader,
        Body: TableBody,
        Row: TableRow,
        Cell: TableCell,
    }),
};

export default UI;
