"use client";

import { Fragment } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useModalStore } from "@/shared/stores/useModalStore";
import { useBottomSheetStore } from "@/shared/stores/useBottomSheetStore";

const DimmedComponent = ({ isVisible }: { isVisible: boolean }) => {
    const { modal, closeModal } = useModalStore();
    const { bottomSheet, initBottomSheet, setBottomSheet } = useBottomSheetStore();

    const closeBottomSheetState = () => {
        if (bottomSheet) {
            setBottomSheet({ ...bottomSheet, isOpen: false });

            // setPersistDetailShutdownState(true);
            // setBottomSheet(initBottomSheet);
        }
    };

    const closeModalState = () => {
        if (modal) {
            closeModal();
        }
    };

    return (
        <Fragment>
            <AnimatePresence>
                {modal.isOpen || bottomSheet.isOpen ? (
                    <motion.div
                        className={`fixed top-0 left-0 w-full h-full bg-[#000000c1] ${modal.isOpen ? "z-[1999999999]" : "z-[999]"}`}
                        exit={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        initial={{ opacity: 0 }}
                        transition={{
                            delay: 0,
                            type: "spring",
                            mass: 0.1,
                            stiffness: 100,
                            damping: 10,
                        }}
                        onClick={() => {
                            if (bottomSheet.isOpen) {
                                closeBottomSheetState();
                            }

                            if (modal.isOpen) {
                                closeModalState();
                            }
                        }}
                    />
                ) : (
                    ""
                )}
            </AnimatePresence>
        </Fragment>
    );
};

export default DimmedComponent;
