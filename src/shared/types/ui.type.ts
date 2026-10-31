import { ReactNode } from "react";

export interface CalendarModalProps {
    className?: string;
    icon?: boolean;
    defaultValue?: Date;
    desc_no?: string;
    onClose?: (value: string) => void;
    onDateSelect?: (value: string) => void;
    limitMonths?: number; // 추가
    limitMessage?: string; // 추가
    center?: boolean;
    containerClassName?: string;
}

export interface FileUploadProps {
    placeholder?: string;
    buttonText?: string;
    onChange?: (file: File) => void;
    desc_no?: string;
}

export interface ButtonProps {
    "aria-pressed"?: boolean;
    children: ReactNode | string;
    className?: string;
    type?: "button" | "reset" | "submit";
    disabled?: boolean;
    ref?: any;
    test?: string;
    onClick?: (e: any) => void;
    onPointerDown?: (e: any) => void;
    desc_no?: string;
    rippleColor?: string;
}

export interface SelectProps {
    list: {
        title: string;
        value: any;
    }[];
    trackingData?: any;
    defaultValue?: any;
    onChange: (e: any) => void;
    className?: {
        container?: string;
        button?: string;
    };
    desc_no?: string;
}

export interface InputProps {
    defaultValue?: string | number;
    icon?: boolean;
    type?: string;
    placeholder?: string;
    guide?: string;
    className?: {
        container?: string;
        input?: string;
    };
    name?: string;
    disabled?: boolean;
    desc_no?: string;
    autoComplete?: "on" | "off";
    onInput?: (e: any) => void;
    onChange: (e: any) => void;
    onBlur?: (e: any) => void;
}

export interface SwitchProps {
    states: boolean;
    onChange: (e: boolean) => void;
    desc_no?: string;
}
