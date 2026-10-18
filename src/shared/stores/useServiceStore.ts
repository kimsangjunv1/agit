import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ServiceStoreType {
    persistAdminState: boolean;
    persistStoreIdx: number;
    persistStoreName: string;

    setPersistStoreIdx: (args: number) => void;
    setPersistStoreName: (args: string) => void;
    setPersistAdminState: (args: boolean) => void;
    reset: () => void;
}

export const useServiceStore = create<ServiceStoreType>()(
    persist(
        (set) => ({
            persistStoreIdx: 0,
            persistStoreName: "",
            persistAdminState: false,

            setPersistStoreIdx: (args: number) => set(() => ({ persistStoreIdx: args })),
            setPersistStoreName: (args: string) => set(() => ({ persistStoreName: args })),
            setPersistAdminState: (args: boolean) => set(() => ({ persistAdminState: args })),

            reset: () =>
                set(() => ({
                    persistStoreIdx: 0,
                    persistStoreName: "",
                    persistAdminState: false,
                })),
        }),
        {
            name: "service-session",
            storage: createJSONStorage(() => sessionStorage),
            version: 1.0,
        },
    ),
);
