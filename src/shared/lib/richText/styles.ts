export const POST_BLOCK_CONTENT_CLASS = "flex flex-col gap-[2.4rem]";
export const BLOCK_MIN_HEIGHT_CLASS = "min-h-[18rem]";
export const BLOCK_ROW_CLASS = "flex flex-col tablet:flex-row tablet:flex-wrap gap-[0.4rem] w-full min-w-0";
export const BLOCK_COLUMN_CLASS = `w-full min-w-0 tablet:flex-1 tablet:min-w-[calc((var(--size-tablet)-(1.6rem*10))/2)] min-h-[25.6rem] border border-[#00000020] focus:border-[#000000] hover:bg-[#00000020] ${POST_BLOCK_CONTENT_CLASS}`;
export const CODE_BLOCK_COLUMN_CLASS = "w-full min-w-0 tablet:flex-1 tablet:min-w-[calc((var(--size-tablet)-(1.6rem*10))/2)] bg-[#ffffff] rounded-[2.4rem] flex flex-col gap-[2.4rem]";
// "w-full min-w-0 tablet:flex-1 tablet:min-w-[calc((var(--size-tablet)-(1.6rem*10))/2)] p-[1.6rem] bg-[#ffffff] rounded-[2.4rem] flex flex-col gap-[2.4rem]";
export const BLOCK_DETAIL_COLUMN_CLASS = "w-full min-w-0 tablet:min-w-[calc((var(--size-tablet)-(1.6rem*10))/2)] p-[1.6rem] bg-[#ffffff] rounded-[2.4rem]";
// "w-full min-w-0 tablet:flex-1 tablet:min-w-[calc((var(--size-tablet)-(1.6rem*10))/2)] p-[1.6rem] bg-[#f4f4f4] rounded-[2.4rem]";
export const BLOCK_MENU_PANEL_CLASS = "rounded-[1.2rem] border border-white/10 bg-[rgba(0,0,0,0.72)] p-[0.4rem] shadow-[var(--shadow-normal)] backdrop-blur-md";
export const BLOCK_MENU_ITEM_CLASS =
    "flex w-full items-center gap-[0.8rem] rounded-[1.2rem] px-[1.2rem] py-[1.2rem] text-left text-[1.6rem] font-[500] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40";

export const TIPTAP_PROSE_CLASS = "text-[2rem] leading-[1.5]";
export const POST_TIPTAP_CONTENT_CLASS = `post-tiptap-content w-full ${TIPTAP_PROSE_CLASS}`;
export const RICH_TEXT_PARAGRAPH_CLASS = "break-words !text-[length:calc(2rem*var(--post-read-scale,1))] !leading-[var(--post-read-line-height,1.5)] mb-[0.8rem] min-h-[3.2rem] last:mb-0";
export const RICH_TEXT_SPAN_CLASS = "!text-[inherit] !leading-[inherit]";
export const RICH_TEXT_IMAGE_CLASS = "my-[1.6rem] block h-auto max-w-full data-[align=center]:mx-auto data-[align=right]:ml-auto data-[align=right]:mr-0";
export const RICH_TEXT_BLOCKQUOTE_CLASS = "border-l-[0.4rem] border-[var(--color-gray-300)] pl-[1.2rem] text-[var(--color-gray-600)] my-[0.8rem]";
export const CODE_PRE_CLASS = "m-0 rounded-none bg-transparent p-0 font-mono text-[1.6rem] leading-[1.7] text-slate-200 overflow-x-auto whitespace-pre-wrap break-words [tab-size:4]";
// 편집기가 표시하는 코드 끝의 빈 줄을 보기 화면에서도 같은 높이로 유지해요.
export const CODE_TEXT_CLASS = "block bg-transparent font-mono whitespace-pre-wrap break-words [tab-size:4] [&:not(:has(.ProseMirror-trailingBreak))]:after:inline-block [&:not(:has(.ProseMirror-trailingBreak))]:after:content-['']";
export const POST_PAGE_CLASS = "flex flex-col w-full post";
export const POST_INNER_CLASS = "mx-auto post-inner flex flex-col w-full items-center";
export const POST_HERO_SECTION_CLASS = "flex flex-col justify-center items-center gap-[3.2rem] w-full mt-[calc(var(--header-height)+var(--nav-height)+6.4rem)] tablet:mt-[calc(var(--header-height)+25.6rem)]";
export const POST_BODY_CLASS = "post-reading-root z-[100] pt-[4.2rem] flex w-full gap-[0.4rem]";
export const POST_CONTENT_WIDTH_CLASS = "w-full min-w-0 max-w-[var(--size-tablet)] px-[2.0rem] mx-auto";
export const POST_BLOCK_LIST_CLASS = "flex flex-col mobile:gap-[5.2rem] pc:gap-[2.4rem]";
export const POST_HERO_META_CLASS = "mobile:text-[1.6rem] tablet:text-[1.4rem] text-[#00000090] leading-[1.5]";
export const POST_HERO_TITLE_CLASS = "mobile:text-[1.6rem] tablet:text-[2.0rem] text-[#000000] leading-[1.5]";
export const POST_HERO_SUMMARY_CLASS = "font-semibold mobile:text-[1.8rem] tablet:text-[2.4rem] leading-[1.5] whitespace-break-spaces";
export const POST_BLOCK_HEADING_CLASS = "flex flex-col";
export const POST_BLOCK_SUBTITLE_CLASS = "mobile:text-[1.4rem] pc:text-[1.8rem] leading-[1.5] font-semibold";
export const POST_BLOCK_TITLE_CLASS = "mobile:text-[2.0rem] pc:text-[2.4rem] leading-[1.5] font-semibold";
export const POST_BLOCK_IMAGE_CLASS = "w-full rounded-[2.4rem] shadow-[var(--shadow-normal)]";
export const POST_CODE_BODY_CLASS = "p-0 px-[1.6rem] py-[1.6rem]";
export const POST_SNIPPET_BODY_CLASS = "py-[0.8rem]";
