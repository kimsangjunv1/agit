import { ComponentProps } from "react";
import { FivepixelsPanel } from "@/widgets/experiment/fivepixels";
export default function FivepixelsView(props: ComponentProps<typeof FivepixelsPanel>) {
    return <FivepixelsPanel {...props} />;
}
