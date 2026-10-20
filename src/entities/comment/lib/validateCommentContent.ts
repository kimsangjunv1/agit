import { COMMENT_PROFANITY_RULES, COMMENT_RESERVED_NICKNAMES } from "@/entities/comment/config/commentModeration";

const INITIAL_CONSONANTS = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const VOWELS = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
const FINAL_CONSONANTS = "ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ";

// 원문은 보존하고 검사할 문자열만 정규화해요. 완성형과 자모 입력을 같은 기준으로 비교합니다.
const normalizeForComparison = (value: string) =>
    value
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[\u1100-\u1112\u1161-\u1175\u11a8-\u11c2]/gu, (character) => {
            const code = character.charCodeAt(0);
            if (code <= 0x1112) return INITIAL_CONSONANTS[code - 0x1100];
            if (code <= 0x1175) return VOWELS[code - 0x1161];
            return FINAL_CONSONANTS[code - 0x11a8];
        })
        .replace(/[\p{M}\u115f\u1160]/gu, "");

const compact = (value: string) => value.replace(/[\p{P}\p{S}\p{Z}\p{C}]/gu, "");
const hasVisibleContent = (value: string) => Boolean(value.replace(/[\p{Z}\p{C}\p{M}\u115f\u1160\u3164\uffa0]/gu, ""));

const containsProfanity = (value: string, target: "nickname" | "message") => {
    const normalized = normalizeForComparison(value);

    return COMMENT_PROFANITY_RULES.some((rule) => {
        if (rule.nicknameOnly && target !== "nickname") return false;

        let candidate = compact(normalized);
        for (const exception of rule.exceptions ?? []) {
            candidate = candidate.replaceAll(compact(normalizeForComparison(exception)), " ");
        }

        const word = compact(normalizeForComparison(rule.word));
        if (rule.wholeWord && target === "message") {
            const separatedLetters = Array.from(word).join("[\\p{P}\\p{S}\\p{Z}\\p{C}]*");
            return new RegExp(`(?:^|[^\\p{L}\\p{N}])${separatedLetters}(?=$|[^\\p{L}\\p{N}])`, "u").test(normalized);
        }

        return candidate.includes(word);
    });
};

export const validateCommentContent = ({ author, msg, isAdmin }: { author: string; msg: string; isAdmin: boolean }): string | null => {
    // 한 줄 닉네임에서 숨김 문자와 방향 제어 문자는 허용하지 않아요. 이모지의 ZWJ는 유지합니다.
    if (!hasVisibleContent(author) || /[\u0000-\u001f\u007f-\u009f\u200b\u200e\u200f\u2028-\u202e\u2060-\u206f\ufeff]/u.test(author)) {
        return "닉네임에는 보이는 글자를 입력해주세요. 줄바꿈과 숨김 문자는 사용할 수 없어요.";
    }

    const normalizedAuthor = compact(normalizeForComparison(author));
    if (!isAdmin && COMMENT_RESERVED_NICKNAMES.some((name) => normalizedAuthor.includes(compact(normalizeForComparison(name))))) {
        return "운영진으로 오해할 수 있는 닉네임은 사용할 수 없어요.";
    }

    if (containsProfanity(author, "nickname")) {
        return "닉네임에 사용할 수 없는 표현이 포함되어 있어요.";
    }

    if (!hasVisibleContent(msg) || msg.includes("\u0000")) {
        return "댓글에는 보이는 내용을 입력해주세요.";
    }

    if (containsProfanity(msg, "message")) {
        return "댓글에 사용할 수 없는 표현이 포함되어 있어요. 내용을 확인해주세요.";
    }

    return null;
};
