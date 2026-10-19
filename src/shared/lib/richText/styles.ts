export const BLOCK_MIN_HEIGHT_CLASS = "min-h-[18rem]";
export const BLOCK_ROW_CLASS = "flex flex-col tablet:flex-row tablet:flex-wrap gap-[0.4rem] w-full min-w-0";
export const BLOCK_COLUMN_CLASS = "w-full min-w-0 tablet:flex-1 tablet:min-w-[calc((var(--size-tablet)-(1.6rem*10))/2)] p-[1.6rem] rounded-[2.4rem] flex flex-col gap-[2.4rem]";
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
export const CODE_TEXT_CLASS = "block bg-transparent font-mono whitespace-pre-wrap break-words [tab-size:4]";
