import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StackItem {
    id: number;
    value: string;
}

// Config constants
const STACK_CONFIG = {
    verticalSpacing: 16,
    depthSpacing: 2,
    pushOffsetY: "-3rem",
};

const BUTTON_CONFIG = {
    PUSH: { btnEnabled: { Push: false, Pop: false, Peek: false } },
    POP: { btnEnabled: { Push: false, Pop: false, Peek: false } },
    PEEK: { btnEnabled: { Push: false, Pop: true, Peek: false } },
    RESET: { btnEnabled: { Push: true, Pop: true, Peek: true } },
};

// Animation constants
const ANIMATION_CONFIG = {
    PUSH: {
        baseDuration: 0.4,
        initial: {
            backgroundColor: "rgba(255, 255, 255, 0)",
            borderWidth: 0,
            borderRadius: "0rem",
            padding: "0rem",
            boxShadow: "none",
            width: "auto",
        },
        animate: {
            backgroundColor: "rgba(255, 255, 255, 1)",
            borderWidth: "0.125rem",
            borderRadius: "0.5rem",
            padding: "1rem",
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
        baseDuration: 1,
        scale: 1.1,
        y: "-0.5rem",
        x:"1rem",
        borderColor: "#2563EB",
        boxShadow: "0 0 15px 5px rgba(37, 99, 235, 0.3)",
        transition: { duration: 0.2, ease: "easeOut" },
    },
    RESET: {
        totalDuration: 1, // Total time for the entire reset animation
        initialDelay: 0, // Initial delay before animation starts
        exit: {
            x: 0,
            y: 1000,
            rotate:45,
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

const StackItemMotionWrapper = ({
    item,
    index,
    stackLength,
    animation,
    exit,
    children,
}: {
    item: StackItem;
    index: number;
    stackLength: number;
    animation: any;
    exit?: any;
    children?: React.ReactNode;
}) => (
    <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1, y: (stackLength - index) * STACK_CONFIG.verticalSpacing }}
        exit={exit}
        className="absolute bottom-0 w-full"
        style={{ zIndex: index }}
    >
        <motion.div
            animate={animation}
            className="h-16 w-full bg-white border-2 rounded-lg flex items-center justify-center transform-gpu preserve-3d"
            style={{ transform: `translateZ(${index * STACK_CONFIG.depthSpacing}px)` }}
        >
            <span className="text-gray-700">{children || item.value}</span>
        </motion.div>
    </motion.div>
);

const PushingAnimation = ({
    position,
    value,
    zIndex,
}: {
    position: { x: number; y: number };
    value: string;
    zIndex: number;
}) => (
    <motion.div
        initial={{ x: position.x, y: position.y, scale: 1, opacity: 1, ...ANIMATION_CONFIG.PUSH.initial }}
        animate={{ x: 0, y: STACK_CONFIG.pushOffsetY, zIndex, scale: 1, opacity: 1, ...ANIMATION_CONFIG.PUSH.animate }}
        transition={{
            duration: ANIMATION_CONFIG.PUSH.baseDuration,
            backgroundColor: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration * 0.4 },
            borderWidth: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration },
            borderRadius: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration },
            padding: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration },
            boxShadow: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration },
            width: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration },
        }}
        className="absolute z-10 border-gray-400 flex items-center justify-center"
    >
        <span className="text-gray-700">{value}</span>
    </motion.div>
);

export function Stack() {
    const [stack, setStack] = useState<StackItem[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [nextId, setNextId] = useState(0);
    const [isAnimatingPush, setIsAnimatingPush] = useState(false);
    const [isAnimatingPop, setIsAnimatingPop] = useState(false);
    const [isAnimatingPeek, setIsAnimatingPeek] = useState(false);
    const [isAnimatingReset, setIsAnimatingReset] = useState(false);
    const [poppingItem, setPoppingItem] = useState<StackItem | null>(null);
    const [pushingValue, setPushingValue] = useState("");
    const [recentlyPushedId, setRecentlyPushedId] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate delay per item for reset animation
    const resetDelayPerItem = stack.length > 1 
        ? ANIMATION_CONFIG.RESET.totalDuration / (stack.length - 1)
        : 0;

    // Focus input on component mount and whenever animations complete
    useEffect(() => {
        inputRef.current?.focus();
    }, [isAnimatingPush, isAnimatingPop, isAnimatingPeek]);

    const handlePush = () => {
        if (!inputValue.trim() || isAnimatingPush) return;
        const newItem = { id: nextId, value: inputValue.trim() };
        setPushingValue(inputValue.trim());
        setIsAnimatingPush(true);
        setInputValue("");
        setTimeout(() => {
            setStack([...stack, newItem]);
            setNextId(nextId + 1);
            setIsAnimatingPush(false);
            setPushingValue("");
            setRecentlyPushedId(newItem.id);
            setTimeout(() => {
                setRecentlyPushedId(null);
            }, 500);
        }, ANIMATION_CONFIG.PUSH.baseDuration * 1000);
    };

    const handlePop = () => {
        if (stack.length === 0 || isAnimatingPop) return;
        const itemToPop = stack[stack.length - 1];
        setPoppingItem(itemToPop);
        setIsAnimatingPop(true);
        setTimeout(() => {
            setStack(stack.slice(0, -1));
            setIsAnimatingPop(false);
            setPoppingItem(null);
        }, ANIMATION_CONFIG.POP.baseDuration * 1000);
    };

    const handlePeek = () => {
        if (stack.length === 0) return;
        setIsAnimatingPeek(true);
        setTimeout(() => {
            setIsAnimatingPeek(false);
        }, ANIMATION_CONFIG.PEEK.baseDuration * 1000);
    };

    const handleReset = () => {
        if (stack.length === 0 || isAnimatingReset) return;
        setIsAnimatingReset(true);
        
        // Clear the stack after the initial delay
        setTimeout(() => {
            setStack([]);
            setIsAnimatingReset(false);
            inputRef.current?.focus();
        }, ANIMATION_CONFIG.RESET.initialDelay * 1000);
    };

    const handleFill = () => {
        if (isAnimatingPush || isAnimatingPop || isAnimatingPeek) return;
        
        // Generate 50 random values
        const randomValues = Array.from({ length: 50 }, () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const length = Math.floor(Math.random() * 3) + 1; // 1-3 characters
            return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        });

        // Create new stack items
        const newItems = randomValues.map((value, index) => ({
            id: nextId + index,
            value
        }));

        setNextId(nextId + 50);
        setStack(newItems);
    };

    const getInputPosition = () => {
        if (!inputRef.current || !containerRef.current) return { x: 0, y: 0 };
        const inputRect = inputRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        return {
            x: inputRect.left - containerRect.left + (inputRect.width - containerRect.width) / 2,
            y: inputRect.top - containerRect.top + (inputRect.height - containerRect.height) / 2,
        };
    };

    const isButtonDisabled = (action: "Push" | "Pop" | "Peek") => {
        const isAnimating = {
            Push: isAnimatingPush,
            Pop: isAnimatingPop,
            Peek: isAnimatingPeek,
        };

        return (
            (action === "Push" &&
                (!inputValue.trim() || (isAnimating.Push && !BUTTON_CONFIG.PUSH.btnEnabled[action]))) ||
            (action === "Pop" &&
                (stack.length === 0 ||
                    (isAnimating.Push && !BUTTON_CONFIG.PUSH.btnEnabled[action]) ||
                    (isAnimating.Pop && !BUTTON_CONFIG.POP.btnEnabled[action]) ||
                    (isAnimating.Peek && !BUTTON_CONFIG.PEEK.btnEnabled[action]))) ||
            (action === "Peek" &&
                (stack.length === 0 ||
                    (isAnimating.Push && !BUTTON_CONFIG.PUSH.btnEnabled[action]) ||
                    (isAnimating.Pop && !BUTTON_CONFIG.POP.btnEnabled[action]) ||
                    (isAnimating.Peek && !BUTTON_CONFIG.PEEK.btnEnabled[action])))
        );
    };

    return (
        <div className="p-6 flex flex-col items-center">
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center w-full max-w-lg">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isButtonDisabled("Push")) {
                            handlePush();
                        }
                    }}
                    disabled={isAnimatingPush}
                    className="px-4 py-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 text-center w-full sm:w-48"
                    placeholder="Enter value..."
                />
                <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handlePush}
                        disabled={isButtonDisabled("Push")}
                        className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition-colors disabled:opacity-50 flex-1 sm:flex-none min-w-[5rem]"
                    >
                        Push
                    </button>
                    <button
                        onClick={handlePop}
                        disabled={isButtonDisabled("Pop")}
                        className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-colors disabled:opacity-50 flex-1 sm:flex-none min-w-[5rem]"
                    >
                        Pop
                    </button>
                    <button
                        onClick={handlePeek}
                        disabled={isButtonDisabled("Peek")}
                        className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-colors disabled:opacity-50 flex-1 sm:flex-none min-w-[5rem]"
                    >
                        Peek
                    </button>
                </div>
            </div>
            <div className="mt-4 text-gray-600 flex items-center gap-4">
                <p>Stack Size: {stack.length}</p>
                <button
                    onClick={handleReset}
                    disabled={stack.length === 0 || isAnimatingReset}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded shadow hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                    Reset
                </button>
                <button
                    onClick={handleFill}
                    disabled={isAnimatingPush || isAnimatingPop || isAnimatingPeek}
                    className="px-3 py-1 bg-purple-500 text-white text-sm rounded shadow hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                    Fill
                </button>
            </div>

            <div ref={containerRef} className="relative w-full max-w-md h-[400px] flex items-start justify-center pt-20">
                {isAnimatingPush && (
                    <PushingAnimation position={getInputPosition()} value={pushingValue} zIndex={stack.length + 1} />
                )}

                <div className="relative w-64">
                    <AnimatePresence>
                        {stack.map((item, index) => {
                            const isTop = index === stack.length - 1;
                            const isPopping = isTop && poppingItem?.id === item.id;
                            const isPeeking = isTop && isAnimatingPeek;
                            const borderColor = isTop && !isAnimatingPush ? "#9CA3AF" : "#E5E7EB";

                            if (isAnimatingReset) {
                                const randomRotation = Math.random() * 60 - 30; // Random value between -30 and 30
                                const randomXdrift = Math.random() * 50 - 25 // Random value between -25 and 25
                                return (
                                    <StackItemMotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        stackLength={stack.length}
                                        animation={ANIMATION_CONFIG.DEFAULT}
                                        exit={{
                                            ...ANIMATION_CONFIG.RESET.exit,
                                            rotate: randomRotation,
                                            x: randomXdrift,
                                            transition: {
                                                ...ANIMATION_CONFIG.RESET.exit.transition,
                                                delay: index * resetDelayPerItem,
                                            },
                                        }}
                                    >
                                        {item.value}
                                    </StackItemMotionWrapper>
                                );
                            }

                            if (isPopping) {
                                return (
                                    <StackItemMotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        stackLength={stack.length}
                                        animation={ANIMATION_CONFIG.POP.animate}
                                        exit={ANIMATION_CONFIG.POP.exit}
                                    >
                                        {item.value}
                                    </StackItemMotionWrapper>
                                );
                            }

                            // Peeking animation
                            if (isPeeking) {
                                return (
                                    <StackItemMotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        stackLength={stack.length}
                                        animation={ANIMATION_CONFIG.PEEK}
                                    >
                                        {item.value}
                                    </StackItemMotionWrapper>
                                );
                            }

                            // Default animation
                            return (
                                <StackItemMotionWrapper
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    stackLength={stack.length}
                                    animation={{ ...ANIMATION_CONFIG.DEFAULT, borderColor }}
                                >
                                    {item.id === recentlyPushedId ? item.value : "..."}
                                </StackItemMotionWrapper>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default Stack;
