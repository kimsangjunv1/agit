export const capturePageTransitionSnapshot = () => {
    const content = document.querySelector<HTMLElement>("main:not([data-page-transition-copy])");
    if (!content) return null;

    const bounds = content.getBoundingClientRect();
    const copy = content.cloneNode(true) as HTMLElement;
    const sourceElements = [content, ...content.querySelectorAll<HTMLElement>("*")];
    const copyElements = [copy, ...copy.querySelectorAll<HTMLElement>("*")];
    const scrollPositions: { element: HTMLElement; top: number; left: number }[] = [];
    const stickyPositions: { element: HTMLElement; top: number; left: number }[] = [];

    sourceElements.forEach((source, index) => {
        const element = copyElements[index];
        const style = getComputedStyle(source);

        if (source instanceof HTMLElement) element.removeAttribute("id");
        element.style.transform = style.transform;
        element.style.opacity = style.opacity;
        element.style.setProperty("animation", "none", "important");
        element.style.setProperty("transition", "none", "important");

        if (style.position === "sticky") {
            const rect = source.getBoundingClientRect();
            element.style.position = "relative";
            element.style.inset = "auto";
            stickyPositions.push({ element, top: rect.top, left: rect.left });
        }

        if (source.scrollTop || source.scrollLeft) {
            scrollPositions.push({ element, top: source.scrollTop, left: source.scrollLeft });
        }

        if (source instanceof HTMLInputElement && element instanceof HTMLInputElement) {
            if (source.type !== "file") element.value = source.value;
            element.checked = source.checked;
        } else if (source instanceof HTMLTextAreaElement && element instanceof HTMLTextAreaElement) {
            element.value = source.value;
        } else if (source instanceof HTMLSelectElement && element instanceof HTMLSelectElement) {
            element.selectedIndex = source.selectedIndex;
        } else if (source instanceof HTMLImageElement && element instanceof HTMLImageElement) {
            element.loading = "eager";
        } else if (source instanceof HTMLCanvasElement && element instanceof HTMLCanvasElement && source.width > 0 && source.height > 0) {
            element.getContext("2d")?.drawImage(source, 0, 0);
        } else if (source instanceof HTMLVideoElement && source.readyState >= 2) {
            const frame = document.createElement("canvas");
            frame.width = source.videoWidth;
            frame.height = source.videoHeight;
            frame.className = source.className;
            frame.style.cssText = element.style.cssText;
            frame.getContext("2d")?.drawImage(source, 0, 0);
            element.replaceWith(frame);
        }
    });

    copy.querySelectorAll("script").forEach((script) => script.remove());
    copy.dataset.pageTransitionCopy = "";
    Object.assign(copy.style, {
        position: "absolute",
        top: `${bounds.top}px`,
        left: `${bounds.left}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        margin: "0",
    });

    const snapshot = document.createElement("div");
    snapshot.dataset.pageTransitionSnapshot = "";
    snapshot.setAttribute("aria-hidden", "true");
    snapshot.inert = true;
    Object.assign(snapshot.style, {
        position: "fixed",
        inset: "0",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: "999",
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        transform: "translateZ(0)",
    });
    snapshot.append(copy);
    document.body.append(snapshot);

    scrollPositions.forEach(({ element, top, left }) => {
        element.scrollTop = top;
        element.scrollLeft = left;
    });
    stickyPositions.forEach(({ element, top, left }) => {
        const rect = element.getBoundingClientRect();
        element.style.top = `${top - rect.top}px`;
        element.style.left = `${left - rect.left}px`;
    });

    return snapshot;
};
