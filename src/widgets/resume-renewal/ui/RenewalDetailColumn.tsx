"use client";

import Scrollbar from "@/shared/ui/common/Scrollbar";

import { useResumeRenewalProvider } from "../model/ResumeRenewalContext";
import { ColumnIslandStack } from "./ColumnIslandStack";
import FirstSectionMascot from "./FirstSectionMascot";
import RenewalCarouselItem from "./RenewalCarouselItem";
import RenewalSectionItem from "./RenewalSectionItem";
import ScrollProgressIsland from "./ScrollProgressIsland";

const RenewalDetailColumn = () => {
    const { detailContainerRef, firstSectionRef, isFirstSectionVisible } = useResumeRenewalProvider();

    return (
        <div className="relative min-h-0 min-w-0">
            <Scrollbar
                direction="vertical"
                aria-label="상세 세로 스크롤"
                viewportRef={detailContainerRef}
                className="h-[100svh] w-full border-r border-r-[#ffffff20]"
                autoHide
            >
                <RenewalSectionItem
                    isFirstSection
                    sectionRef={firstSectionRef}
                    title="'안녕하세요'"
                    text="안녕하세요 불가합니다."
                    // text="개요 오리온캑터스는 디자인을 바탕으로 기획과 개발을 함께하는 스튜디오입니다. 웹과 앱, 폰트와 브랜드 등에서 문제에 맞는 형태를 찾고, 잘 쓰이고 또 마음이 가는 경험을 설계합니다.
                    // 쌓아온 지식과 자원을 슬기롭게 활용해, 함께 만든 결과를 계속 쓰고 발전시킬 수 있도록 필요한 자산과 방법을 나눕니다. design@orioncactus.com"
                    className={{
                        container: "relative h-[100dvh] flex justify-center overflow-hidden",
                    }}
                    backdrop={<FirstSectionMascot isSectionVisible={isFirstSectionVisible} />}
                />

                <RenewalSectionItem
                    title="개요"
                    text="개요 오리온캑터스는 디자인을 바탕으로 기획과 개발을 함께하는 스튜디오입니다. 웹과 앱, 폰트와 브랜드 등에서 문제에 맞는 형태를 찾고, 잘 쓰이고 또 마음이 가는 경험을 설계합니다.
            쌓아온 지식과 자원을 슬기롭게 활용해, 함께 만든 결과를 계속 쓰고 발전시킬 수 있도록 필요한 자산과 방법을 나눕니다. design@orioncactus.com"
                />
                <RenewalSectionItem
                    title="함께 만들 수 있는 것"
                    element={
                        <section className="flex flex-col gap-[1.6rem]">
                            <RenewalCarouselItem
                                title="앱/웹 디자인 및 개발"
                                text="asd"
                            />
                            <RenewalCarouselItem
                                title="캐릭터"
                                text="asd"
                            />
                            <RenewalCarouselItem
                                title="브랜딩"
                                text="asd"
                            />
                            <RenewalCarouselItem
                                title="프론트엔드"
                                text="asd"
                            />
                        </section>
                    }
                />
                <RenewalSectionItem
                    title="이렇게 만듭니다"
                    element={
                        <section className="flex flex-col gap-[1.6rem]">
                            <RenewalCarouselItem
                                title="필요한 것부터 함께 찾습니다"
                                text="asd"
                            />
                            <RenewalCarouselItem
                                title="쓰일 환경에서 확인하며 만듭니다"
                                text="asd"
                            />
                            <RenewalCarouselItem
                                title="마음이 가는 이유까지 챙깁니다"
                                text="asd"
                            />
                            <RenewalCarouselItem
                                title="다음 작업으로 이어갈 수 있게 합니다"
                                text="asd"
                            />
                        </section>
                    }
                />
                <RenewalSectionItem
                    title="경험 분야"
                    element={
                        <section>
                            <RenewalCarouselItem
                                title="함께 만들 수 있는 것"
                                text="asd"
                            />
                        </section>
                    }
                />
                <RenewalSectionItem
                    title="작업"
                    element={
                        <div>
                            <section>asd</section>
                            <section>asd</section>
                        </div>
                    }
                />
            </Scrollbar>
            <ColumnIslandStack>
                <ScrollProgressIsland
                    viewportRef={detailContainerRef}
                    label="상세"
                    ariaLabel="상세 스크롤 진행"
                />
            </ColumnIslandStack>
        </div>
    );
};

export default RenewalDetailColumn;
