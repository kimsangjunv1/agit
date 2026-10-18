import { useToastStore } from "@/shared/stores/useToastStore";

type ToastMessage<TData, TVariables> = string | ((data: TData, variables: TVariables) => string | undefined);

export const useMutationToastHandlers = <TData, TVariables>(successMessage: ToastMessage<TData, TVariables>, errorMessage = "에러 발생") => {
    const { setToast } = useToastStore();

    return {
        onSuccess: (data: TData, variables: TVariables) => {
            const msg = typeof successMessage === "function" ? successMessage(data, variables) : successMessage;

            if (msg) {
                setToast({ msg, time: 2 });
            }
        },
        onError: (err: Error) => {
            setToast({ msg: err.message ?? errorMessage, time: 2 });
        },
    };
};
