import { afterEach, describe, expect, it, vi } from "vitest";

import { COMMENT_NICKNAMES } from "@/entities/comment/config/commentNicknames";
import { COMMENT_AUTHOR_MAX_LENGTH } from "@/entities/comment/model/comment.constants";
import { getCommentAuthorLength, getRandomCommentNickname, limitCommentAuthor } from "./commentNickname";
import { validateCommentContent } from "./validateCommentContent";

vi.mock("server-only", () => ({}));

const validate = (author: string, msg = "잘 읽었어요.", isAdmin = false) => validateCommentContent({ author, msg, isAdmin });

afterEach(() => vi.restoreAllMocks());

describe("랜덤 닉네임", () => {
    it("중복 없는 이름 100개를 유지하고 모든 이름이 등록 정책을 통과한다", () => {
        expect(COMMENT_NICKNAMES).toHaveLength(100);
        expect(new Set(COMMENT_NICKNAMES).size).toBe(100);

        for (const name of COMMENT_NICKNAMES) {
            expect(getCommentAuthorLength(name)).toBeGreaterThanOrEqual(2);
            expect(getCommentAuthorLength(name)).toBeLessThanOrEqual(COMMENT_AUTHOR_MAX_LENGTH);
            expect(validate(name)).toBeNull();
        }
    });

    it("어떤 현재 이름에서도 다른 이름을 선택한다", () => {
        const random = vi.spyOn(Math, "random");
        for (const current of COMMENT_NICKNAMES) {
            for (const value of [0, 0.5, 1 - Number.EPSILON]) {
                random.mockReturnValue(value);
                const next = getRandomCommentNickname(` ${current.normalize("NFD")} `);
                expect(COMMENT_NICKNAMES).toContain(next);
                expect(next).not.toBe(current);
            }
        }
    });
});

describe("닉네임 글자 수", () => {
    it("한글 조합형과 완성형을 같은 글자 수로 계산한다", () => {
        expect(getCommentAuthorLength("아지트")).toBe(3);
        expect(getCommentAuthorLength("아지트".normalize("NFD"))).toBe(3);
    });

    it("이모지를 보이는 글자 수로 세고 중간에서 자르지 않는다", () => {
        const emoji = "👨‍👩‍👧‍👦";
        expect(getCommentAuthorLength(emoji.repeat(10))).toBe(10);
        expect(limitCommentAuthor(emoji.repeat(11))).toBe(emoji.repeat(10));
        expect(validate(emoji.repeat(10))).toBeNull();
    });

    it("붙여넣은 긴 이름도 10글자까지만 유지한다", () => {
        expect(limitCommentAuthor("가나다라마바사아자차카타")).toBe("가나다라마바사아자차");
    });
});

describe("금칙어와 예외", () => {
    it.each(["씨발", "시 발", "씨!발", "씨\u200b발", "ㅆ ㅣ ㅂ ㅏ ㄹ", "씨발".normalize("NFD"), "FUCK", "f.u.c.k", "ｆｕｃｋ"])("우회 표현을 댓글에서 검사한다: %s", (msg) => {
        expect(validate("다락손님", msg)).not.toBeNull();
    });

    it.each(["시발점부터 살펴볼게요.", "이 열차의 시발역입니다.", "새끼 고양이 이야기예요.", "class Assignment { return 'hello'; }", "Scunthorpe의 이야기입니다.", "shitake mushroom"])(
        "정상 단어와 코드가 불필요하게 차단되지 않는다: %s",
        (msg) => {
            expect(validate("다락손님", msg)).toBeNull();
        },
    );

    it.each(["시발점 그리고 시발", "시발점 씨발", "시발역 병신"])("예외 단어를 섞어도 다른 욕설까지 허용하지 않는다: %s", (msg) => {
        expect(validate("다락손님", msg)).not.toBeNull();
    });

    it("초성 규칙은 설정된 대상에만 적용한다", () => {
        expect(validate("ㅅㅂ")).not.toBeNull();
        expect(validate("다락손님", "ㅅㅂ 설정을 정리했어요.")).toBeNull();
    });

    it("실제 관리자에게도 욕설 검사를 적용한다", () => {
        expect(validate("관리자", "씨발", true)).not.toBeNull();
    });
});

describe("운영진 사칭과 숨김 문자", () => {
    it.each(["관리자", "운 영 자", "운영진친구", "ADMIN", "ＡＤＭＩＮ", "관리\u200d자"])("비회원의 사칭 닉네임을 제한한다: %s", (author) => {
        expect(validate(author)).not.toBeNull();
    });

    it("서버에서 인증된 관리자는 운영진 이름을 사용할 수 있다", () => {
        expect(validate("관리자", "안내드립니다.", true)).toBeNull();
    });

    it.each(["\u200b", "\u3164", "다락\n손님", "다락\u202e손님"])("보이지 않거나 줄바꿈을 포함한 이름을 거부한다: %s", (author) => {
        expect(validate(author)).not.toBeNull();
    });

    it.each(["\u200b", "\u3164", "내용\u0000"])("보이지 않는 댓글과 저장할 수 없는 제어 문자를 거부한다: %s", (msg) => {
        expect(validate("다락손님", msg)).not.toBeNull();
    });
});
