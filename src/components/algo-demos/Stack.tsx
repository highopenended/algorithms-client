import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlgoComponentProps } from "../../types/algo.types";

interface StackItem {
    id: number;
    value: string;
}

// Config constants
const STACK_CONFIG = {
    verticalSpacing: 16,
    pushOffsetY: "-3rem",
    maxFloorOffset: 320, // Maximum distance the floor can move down (in pixels)
    itemHeight: 48, // Height of each item (3rem = 48px)
    minSpacing: 8, // Minimum spacing between items when compressed
    topItemSeparation: 32, // Constant separation for top item
    bottomItemSeparation: 32, // Constant separation for bottom item
    minCompressionRatio: 0.3, // Minimum allowed compression (30% of normal spacing)
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
        baseDuration: 0.2,
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
        y: "0.25rem",
        x:"0.5rem",
        borderColor: "#2563EB",
        boxShadow: "0 0 15px 5px rgba(37, 99, 235, 0.3)",
        transition: { duration: 0.2, ease: "easeOut" },
    },
    RESET: {
        totalDuration: 1, // Total time for the entire reset animation
        initialDelay: 0, // Initial delay before animation starts
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
}) => {
    // Calculate vertical spacing based on stack size
    const getVerticalPosition = () => {
        const maxItemsAtNormalSpacing = Math.floor(STACK_CONFIG.maxFloorOffset / STACK_CONFIG.verticalSpacing);
        
        if (stackLength <= maxItemsAtNormalSpacing) {
            // Normal spacing
            return (stackLength - index) * STACK_CONFIG.verticalSpacing;
        }
        
        // Calculate available space and required spacing
        const availableSpace = STACK_CONFIG.maxFloorOffset - STACK_CONFIG.verticalSpacing - STACK_CONFIG.bottomItemSeparation - STACK_CONFIG.topItemSeparation;
        const middleItemCount = stackLength - 3; // Excluding top, bottom, and second-from-bottom items
        const requiredSpacing = availableSpace / middleItemCount;
        
        // Calculate compression ratio
        const compressionRatio = requiredSpacing / STACK_CONFIG.verticalSpacing;
        
        // If compression would exceed minimum ratio, use minimum spacing
        const effectiveSpacing = compressionRatio < STACK_CONFIG.minCompressionRatio
            ? STACK_CONFIG.verticalSpacing * STACK_CONFIG.minCompressionRatio
            : requiredSpacing;

        // Position items based on their role
        if (index === 0) {
            // Bottom item
            return STACK_CONFIG.maxFloorOffset;
        } else if (index === 1) {
            // Second from bottom item
            return STACK_CONFIG.maxFloorOffset - STACK_CONFIG.bottomItemSeparation;
        } else if (index === stackLength - 1) {
            // Top item - keep it at a fixed distance from maxFloorOffset
            return STACK_CONFIG.verticalSpacing;
        } else {
            // Middle items use effective spacing
            const bottomItemsHeight = STACK_CONFIG.maxFloorOffset - STACK_CONFIG.bottomItemSeparation;
            // Calculate how many items we can show at minimum compression
            const maxVisibleMiddleItems = Math.floor(availableSpace / (STACK_CONFIG.verticalSpacing * STACK_CONFIG.minCompressionRatio));
            
            if (compressionRatio < STACK_CONFIG.minCompressionRatio) {
                // We're at max compression, show only visible items
                if (index - 1 <= maxVisibleMiddleItems) {
                    // This item is within visible range
                    return bottomItemsHeight - (index - 1) * (STACK_CONFIG.verticalSpacing * STACK_CONFIG.minCompressionRatio);
                } else {
                    // This item is beyond visible range, stack it with the last visible item
                    return bottomItemsHeight - maxVisibleMiddleItems * (STACK_CONFIG.verticalSpacing * STACK_CONFIG.minCompressionRatio);
                }
            } else {
                // Normal compression
                return bottomItemsHeight - (index - 1) * effectiveSpacing;
            }
        }
    };

    return (
        <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1, y: getVerticalPosition() }}
            exit={exit}
            className="absolute bottom-0 w-full"
            style={{ zIndex: index }}
        >
            <motion.div
                animate={animation}
                className="h-12 w-full bg-white border-2 rounded-lg flex items-center justify-center transform-gpu preserve-3d"
            >
                <span className="text-gray-700">{children || item.value}</span>
            </motion.div>
        </motion.div>
    );
};

const Floor = ({ stackLength }: { stackLength: number }) => {
    const getFloorPosition = () => {
        const normalPosition = stackLength * STACK_CONFIG.verticalSpacing;
        return Math.min(normalPosition, STACK_CONFIG.maxFloorOffset) + 2;
    };

    return (
        <motion.div
            initial={false}
            animate={{ y: getFloorPosition() }}
            className="absolute bottom-0 w-[120%] h-[0.5px] bg-gray-700 left-[-10%]"
            style={{ zIndex: -1 }}
        />
    );
};

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

export function Stack({ screenHeight }: AlgoComponentProps) {
    const [stack, setStack] = useState<StackItem[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [nextId, setNextId] = useState(0);
    const [isAnimatingPush, setIsAnimatingPush] = useState(false);
    const [isAnimatingPop, setIsAnimatingPop] = useState(false);
    const [isAnimatingPeek, setIsAnimatingPeek] = useState(false);
    const [isAnimatingReset, setIsAnimatingReset] = useState(false);
    const [isInputShaking, setIsInputShaking] = useState(false);
    const [poppingItem, setPoppingItem] = useState<StackItem | null>(null);
    const [pushingValue, setPushingValue] = useState("");
    const [recentlyPushedId, setRecentlyPushedId] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate container height based on screen height
    const containerHeight = Math.max(300, screenHeight - 280); // 280px accounts for padding, buttons, and other UI elements
    const visualizationHeight = containerHeight - 80; // 80px for padding and spacing

    // Adjust spacing based on container height
    const verticalSpacing = Math.min(16, Math.max(8, visualizationHeight / 20)); // Dynamic spacing between 8-16px
    STACK_CONFIG.verticalSpacing = verticalSpacing;
    STACK_CONFIG.maxFloorOffset = Math.min(320, visualizationHeight * 0.8); // 80% of visualization height
    STACK_CONFIG.topItemSeparation = Math.max(16, verticalSpacing * 2);
    STACK_CONFIG.bottomItemSeparation = Math.max(16, verticalSpacing * 2);

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

    const handleAddRandom = () => {
        if (isAnimatingPush || isAnimatingPop || isAnimatingPeek) return;
        
        // Generate 5 random values
        const randomValues = Array.from({ length: 5 }, () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const length = Math.floor(Math.random() * 3) + 1; // 1-3 characters
            return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        });

        // Create new stack items and add them to existing stack
        const newItems = randomValues.map((value, index) => ({
            id: nextId + index,
            value
        }));

        setNextId(nextId + 5);
        setStack([...stack, ...newItems]);
    };

    const getInputPosition = () => {
        if (!inputRef.current || !containerRef.current) return { x: 0, y: 0 };
        const inputRect = inputRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate center of input relative to container
        const x = (inputRect.left + inputRect.width / 2) - (containerRect.left + containerRect.width / 2);
        
        // Calculate vertical position to start from input's center
        const y = (inputRect.top-inputRect.height) - (containerRect.top + inputRect.height/2);
        
        
        return { x, y };
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
        <div className="p-6 flex flex-col items-center" style={{ height: screenHeight, maxHeight: screenHeight }}>
            <div className="flex flex-col gap-4 mb-6 items-center w-full max-w-lg">
                <motion.input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    maxLength={30}
                    animate={isInputShaking ? {
                        x: [0, -5, 5, -5, 5, 0],
                        transition: { duration: 0.3 }
                    } : {}}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue.length === 30 && inputValue.length < 30) {
                            setIsInputShaking(true);
                            setTimeout(() => setIsInputShaking(false), 300);
                        }
                        setInputValue(newValue);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isButtonDisabled("Push")) {
                            handlePush();
                        }
                    }}
                    disabled={isAnimatingPush}
                    className="px-4 py-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 text-center w-full"
                    placeholder="Enter value..."
                />
                <div className="flex justify-center gap-2 w-full">
                    <button
                        onClick={handlePush}
                        disabled={isButtonDisabled("Push")}
                        className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition-colors disabled:opacity-50 flex-1 min-w-[5rem]"
                    >
                        Push
                    </button>
                    <button
                        onClick={handlePop}
                        disabled={isButtonDisabled("Pop")}
                        className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-colors disabled:opacity-50 flex-1 min-w-[5rem]"
                    >
                        Pop
                    </button>
                    <button
                        onClick={handlePeek}
                        disabled={isButtonDisabled("Peek")}
                        className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-colors disabled:opacity-50 flex-1 min-w-[5rem]"
                    >
                        Peek
                    </button>
                </div>
            </div>
            <div className="flex flex-col items-center gap-2 mb-4">
                <div className="flex items-center justify-center text-sm whitespace-nowrap">
                    <span className="w-[120px] text-right">
                        <button
                            onClick={handleReset}
                            disabled={stack.length === 0 || isAnimatingReset || isAnimatingPush || isAnimatingPop || isAnimatingPeek}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:hover:text-gray-500 transition-colors"
                        >
                            Reset Stack
                        </button>
                    </span>
                    <span className="w-[20px] text-center text-gray-300">|</span>
                    <span className="w-[120px] text-left">
                        <button
                            onClick={handleAddRandom}
                            disabled={isAnimatingPush || isAnimatingPop || isAnimatingPeek}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:hover:text-gray-500 transition-colors"
                        >
                            Add Random
                        </button>
                    </span>
                </div>
                <p className="text-gray-600 font-medium">Stack Size: {stack.length}</p>
            </div>

            <div 
                ref={containerRef} 
                className="relative w-full max-w-md flex items-center justify-center" 
                style={{ 
                    height: containerHeight,
                    perspective: "1000px",
                    overflow: "hidden"
                }}
            >
                {isAnimatingPush && (
                    <PushingAnimation position={getInputPosition()} value={pushingValue} zIndex={stack.length + 1} />
                )}

                <div className="relative w-64" style={{ 
                    transformStyle: "preserve-3d", 
                    height: visualizationHeight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Floor stackLength={stack.length} />
                    <AnimatePresence>
                        {stack.map((item, index) => {
                            const isTop = index === stack.length - 1;
                            const isPopping = isTop && poppingItem?.id === item.id;
                            const isPeeking = isTop && isAnimatingPeek;
                            const borderColor = isTop && !isAnimatingPush ? "#9CA3AF" : "#E5E7EB";

                            if (isAnimatingReset) {
                                const randomRotation = Math.random() * 60 - 30; // Random value between -30 and 30
                                const randomXdrift = Math.random() * 100 - 50 // Random value between -25 and 25
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
