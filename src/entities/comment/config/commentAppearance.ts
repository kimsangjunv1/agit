export const COMMENT_PROFILES = [
    { id: 1, image: "/images/comment/profile-1.jpg", label: "응원하는 친구" },
    { id: 2, image: "/images/comment/profile-2.jpg", label: "튜브를 탄 친구" },
    { id: 3, image: "/images/comment/profile-3.jpg", label: "보드를 타는 친구" },
] as const;

export const DEFAULT_COMMENT_PROFILE = 1;
export const COMMENT_EMOJIS = [
    { id: "heart", emoji: "❤️", label: "하트" },
    { id: "double-heart", emoji: "💕", label: "더블 하트" },
    { id: "smile", emoji: "🙂", label: "웃음" },
] as const;

export const getCommentProfile = (id: number) => COMMENT_PROFILES.find((profile) => profile.id === id) ?? COMMENT_PROFILES[0];
export const getCommentEmoji = (id?: string | null) => COMMENT_EMOJIS.find((emoji) => emoji.id === id) ?? COMMENT_EMOJIS[0];
export const getRandomCommentEmojiId = () => COMMENT_EMOJIS[Math.floor(Math.random() * COMMENT_EMOJIS.length)].id;
