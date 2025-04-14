import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlgoComponentProps } from "../../../types/algo.types";
import MotionWrapper from "./Stack.MotionWrapper.tsx";
import Controls from "./Stack.Controls.tsx";

interface StackItem {
    id: number;
    value: string;
}

// Config constants
const STACK_CONFIG = {
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

const BUTTON_CONFIG = {
    PUSH: { btnEnabled: { Push: false, Pop: false, Peek: false } },
    POP: { btnEnabled: { Push: false, Pop: false, Peek: false } },
    PEEK: { btnEnabled: { Push: false, Pop: false, Peek: false } },
    RESET: { btnEnabled: { Push: false, Pop: false, Peek: false } },
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
        baseDuration: 1,
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

const Floor = ({ stackLength }: { stackLength: number }) => {
    const getFloorPosition = () => {
        if (stackLength === 0) return STACK_CONFIG.verticalSpacing + STACK_CONFIG.itemHeight;
        
        // Position floor below the last item
        const lastItemPosition = Math.min(stackLength * STACK_CONFIG.verticalSpacing, STACK_CONFIG.maxBottomPosition);
        const floorOffset = STACK_CONFIG.itemHeight + (STACK_CONFIG.verticalSpacing / 2);
        return Math.min(lastItemPosition + floorOffset, STACK_CONFIG.maxBottomPosition + STACK_CONFIG.itemHeight);
    };

    return (
        <motion.div
            initial={false}
            animate={{ y: getFloorPosition() }}
            className="absolute top-0 w-[120%] h-[0.5px] bg-gray-700 left-[-10%]"
            style={{ zIndex: -1 }}
        />
    );
};

const PushingAnimation = ({
    position,
    value,
    isFirstItem,
    stackLength
}: {
    position: { x: number; y: number };
    value: string;
    isFirstItem: boolean;
    stackLength: number;
}) => (
    <motion.div
        initial={{ x: position.x, y: position.y, scale: 1, opacity: 1, zIndex: stackLength + 20, ...ANIMATION_CONFIG.PUSH.initial }}
        animate={{ x: isFirstItem ? 0 : -20, y: STACK_CONFIG.pushOffsetY, zIndex: stackLength + 20, scale: 1, opacity: 1, ...ANIMATION_CONFIG.PUSH.animate }}
        transition={{
            duration: ANIMATION_CONFIG.PUSH.baseDuration,
            backgroundColor: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration * 0.4 },
            borderWidth: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration },
            borderRadius: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration },
            padding: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration },
            boxShadow: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration },
            width: { delay: 0, duration: ANIMATION_CONFIG.PUSH.baseDuration },
        }}
        className="absolute border-gray-400 flex items-center justify-center"
    >
        <span className="text-gray-700">{value}</span>
    </motion.div>
);

export function Stack({ screenHeight }: AlgoComponentProps) {
    const [actualStack, setActualStack] = useState<StackItem[]>([]);
    const [visibleStack, setVisibleStack] = useState<StackItem[]>([]);
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
    const prevScreenHeightRef = useRef(screenHeight);

    // Calculate container height based on screen height
    const containerHeight = Math.max(300, screenHeight - 280);

    // Adjust spacing based on container height
    const verticalSpacing = Math.min(16, Math.max(8, containerHeight / 20));
    STACK_CONFIG.verticalSpacing = verticalSpacing;
    // Leave space for the item height, floor line (0.5px) and some padding (16px)
    STACK_CONFIG.maxBottomPosition = containerHeight - STACK_CONFIG.itemHeight - 16;
    STACK_CONFIG.maxFloorOffset = STACK_CONFIG.maxBottomPosition;
    STACK_CONFIG.topItemSeparation = Math.max(16, verticalSpacing * 2);
    STACK_CONFIG.bottomItemSeparation = Math.max(16, verticalSpacing * 2);

    // Calculate maximum visible items based on available space
    const getMaxVisibleItems = () => {
        const availableSpace = STACK_CONFIG.maxFloorOffset - STACK_CONFIG.verticalSpacing - STACK_CONFIG.bottomItemSeparation - STACK_CONFIG.topItemSeparation;
        return Math.floor(availableSpace / (STACK_CONFIG.verticalSpacing * STACK_CONFIG.minCompressionRatio)) + 3;
    };

    // Update visible stack only when screen height actually changes
    useEffect(() => {
        if (prevScreenHeightRef.current === screenHeight) {
            return;
        }
        
        const maxVisible = getMaxVisibleItems();
        
        if (actualStack.length <= maxVisible) {
            setVisibleStack(actualStack);
        } else {
            const startIndex = Math.max(0, actualStack.length - maxVisible);
            setVisibleStack(actualStack.slice(startIndex));
        }

        prevScreenHeightRef.current = screenHeight;
    }, [screenHeight, actualStack]);

    const handlePush = () => {
        if (!inputValue.trim() || isAnimatingPush) return;
        const newItem = { id: nextId, value: inputValue.trim() };
        setPushingValue(inputValue.trim());
        setIsAnimatingPush(true);
        setInputValue("");

        // Always add to actual stack
        const newActualStack = [...actualStack, newItem];
        setActualStack(newActualStack);

        // Only add to visible stack if under max visible items
        const maxVisible = getMaxVisibleItems();
        if (visibleStack.length < maxVisible) {
            setTimeout(() => {
                setVisibleStack([...visibleStack, newItem]);
                setNextId(nextId + 1);
                setIsAnimatingPush(false);
                setPushingValue("");
                setRecentlyPushedId(newItem.id);
                setTimeout(() => {
                    setRecentlyPushedId(null);
                }, 500);
            }, ANIMATION_CONFIG.PUSH.baseDuration * 1000);
        } else {
            // Still wait for animation to complete before clearing states
            setTimeout(() => {
                setNextId(nextId + 1);
                setIsAnimatingPush(false);
                setPushingValue("");
            }, ANIMATION_CONFIG.PUSH.baseDuration * 1000);
        }
    };

    const handlePop = () => {
        if (actualStack.length === 0 || isAnimatingPop) return;

        // Always remove from actual stack
        const newActualStack = actualStack.slice(0, -1);
        setActualStack(newActualStack);

        // Handle visible stack
        if (visibleStack.length > 0) {
            setPoppingItem(visibleStack[visibleStack.length - 1]);
            setIsAnimatingPop(true);

            setTimeout(() => {
                const newVisibleStack = visibleStack.slice(0, -1);
                
                // If we have more items in actual stack than visible stack can show,
                // add the next item from actual stack to visible stack
                const maxVisible = getMaxVisibleItems();
                if (newActualStack.length > newVisibleStack.length && newVisibleStack.length < maxVisible) {
                    newVisibleStack.push(newActualStack[newVisibleStack.length - 1]);
                }
                
                setVisibleStack(newVisibleStack);
                setIsAnimatingPop(false);
                setPoppingItem(null);
            }, ANIMATION_CONFIG.POP.baseDuration * 1000);
        }
    };

    const handlePeek = () => {
        if (actualStack.length === 0) return;
        setIsAnimatingPeek(true);
        setTimeout(() => {
            setIsAnimatingPeek(false);
        }, ANIMATION_CONFIG.PEEK.baseDuration * 1000);
    };

    const handleReset = () => {
        if (actualStack.length === 0 || isAnimatingReset) return;
        setIsAnimatingReset(true);
        
        setTimeout(() => {
            setActualStack([]);
            setVisibleStack([]);
            setIsAnimatingReset(false);
            inputRef.current?.focus();
        }, ANIMATION_CONFIG.RESET.initialDelay * 1000);
    };

    const handleAddRandom = () => {
        if (isAnimatingPush || isAnimatingPop || isAnimatingPeek) return;
        
        const randomValues = Array.from({ length: 5 }, () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const length = Math.floor(Math.random() * 3) + 1;
            return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        });

        const newItems = randomValues.map((value, index) => ({
            id: nextId + index,
            value
        }));

        // Add all items to actual stack
        setActualStack([...actualStack, ...newItems]);

        // Add items to visible stack only if there's space
        const maxVisible = getMaxVisibleItems();
        const availableSpace = maxVisible - visibleStack.length;
        if (availableSpace > 0) {
            const itemsToAdd = newItems.slice(0, availableSpace);
            setVisibleStack([...visibleStack, ...itemsToAdd]);
        }

        setNextId(nextId + 5);
    };

    const isButtonDisabled = (action: "Push" | "Pop" | "Peek" | "Reset" | "AddRandom") => {
        const isAnimating = {
            Push: isAnimatingPush,
            Pop: isAnimatingPop,
            Peek: isAnimatingPeek,
            Reset: isAnimatingReset,
        };

        return (
            (action === "Push" &&
                (!inputValue.trim() || (isAnimating.Push && !BUTTON_CONFIG.PUSH.btnEnabled[action]))) ||
            (action === "Pop" &&
                (actualStack.length === 0 ||
                    (isAnimating.Push && !BUTTON_CONFIG.PUSH.btnEnabled[action]) ||
                    (isAnimating.Pop && !BUTTON_CONFIG.POP.btnEnabled[action]) ||
                    (isAnimating.Peek && !BUTTON_CONFIG.PEEK.btnEnabled[action]))) ||
            (action === "Peek" &&
                (actualStack.length === 0 ||
                    (isAnimating.Push && !BUTTON_CONFIG.PUSH.btnEnabled[action]) ||
                    (isAnimating.Pop && !BUTTON_CONFIG.POP.btnEnabled[action]) ||
                    (isAnimating.Peek && !BUTTON_CONFIG.PEEK.btnEnabled[action]))) ||
            (action === "Reset" &&
                (actualStack.length === 0 || isAnimating.Reset || isAnimating.Push || isAnimating.Pop || isAnimating.Peek)) ||
            (action === "AddRandom" &&
                (isAnimating.Push || isAnimating.Pop || isAnimating.Peek || isAnimating.Reset))
        );
    };

    const handleInputChange = (value: string) => {
        if (value.length === 30 && inputValue.length < 30) {
            setIsInputShaking(true);
            setTimeout(() => setIsInputShaking(false), 300);
        }
        setInputValue(value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isButtonDisabled("Push")) {
            handlePush();
        }
    };

    return (
        <div className="p-6 flex flex-col items-center" style={{ height: screenHeight, maxHeight: screenHeight }}>
            <Controls
                inputValue={inputValue}
                isInputShaking={isInputShaking}
                isAnimatingPush={isAnimatingPush}
                onInputChange={handleInputChange}
                onInputKeyDown={handleInputKeyDown}
                onPush={handlePush}
                onPop={handlePop}
                onPeek={handlePeek}
                isButtonDisabled={isButtonDisabled}
            />
            <div className="flex flex-col items-center gap-2 mb-4">
                <div className="flex items-center justify-center text-sm whitespace-nowrap">
                    <span className="w-[120px] text-right">
                        <button
                            onClick={handleReset}
                            disabled={isButtonDisabled("Reset")}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:hover:text-gray-500 transition-colors"
                        >
                            Reset Stack
                        </button>
                    </span>
                    <span className="w-[20px] text-center text-gray-300">|</span>
                    <span className="w-[120px] text-left">
                        <button
                            onClick={handleAddRandom}
                            disabled={isButtonDisabled("AddRandom")}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:hover:text-gray-500 transition-colors"
                        >
                            Add Random
                        </button>
                    </span>
                </div>
                <p className="text-gray-600 font-medium">Stack Size: {actualStack.length}</p>
            </div>

            {isAnimatingPush && (
                <PushingAnimation 
                    position={{x:0,y:0}} 
                    value={pushingValue} 
                    isFirstItem={actualStack.length === 1}
                    stackLength={visibleStack.length}
                />
            )}

            <div 
                ref={containerRef} 
                className="relative w-full max-w-md flex items-start justify-center" 
                style={{ 
                    height: containerHeight,
                    perspective: "1000px"
                }}
            >
                <div className="relative w-64" style={{ 
                    transformStyle: "preserve-3d",
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "center"
                }}>
                    <Floor stackLength={visibleStack.length} />
                    <AnimatePresence>
                        {visibleStack.map((item, index) => {
                            const isTop = index === visibleStack.length - 1; // Last item is at the top
                            const isPopping = isTop && poppingItem?.id === item.id;
                            const isPeeking = isTop && isAnimatingPeek;
                            const borderColor = isTop && !isAnimatingPush ? "#9CA3AF" : "#E5E7EB";

                            if (isAnimatingReset) {
                                const randomRotation = Math.random() * 60 - 30;
                                const randomXdrift = Math.random() * 100 - 50;
                                return (
                                    <MotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        stackLength={visibleStack.length}
                                        animation={ANIMATION_CONFIG.DEFAULT}
                                        config={STACK_CONFIG}
                                        exit={{
                                            ...ANIMATION_CONFIG.RESET.exit,
                                            rotate: randomRotation,
                                            x: randomXdrift,
                                            transition: {
                                                ...ANIMATION_CONFIG.RESET.exit.transition,
                                                delay: index * (ANIMATION_CONFIG.RESET.totalDuration / visibleStack.length),
                                            },
                                        }}
                                    >
                                        {item.value}
                                    </MotionWrapper>
                                );
                            }

                            if (isPopping) {
                                return (
                                    <MotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        stackLength={visibleStack.length}
                                        animation={ANIMATION_CONFIG.POP.animate}
                                        config={STACK_CONFIG}
                                        exit={ANIMATION_CONFIG.POP.exit}
                                    >
                                        {item.value}
                                    </MotionWrapper>
                                );
                            }

                            if (isPeeking) {
                                return (
                                    <MotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        stackLength={visibleStack.length}
                                        animation={ANIMATION_CONFIG.PEEK}
                                        config={STACK_CONFIG}
                                    >
                                        {item.value}
                                    </MotionWrapper>
                                );
                            }

                            return (
                                <MotionWrapper
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    stackLength={visibleStack.length}
                                    animation={{ ...ANIMATION_CONFIG.DEFAULT, borderColor }}
                                    config={STACK_CONFIG}
                                >
                                    {item.id === recentlyPushedId ? item.value : "..."}
                                </MotionWrapper>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default Stack;