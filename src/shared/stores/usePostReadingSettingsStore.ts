import { create } from "zustand";

const STORAGE_KEY = "post-reading-settings";

type PostReadingSettings = {
    fontScale: number;
    lineHeight: number;
};

type PostReadingSettingsStore = PostReadingSettings & {
    hydrate: () => void;
    setFontScale: (fontScale: number) => void;
    setLineHeight: (lineHeight: number) => void;
    reset: () => void;
};

const DEFAULT_SETTINGS: PostReadingSettings = {
    fontScale: 1,
    lineHeight: 1.5,
};

const persistSettings = (settings: PostReadingSettings) => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const readStoredSettings = (): PostReadingSettings => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        if (!raw) return DEFAULT_SETTINGS;

        const parsed = JSON.parse(raw) as Partial<PostReadingSettings>;

        return {
            fontScale: typeof parsed.fontScale === "number" ? parsed.fontScale : DEFAULT_SETTINGS.fontScale,
            lineHeight: parsed.lineHeight === 1.6
                ? DEFAULT_SETTINGS.lineHeight
                : typeof parsed.lineHeight === "number" ? parsed.lineHeight : DEFAULT_SETTINGS.lineHeight,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
};

export const usePostReadingSettingsStore = create<PostReadingSettingsStore>((set, get) => ({
    ...DEFAULT_SETTINGS,

    hydrate: () => {
        set(readStoredSettings());
    },

    setFontScale: (fontScale) => {
        const next = { ...get(), fontScale };
        persistSettings({ fontScale: next.fontScale, lineHeight: next.lineHeight });
        set({ fontScale });
    },

    setLineHeight: (lineHeight) => {
        const next = { ...get(), lineHeight };
        persistSettings({ fontScale: next.fontScale, lineHeight: next.lineHeight });
        set({ lineHeight });
    },

    reset: () => {
        persistSettings(DEFAULT_SETTINGS);
        set(DEFAULT_SETTINGS);
    },
}));
