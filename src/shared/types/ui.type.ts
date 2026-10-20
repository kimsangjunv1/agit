import { ChangeEvent, CSSProperties, ReactNode, RefObject } from "react";

export interface CalendarModalProps {
    className?: string;
    icon?: boolean;
    defaultValue?: Date;
    desc_no?: string;
    // desc_no?: string | number;
    onClose?: (value: string) => void;
    onDateSelect?: (value: string) => void;
    limitMonths?: number; // 추가
    limitMessage?: string; // 추가
    center?: boolean;
    containerClassName?: string;
}

export interface MultiSelectProps {
    title: string;
    id: number;
    state: boolean;
    desc_no?: string;
}

export interface FileUploadProps {
    placeholder?: string;
    buttonText?: string;
    onChange?: (file: File) => void;
    desc_no?: string;
}

export interface TabComponentProps {
    className?: {
        container?: string;
        button?: string;
        active?: string;
        normal?: string;
    };
    list: {
        title: string;
        value: number;
        route?: string;
    }[];
    type?: "button" | "link";
    preventMsg?: string;
    preventTargetIdx?: number;
    defaultSelect?: number;
    onClick: (e: number) => void;
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

export interface PaginationProps {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    desc_no?: string;
}

export interface MultiSelectProps {
    data: MultiSelectProps[];
    onChange: (e: MultiSelectProps[]) => void;
    desc_no?: string;
}

export interface DropDownProps {
    list: {
        title: string;
        value: number | string;
        isDefault?: boolean;
        className?: string;
        element?: ReactNode;
        onClick?: () => void;
    }[];
    message?: string;
    prevent?: boolean;
    className?: {
        container?: string;
        inner?: string;
        button?: string;
    };
    height?: string;
    width?: string;
    onClick?: (value: number | string) => void;
    children: ReactNode;
    desc_no?: string;
}

export interface SelectProps {
    list: {
        title: string;
        value: any;
    }[];
    trackingData?: any;
    defaultValue?: any;
    // onConfirm: (e: any) => void;
    // onCancel: (e: any) => void;
    onChange: (e: any) => void;
    className?: {
        container?: string;
        button?: string;
    };
    desc_no?: string;
}

export interface FilterProps {
    list: {
        title: string;
        state: boolean;
        value?: any;
    }[];
    elementRef?: RefObject<HTMLElement | null>;
    style?: CSSProperties;
    defaultValue?: any;
    onConfirm: (e: { title: string; state: boolean; value?: any }[]) => void;
    onCancel: (e: { title: string; state: boolean; value?: any }[]) => void;
    onChange: (e: { title: string; state: boolean; value?: any }[]) => void;
    className?: {
        container?: string;
        button?: string;
    };
    desc_no?: string;
}

export interface MiniModalProps {
    element: {
        header?: ReactNode;
        body?: ReactNode;
        footer?: ReactNode;
    };
    onConfirm: (e: any) => void;
    onCancel: (e: any) => void;
    onChange: (e: any) => void;
    className?: {
        container?: string;
        button?: string;
    };
    defaultValue?: any;
    desc_no?: string;
}

export interface InputProps {
    defaultValue?: string | number;
    icon?: boolean;
    type?: string;
    placeholder?: string;
    guide?: string;
    // emptyValue?: string | number;
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

export interface PasswordInputProps {
    disabled?: boolean;
    name?: string;
    desc_no?: string | number;
    defaultValue?: string;
    placeholder?: string;
    guide?: string;
    className?: {
        container?: string;
        input?: string;
        toggle?: string;
    };
    autoComplete?: "on" | "off";
    digit?: number; // 최대 입력 자리수
    showToggle?: boolean; // 비밀번호 보기 버튼
    onChange?: (e: { target: { value: string } }) => void;
    onInput?: (e: any) => void;
    onBlur?: (e: any) => void;
}

export interface SwitchProps {
    states: boolean;
    onChange: (e: boolean) => void;
    desc_no?: string;
}

export interface NumberInputProps extends Omit<InputProps, "type" | "className"> {
    defaultValue?: number;
    max?: number;
    type?: string;
    allowedChars?: string[]; // ["-","+","@"] 이런식으로 배열 전달
    comma?: boolean;
    className?: {
        container?: string;
        input?: string;
    };
}

export interface TextAreaProps {
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    maxLength?: number;
    placeholder?: string;
    defaultValue?: string;
    className?: {
        container?: string;
        textarea?: string;
    };
    desc_no?: string;
}

export interface RadioProps {
    list?: {
        value: any;
        title: string;
    }[];
    defaultValue: any;
    className?: {
        container: string;
        button: string;
    };
    onChange: (e: number) => void;
    desc_no?: string;
}

export interface CheckBoxProps {
    defaultState?: boolean;
    className?: {
        container?: string;
        button?: string;
    };
    preventClick?: boolean;
    checked?: boolean;
    guide?: string;
    onChange: (e: any) => void;
    desc_no?: string;
}
