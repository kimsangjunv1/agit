export const configAnimation = {
    // 효과 : 페이드 인 아웃
    fadeInOut: {
        scale: {
            init: {
                opacity: 0,
                scale: 0.9,
                translateY: 10,
            },

            process: {
                opacity: 1,
                scale: 1,
                translateY: 0,
            },
        },
        normal: {
            init: {
                opacity: 0,
            },

            process: {
                opacity: 1,
            },
        },
    },
};
