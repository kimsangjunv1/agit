import React, { Fragment } from "react";

const Grid = () => {
    return (
        <Fragment>
            <Ruller direction="top left" />
            <Ruller direction="top right" />
            <Ruller direction="bottom left" />
            <Ruller direction="bottom right" />
        </Fragment>
    );
};

const Ruller = ({ direction }: { direction: "top left" | "top right" | "bottom left" | "bottom right" }) => {
    const getDegree = () => {
        switch (direction) {
            case "top left":
                return "rotate-0 top-[20px] left-[20px]";

            case "top right":
                return "rotate-90 top-[20px] right-[20px]";

            case "bottom left":
                return "rotate-270 bottom-[20px] left-[20px]";

            case "bottom right":
                return "rotate-180 bottom-[20px] right-[20px]";
        }
    };
    return (
        <div
            data-page-transition-fixed="grid"
            className={`${getDegree()} w-[1.6rem] h-[1.6rem] bg-red fixed`}
        >
            <div className="w-full h-[0.1rem] bg-[#00000050]" />
            <div className="w-[0.1rem] h-full bg-[#00000050]" />
        </div>
    );
};

export default Grid;
