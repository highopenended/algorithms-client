/**
 * Configuration constants for the Stack visualization component
 * Contains animation, layout, and interaction settings
 */

// Layout and spacing configuration
export const STACK_CONFIG = {
    verticalSpacing: 16,
    pushOffsetY: "12rem",
    maxFloorOffset: 320, // Maximum distance the floor can move down (in pixels)
    maxBottomPosition: 0, // Will be set dynamically based on screen height
    itemHeight: 48, // Height of each item (3rem = 48px)
    minSpacing: 8, // Minimum spacing between items when compressed
    topItemSeparation: 32, // Constant separation for top item
    bottomItemSeparation: 32, // Constant separation for bottom item
    minCompressionRatio: 0.3, // Minimum allowed compression (30% of normal spacing)
};

// Button state configuration
export const BUTTON_CONFIG = {
    PUSH: { btnEnabled: { Push: false, Pop: false, Peek: false } },
    POP: { btnEnabled: { Push: false, Pop: false, Peek: false } },
    PEEK: { btnEnabled: { Push: false, Pop: false, Peek: false } },
    RESET: { btnEnabled: { Push: false, Pop: false, Peek: false } },
};

// Animation configuration
export const ANIMATION_CONFIG = {
    PUSH: {
        baseDuration: 0.4,
        initial: {
            backgroundColor: "rgba(255, 255, 255, 0)",
            borderWidth: 0,
            borderRadius: "0rem",
            padding: "0rem",
            boxShadow: "none",
            width: "auto",
            borderColor: "rgba(255, 255, 255, 0)",
        },
        animate: {
            backgroundColor: "rgba(255, 255, 255, 1)",
            borderWidth: "0.125rem",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            boxShadow:
                "0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)",
            width: "16rem",
        },
    },
    POP: {
        baseDuration: 0.5,
        initial: {
            y: 0,
            opacity: 1,
            borderColor: "#9CA3AF",
        },
        animate: {
            x: 20,
            y: -20,
            opacity: 1,
            borderColor: "#EF4444",
            transition: {
                duration: 0.2,
                ease: "easeOut",
                times: [0, 0.2, 1],
            },
        },
        exit: {
            y: 0,
            x: 200,
            opacity: 0,
            borderColor: "#EF4444",
            transition: {
                duration: 1.2,
                ease: "easeInOut",
                times: [0, 0.2, 1],
                x: {
                    duration: 0.25,
                    times: [0, 0.05, 0.8, 1],
                    ease: ["easeOut"],
                },
                y: {
                    duration: 1.2,
                    times: [0, 0.2, 1],
                    ease: ["easeOut", "easeIn"],
                },
                opacity: {
                    duration: 0.3,
                    times: [0, 1],
                    ease: "easeOut",
                },
                borderColor: {
                    duration: 1.2,
                    times: [0, 0.2, 1],
                },
            },
        },
    },
    PEEK: {
        baseDuration: 0.5,
        scale: 1.1,
        y: "-0.25rem",
        x: "1.75rem",
        borderColor: "#2563EB",
        boxShadow: "0 0 15px 5px rgba(37, 99, 235, 0.3)",
        transition: { duration: 0.2, ease: "easeOut" },
    },
    RESET: {
        totalDuration: 1,
        initialDelay: 0,
        exit: {
            y: 1000,
            rotate: 45,
            transition: {
                duration: 0.5,
                ease: "easeIn",
            },
        },
    },
    DEFAULT: {
        scale: 1,
        y: 0,
        borderColor: "#9CA3AF",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        transition: { duration: 0.2, ease: "easeIn" },
    },
}; 