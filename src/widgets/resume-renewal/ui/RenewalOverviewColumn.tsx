"use client";

import Scrollbar from "@/shared/ui/common/Scrollbar";

import { useResumeRenewalProvider } from "../model/ResumeRenewalContext";
import { ColumnIslandStack } from "./ColumnIslandStack";
import RenewalProjectItem from "./RenewalProjectItem";
import RenewalSectionItem from "./RenewalSectionItem";
import ScrollProgressIsland from "./ScrollProgressIsland";

const RenewalOverviewColumn = () => {
    const { easyContainerRef } = useResumeRenewalProvider();

    return (
        <div className="tablet:hidden pc:block relative min-h-0 min-w-0">
            <Scrollbar
                direction="vertical"
                aria-label="한눈에 보기 세로 스크롤"
                viewportRef={easyContainerRef}
                className="h-[100svh] w-full"
                autoHide
            >
                <RenewalSectionItem
                    title="프로젝트"
                    element={
                        <section className="grid grid-cols-2 gap-[5.2rem]">
                            <RenewalProjectItem
                                title="asd"
                                text="asd"
                            />
                            <RenewalProjectItem
                                title="asd"
                                text="asd"
                            />
                            <RenewalProjectItem
                                title="asd"
                                text="asd"
                            />
                            <RenewalProjectItem
                                title="asd"
                                text="asd"
                            />
                        </section>
                    }
                />

                <RenewalSectionItem
                    title="라이브러리"
                    element={
                        <section className="grid grid-cols-2 gap-[5.2rem]">
                            <RenewalProjectItem
                                title="asd"
                                text="asd"
                            />
                            <RenewalProjectItem
                                title="asd"
                                text="asd"
                            />
                        </section>
                    }
                />

                <RenewalSectionItem
                    title="서비스"
                    element={
                        <section className="grid grid-cols-2 gap-[5.2rem]">
                            <RenewalProjectItem
                                title="asd"
                                text="asd"
                            />
                            <RenewalProjectItem
                                title="asd"
                                text="asd"
                            />
                        </section>
                    }
                />
            </Scrollbar>
            <ColumnIslandStack>
                <ScrollProgressIsland
                    viewportRef={easyContainerRef}
                    label="한눈에 보기"
                    ariaLabel="한눈에 보기 스크롤 진행"
                />
            </ColumnIslandStack>
        </div>
    );
};

export default RenewalOverviewColumn;
