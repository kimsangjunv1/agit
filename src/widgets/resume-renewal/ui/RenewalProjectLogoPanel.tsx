import Image from "next/image";

const DEFAULT_PROJECT_LOGO = "/images/icon/graphic/ico-graphic-logo-horizontal.svg";

type RenewalProjectLogoPanelProps = {
    alt: string;
    logo?: string;
};

const RenewalProjectLogoPanel = ({ alt, logo = DEFAULT_PROJECT_LOGO }: RenewalProjectLogoPanelProps) => {
    return (
        <div className="flex h-[12.8rem] w-[12.8rem] mx-auto shrink-0 items-center justify-center">
            <Image
                src={logo}
                alt={alt}
                width={128}
                height={128}
                className="h-auto max-h-[12.8rem] w-auto max-w-[12.8rem] object-contain"
            />
        </div>
    );
};

export default RenewalProjectLogoPanel;
