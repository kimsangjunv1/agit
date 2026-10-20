import { COMMENT_NICKNAMES } from "@/entities/comment/config/commentNicknames";
import { COMMENT_AUTHOR_MAX_LENGTH } from "@/entities/comment/model/comment.constants";

const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });

export const getCommentAuthorLength = (value: string) => Array.from(segmenter.segment(value)).length;

export const limitCommentAuthor = (value: string) =>
    Array.from(segmenter.segment(value))
        .slice(0, COMMENT_AUTHOR_MAX_LENGTH)
        .map(({ segment }) => segment)
        .join("");

export const getRandomCommentNickname = (current = "") => {
    const candidates = COMMENT_NICKNAMES.filter((name) => name !== current.normalize("NFC").trim());
    return candidates[Math.floor(Math.random() * candidates.length)];
};
