export const clampPageScroll = () => {
    const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    if (window.scrollY > maxScrollTop) {
        window.scrollTo({ top: maxScrollTop });
    }
};
