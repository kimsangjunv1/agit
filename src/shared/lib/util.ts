export const util = {
    string: {
        getCurrentDate: (target?: string, sliceYear: number = 2) => {
            const now = target ? new Date(target) : new Date();

            const year = now.getFullYear().toString().slice(-sliceYear);
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");

            return `${year}.${month}.${day}`;
        },

        getCurrentTime: (target?: string, sliceYear: number = 2) => {
            const now = target ? new Date(target) : new Date();

            const year = now.getFullYear().toString().slice(-sliceYear);
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");

            return `${year}.${month}.${day} ${hours}:${minutes}`;
        },

        getCommaOnPrice: (price: string | number) => {
            if (isNaN(Number(price))) return "0";

            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },

        getTimeAgo: (target?: string) => {
            if (!target) return "";

            const date = new Date(target);
            if (isNaN(date.getTime())) return "";

            const now = new Date();

            let years = now.getFullYear() - date.getFullYear();
            let months = now.getMonth() - date.getMonth();
            let days = now.getDate() - date.getDate();

            if (days < 0) {
                months -= 1;
                days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            }

            if (months < 0) {
                years -= 1;
                months += 12;
            }

            if (years >= 1) return `${years}년 전`;
            if (months >= 1) return `${months}달 전`;
            return `${days}일 전`;
        },

        getCurrentFullTime: (target: string) => {
            const date = new Date(target);
            const yyyy = date.getFullYear();
            const MM = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            let hour: number | string = date.getHours();
            const minute = String(date.getMinutes()).padStart(2, "0");
            const second = String(date.getSeconds()).padStart(2, "0");
            let period = "오전";
            if (hour >= 12) {
                period = "오후";
                if (hour > 12) hour -= 12;
            }
            hour = String(hour).padStart(2, "0");
            return `${yyyy}-${MM}-${dd} ${period} ${hour}:${minute}:${second}`;
        },
    },

    dom: {
        setScrollDefence: (target: boolean) => {
            const WRAPPER_ID = "__scroll-defence-wrapper__";
            const existingWrapper = document.getElementById(WRAPPER_ID);

            if (target) {
                if (existingWrapper) return;

                const wrapper = document.createElement("div");
                wrapper.id = WRAPPER_ID;
                wrapper.style.position = "fixed";
                wrapper.style.top = "0";
                wrapper.style.left = "0";
                wrapper.style.width = "100%";
                wrapper.style.height = "100%";
                wrapper.style.overflow = "hidden";
                wrapper.style.zIndex = "9999";
                wrapper.style.pointerEvents = "none";
                document.body.appendChild(wrapper);
                document.body.style.overflow = "hidden";
            } else {
                if (existingWrapper) {
                    existingWrapper.remove();
                    document.body.style.overflow = "";
                }
            }
        },

        setCopyOnClipboard: async (text: string) => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                textarea.style.left = "-10000px";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
        },
    },
};
