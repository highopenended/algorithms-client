import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StackItem {
    id: number;
    value: string;
}

// Config constants
const STACK_CONFIG = {
    verticalSpacing: 20,
    depthSpacing: 2,
    pushOffsetY: "-1.875rem"
};

const ANIMATION = {
    BASE_DURATION: 0.5,
    PUSH: {
        initial: {
            backgroundColor: "rgba(255, 255, 255, 0)",
            borderWidth: 0,
            borderRadius: "0rem",
            padding: "0rem",
            boxShadow: "none",
            width: "auto"
        },
        animate: {
            backgroundColor: "rgba(255, 255, 255, 1)",
            borderWidth: "0.125rem",
            borderRadius: "0.5rem",
            padding: "1rem",
            boxShadow: "0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)",
            width: "12rem"
        }
    },
    POP: {
        exit: {
            x: [0, 100, 400],
            opacity: [1, 1, 0],
            transition: {
                duration: 1.2,
                ease: "easeInOut",
                times: [0, 0.5, 1],
                // Split behavior
                x: {
                    duration: 1.2,
                    times: [0, 0.5, 1],
                    ease: ["easeOut", "easeIn"]
                },
                opacity: {
                    duration: 1.2,
                    times: [0, 0.8, 1],
                    ease: ["linear"]
                }
            }
        }
    },
    PEEK: {
        scale: 1.1,
        y: "-1rem",
        borderColor: "#2563EB",
        boxShadow: "0 0 15px 5px rgba(37, 99, 235, 0.3)",
        transition: { duration: 0.2, ease: "easeOut" }
    },
    DEFAULT: {
        scale: 1,
        y: 0,
        borderColor: "#9CA3AF",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        transition: { duration: 0.2, ease: "easeIn" }
    }
};

const StackItemMotionWrapper = ({
    item,
    index,
    stackLength,
    animation,
    exit,
    children
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

const PushingAnimation = ({ position, value, zIndex }: { position: { x: number; y: number }; value: string; zIndex: number }) => (
    <motion.div
        initial={{ x: position.x, y: position.y, scale: 1, opacity: 1, ...ANIMATION.PUSH.initial }}
        animate={{ x: 0, y: STACK_CONFIG.pushOffsetY, zIndex, scale: 1, opacity: 1, ...ANIMATION.PUSH.animate }}
        transition={{
            duration: ANIMATION.BASE_DURATION,
            backgroundColor: { delay: 0, duration: ANIMATION.BASE_DURATION * 0.4 },
            borderWidth: { delay: 0, duration: ANIMATION.BASE_DURATION },
            borderRadius: { delay: 0, duration: ANIMATION.BASE_DURATION },
            padding: { delay: 0, duration: ANIMATION.BASE_DURATION },
            boxShadow: { delay: 0, duration: ANIMATION.BASE_DURATION },
            width: { delay: 0, duration: ANIMATION.BASE_DURATION }
        }}
        className="absolute z-10 border-gray-400 flex items-center justify-center"
    >
        <span className="text-gray-700">{value}</span>
    </motion.div>
);

export function Stack() {
    const [stack, setStack] = useState<StackItem[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [peekingIndex, setPeekingIndex] = useState<number | null>(null);
    const [nextId, setNextId] = useState(0);
    const [isAnimatingPush, setIsAnimatingPush] = useState(false);
    const [isAnimatingPop, setIsAnimatingPop] = useState(false);
    const [poppingItem, setPoppingItem] = useState<StackItem | null>(null);
    const [pushingValue, setPushingValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
        }, ANIMATION.BASE_DURATION * 1000);
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
        }, ANIMATION.BASE_DURATION * 1000);
    };

    const handlePeek = () => {
        if (stack.length === 0) return;
        setPeekingIndex(stack.length - 1);
        setTimeout(() => setPeekingIndex(null), 1000);
    };

    const getInputPosition = () => {
        if (!inputRef.current || !containerRef.current) return { x: 0, y: 0 };
        const inputRect = inputRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        return {
            x: inputRect.left - containerRect.left + (inputRect.width - containerRect.width) / 2,
            y: inputRect.top - containerRect.top + (inputRect.height - containerRect.height) / 2
        };
    };

    return (
        <div className="p-6 flex flex-col items-center">
            <div className="flex gap-4 mb-8 items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isAnimatingPush}
                    className="px-4 py-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 text-center w-48"
                    placeholder="Enter value..."
                />
                <button
                    onClick={handlePush}
                    disabled={isAnimatingPush || !inputValue.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                    Push
                </button>
                <button
                    onClick={handlePop}
                    disabled={stack.length === 0 || isAnimatingPush || isAnimatingPop}
                    className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                    Pop
                </button>
                <button
                    onClick={handlePeek}
                    disabled={stack.length === 0 || isAnimatingPush || isAnimatingPop || peekingIndex !== null}
                    className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    Peek
                </button>
            </div>

            <div ref={containerRef} className="relative w-full max-w-md h-[400px] flex items-center justify-center">
                {isAnimatingPush && (
                    <PushingAnimation
                        position={getInputPosition()}
                        value={pushingValue}
                        zIndex={stack.length + 1}
                    />
                )}

                <div className="relative w-48">
                    <AnimatePresence>
                        {stack.map((item, index) => {
                            const isTop = index === stack.length - 1;
                            const isPopping = isTop && poppingItem?.id === item.id;
                            const isPeeking = isTop && peekingIndex === index;
                            const borderColor = isTop ? "#9CA3AF" : "#E5E7EB";

                            if (isPopping) {
                                return (
                                    <StackItemMotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        stackLength={stack.length}
                                        animation={ANIMATION.DEFAULT}
                                        exit={ANIMATION.POP.exit}
                                    />
                                );
                            }
                            if (isPeeking) {
                                return (
                                    <StackItemMotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        stackLength={stack.length}
                                        animation={ANIMATION.PEEK}
                                    />
                                );
                            }
                            return (
                                <StackItemMotionWrapper
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    stackLength={stack.length}
                                    animation={{ ...ANIMATION.DEFAULT, borderColor }}
                                >
                                    ...
                                </StackItemMotionWrapper>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            <div className="mt-4 text-gray-600">
                <p>Stack Size: {stack.length}</p>
            </div>
        </div>
    );
}

export default Stack;