import React, { Fragment } from "react";

const Grid = () => {
    return (
        <Fragment>
            <Plus direction="top left" />
            <Plus direction="top right" />
            <Plus direction="bottom left" />
            <Plus direction="bottom right" />
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
            <div className="w-full h-[0.1rem] bg-[#cccccc50]" />
            <div className="w-[0.1rem] h-full bg-[#cccccc50]" />
        </div>
    );
};

const Plus = ({ direction }: { direction: "top left" | "top right" | "bottom left" | "bottom right" }) => {
    const getDegree = () => {
        switch (direction) {
            case "top left":
                return "top-[24px] left-[24px]";

            case "top right":
                return "top-[24px] right-[24px]";

            case "bottom left":
                return "bottom-[24px] left-[24px]";

            case "bottom right":
                return "bottom-[24px] right-[24px]";
        }
    };
    return (
        <div
            data-page-transition-fixed="grid"
            className={`${getDegree()} w-[1.6rem] h-[1.6rem] bg-red fixed`}
        >
            <div className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] w-full h-[0.1rem] bg-[#cccccc80]" />
            <div className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] w-[0.1rem] h-full bg-[#cccccc80]" />
        </div>
    );
};

export default Grid;
