"use client";

import { AnimatePresence, motion } from "motion/react";
import React, { forwardRef, Suspense, useEffect, useImperativeHandle, useRef, useState } from "react";

import { ButtonProps, CalendarModalProps, FileUploadProps, InputProps, SelectProps, SwitchProps } from "@/shared/types/ui.type";
import IconComponent from "@/shared/ui/common/IconComponent";
import FloatingSelector from "@/shared/ui/common/FloatingSelector";
import Window from "@/shared/ui/common/Window";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, type FallbackProps, getErrorMessage } from "react-error-boundary";

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

const Select = ({ list = [], trackingData, defaultValue, className, desc_no, onChange }: SelectProps) => {
    const containerRef = useRef<HTMLElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const [showMenu, setShowMenu] = useState(false);
    const [currentValue, setCurrentValue] = useState();
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
                                        e.value === currentValue ? "bg-[var(--color-surface)] shadow-[var(--shadow-normal)]" : "bg-transparent"
                                    }`}
                                    onClick={() => {
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

const Calendar = ({
    className = "bg-[var(--color-gray-100)] text-[var(--color-gray-1000)] rounded-[0.8rem] px-[1.2rem] h-[4.4rem]",
    containerClassName,
    icon = false,
    desc_no,
    defaultValue = new Date(),
    onDateSelect,
    limitMonths = 12,
    ruleDate, // "YYYY-MM-DD" string
    center = false,
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
        const SELECTED_DATE = isEnd ? new Date(year, month, day, 23, 59, 59) : new Date(year, month, day, 12);

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

    return (
        <section
            ref={containerRef}
            className={`relative calendar ${containerClassName ? containerClassName : ""}`}
        >
            <UI.Button
                ref={calendarRef}
                onClick={() => setModalOpen(!modalOpen)}
                className={`${className} ${icon ? "flex gap-[2.8rem] items-center justify-between" : ""} hover:bg-[var(--color-gray-200)] transition-colors`}
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
    );
};

const UI = {
    Select,
    Switch,
    Calendar,
    Input,
    FileUpload,
    Button,
    Empty,
    Error,
    Loading,
    ErrorBoundaryWrapper,
    Window,
    FloatingSelector,
};

export default UI;
