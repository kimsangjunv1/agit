import "server-only";

type CommentProfanityRule = {
    word: string;
    exceptions?: readonly string[];
    nicknameOnly?: boolean;
    wholeWord?: boolean;
};

// 예외는 해당 규칙에만 적용해요. 예외 단어 옆에 다른 욕설을 쓰면 차단합니다.
export const COMMENT_PROFANITY_RULES: readonly CommentProfanityRule[] = [
    { word: "시발", exceptions: ["시발점", "시발역", "시발차"] },
    { word: "씨발" },
    { word: "씨벌" },
    { word: "시벌" },
    { word: "씨팔" },
    { word: "씨빨" },
    { word: "개새끼" },
    { word: "씹새끼" },
    { word: "병신" },
    { word: "지랄" },
    { word: "좆" },
    { word: "존나" },
    // 초성은 본문에서 약어로 쓰일 수 있어 닉네임에서만 제한해요.
    { word: "ㅅㅂ", nicknameOnly: true },
    { word: "ㅆㅂ", nicknameOnly: true },
    { word: "ㅂㅅ", nicknameOnly: true },
    { word: "fuck", wholeWord: true },
    { word: "shit", wholeWord: true },
    { word: "bitch", wholeWord: true },
    { word: "asshole", wholeWord: true },
];

// 실제 관리자는 서버에서 인증한 경우에만 이 이름들을 사용할 수 있어요.
export const COMMENT_RESERVED_NICKNAMES = ["관리자", "운영자", "운영진", "관리팀", "운영팀", "공식계정", "아지트공식", "admin", "administrator", "moderator"] as const;
