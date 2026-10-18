type MaterialIconProps = {
    name: string;
    className?: string;
    size?: number;
};

export function MaterialIcon({ name, className = "", size = 20 }: MaterialIconProps) {
    return (
        <span
            aria-hidden
            className={`inline-flex items-center justify-center whitespace-nowrap not-italic font-normal leading-none normal-case tracking-normal antialiased [font-family:Material_Symbols_Outlined] [font-variation-settings:'FILL'_0,'wght'_400,'GRAD'_0,'opsz'_24] ${className}`}
            style={{ fontSize: `${size}px` }}
        >
            {name}
        </span>
    );
}
