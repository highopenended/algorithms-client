import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QueueItem {
    id: number;
    value: string;
}

// Config constants
const QUEUE_CONFIG = {
    verticalSpacing: 16,
    enqueueOffsetY: "-3rem",
};

const BUTTON_CONFIG = {
    ENQUEUE: { btnEnabled: { Enqueue: false, Dequeue: false, Peek: false } },
    DEQUEUE: { btnEnabled: { Enqueue: false, Dequeue: false, Peek: false } },
    PEEK: { btnEnabled: { Enqueue: false, Dequeue: true, Peek: false } },
    RESET: { btnEnabled: { Enqueue: true, Dequeue: true, Peek: true } },
};

// Animation constants
const ANIMATION_CONFIG = {
    ENQUEUE: {
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
    DEQUEUE: {
        baseDuration: 0.5,
        initial: {
            y: 0,
            opacity: 1,
            borderColor: "#9CA3AF",
        },
        animate: {
            x: -20,
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
            x: -200,
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
        x: "-0.5rem",
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

const QueueItemMotionWrapper = ({
    item,
    index,
    queueLength,
    animation,
    exit,
    children,
}: {
    item: QueueItem;
    index: number;
    queueLength: number;
    animation: any;
    exit?: any;
    children?: React.ReactNode;
}) => (
    <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1, y: (queueLength - index) * QUEUE_CONFIG.verticalSpacing }}
        exit={exit}
        className="absolute bottom-0 w-full"
        style={{ zIndex: queueLength - index }}
    >
        <motion.div
            animate={animation}
            className="h-12 w-full bg-white border-2 rounded-lg flex items-center justify-center transform-gpu preserve-3d"
        >
            <span className="text-gray-700">{children || item.value}</span>
        </motion.div>
    </motion.div>
);

const Floor = ({ queueLength }: { queueLength: number }) => (
    <motion.div
        initial={false}
        animate={{ y: (queueLength * QUEUE_CONFIG.verticalSpacing) + 2 }}
        className="absolute bottom-0 w-[120%] h-[0.5px] bg-gray-700 left-[-10%]"
        style={{ zIndex: -1 }}
    />
);

const EnqueuingAnimation = ({
    position,
    value,
    zIndex,
}: {
    position: { x: number; y: number };
    value: string;
    zIndex: number;
}) => (
    <motion.div
        initial={{ x: position.x, y: position.y, scale: 1, opacity: 1, ...ANIMATION_CONFIG.ENQUEUE.initial }}
        animate={{ x: 0, y: QUEUE_CONFIG.enqueueOffsetY, zIndex: -1, scale: 1, opacity: 1, ...ANIMATION_CONFIG.ENQUEUE.animate }}
        transition={{
            duration: ANIMATION_CONFIG.ENQUEUE.baseDuration,
            backgroundColor: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration * 0.4 },
            borderWidth: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration },
            borderRadius: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration },
            padding: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration },
            boxShadow: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration },
            width: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration },
        }}
        className="absolute z-[-1] border-gray-400 flex items-center justify-center"
    >
        <span className="text-gray-700">{value}</span>
    </motion.div>
);

export function Queue() {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [nextId, setNextId] = useState(0);
    const [isAnimatingEnqueue, setIsAnimatingEnqueue] = useState(false);
    const [isAnimatingDequeue, setIsAnimatingDequeue] = useState(false);
    const [isAnimatingPeek, setIsAnimatingPeek] = useState(false);
    const [isAnimatingReset, setIsAnimatingReset] = useState(false);
    const [isInputShaking, setIsInputShaking] = useState(false);
    const [dequeuingItem, setDequeuingItem] = useState<QueueItem | null>(null);
    const [enqueuingValue, setEnqueuingValue] = useState("");
    const [recentlyEnqueuedId, setRecentlyEnqueuedId] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate delay per item for reset animation
    const resetDelayPerItem = queue.length > 1 
        ? ANIMATION_CONFIG.RESET.totalDuration / (queue.length - 1)
        : 0;

    // Focus input on component mount and whenever animations complete
    useEffect(() => {
        inputRef.current?.focus();
    }, [isAnimatingEnqueue, isAnimatingDequeue, isAnimatingPeek]);

    const handleEnqueue = () => {
        if (!inputValue.trim() || isAnimatingEnqueue) return;
        const newItem = { id: nextId, value: inputValue.trim() };
        setEnqueuingValue(inputValue.trim());
        setIsAnimatingEnqueue(true);
        setInputValue("");
        setTimeout(() => {
            setQueue([...queue, newItem]);
            setNextId(nextId + 1);
            setIsAnimatingEnqueue(false);
            setEnqueuingValue("");
            setRecentlyEnqueuedId(newItem.id);
            setTimeout(() => {
                setRecentlyEnqueuedId(null);
            }, 500);
        }, ANIMATION_CONFIG.ENQUEUE.baseDuration * 1000);
    };

    const handleDequeue = () => {
        if (queue.length === 0 || isAnimatingDequeue) return;
        const itemToDequeue = queue[0]; // Get the first item (bottom of the queue)
        setDequeuingItem(itemToDequeue);
        setIsAnimatingDequeue(true);
        setTimeout(() => {
            setQueue(queue.slice(1)); // Remove the first item
            setIsAnimatingDequeue(false);
            setDequeuingItem(null);
        }, ANIMATION_CONFIG.DEQUEUE.baseDuration * 1000);
    };

    const handlePeek = () => {
        if (queue.length === 0) return;
        setIsAnimatingPeek(true);
        setTimeout(() => {
            setIsAnimatingPeek(false);
        }, ANIMATION_CONFIG.PEEK.baseDuration * 1000);
    };

    const handleReset = () => {
        if (queue.length === 0 || isAnimatingReset) return;
        setIsAnimatingReset(true);
        
        setTimeout(() => {
            setQueue([]);
            setIsAnimatingReset(false);
            inputRef.current?.focus();
        }, ANIMATION_CONFIG.RESET.initialDelay * 1000);
    };

    const handleAddRandom = () => {
        if (isAnimatingEnqueue || isAnimatingDequeue || isAnimatingPeek) return;
        
        const randomValues = Array.from({ length: 5 }, () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const length = Math.floor(Math.random() * 3) + 1;
            return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        });

        const newItems = randomValues.map((value, index) => ({
            id: nextId + index,
            value
        }));

        setNextId(nextId + 5);
        setQueue([...queue, ...newItems]);
    };

    const getInputPosition = () => {
        if (!inputRef.current || !containerRef.current) return { x: 0, y: 0 };
        const inputRect = inputRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const x = (inputRect.left + inputRect.width / 2) - (containerRect.left + containerRect.width / 2);
        const y = (inputRect.top-inputRect.height) - (containerRect.top + inputRect.height/2);
        
        return { x, y };
    };

    const isButtonDisabled = (action: "Enqueue" | "Dequeue" | "Peek") => {
        const isAnimating = {
            Enqueue: isAnimatingEnqueue,
            Dequeue: isAnimatingDequeue,
            Peek: isAnimatingPeek,
        };

        return (
            (action === "Enqueue" &&
                (!inputValue.trim() || (isAnimating.Enqueue && !BUTTON_CONFIG.ENQUEUE.btnEnabled[action]))) ||
            (action === "Dequeue" &&
                (queue.length === 0 ||
                    (isAnimating.Enqueue && !BUTTON_CONFIG.ENQUEUE.btnEnabled[action]) ||
                    (isAnimating.Dequeue && !BUTTON_CONFIG.DEQUEUE.btnEnabled[action]) ||
                    (isAnimating.Peek && !BUTTON_CONFIG.PEEK.btnEnabled[action]))) ||
            (action === "Peek" &&
                (queue.length === 0 ||
                    (isAnimating.Enqueue && !BUTTON_CONFIG.ENQUEUE.btnEnabled[action]) ||
                    (isAnimating.Dequeue && !BUTTON_CONFIG.DEQUEUE.btnEnabled[action]) ||
                    (isAnimating.Peek && !BUTTON_CONFIG.PEEK.btnEnabled[action])))
        );
    };

    return (
        <div className="p-6 flex flex-col items-center">
            <div className="flex flex-col gap-4 mb-8 items-center w-full max-w-lg">
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
                        if (e.key === 'Enter' && !isButtonDisabled("Enqueue")) {
                            handleEnqueue();
                        }
                    }}
                    disabled={isAnimatingEnqueue}
                    className="px-4 py-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 text-center w-full"
                    placeholder="Enter value..."
                />
                <div className="flex justify-center gap-2 w-full">
                    <button
                        onClick={handleEnqueue}
                        disabled={isButtonDisabled("Enqueue")}
                        className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition-colors disabled:opacity-50 flex-1 min-w-[5rem]"
                    >
                        Enqueue
                    </button>
                    <button
                        onClick={handleDequeue}
                        disabled={isButtonDisabled("Dequeue")}
                        className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-colors disabled:opacity-50 flex-1 min-w-[5rem]"
                    >
                        Dequeue
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
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center text-sm whitespace-nowrap">
                    <span className="w-[120px] text-right">
                        <button
                            onClick={handleReset}
                            disabled={queue.length === 0 || isAnimatingReset || isAnimatingEnqueue || isAnimatingDequeue || isAnimatingPeek}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:hover:text-gray-500 transition-colors"
                        >
                            Reset Queue
                        </button>
                    </span>
                    <span className="w-[20px] text-center text-gray-300">|</span>
                    <span className="w-[120px] text-left">
                        <button
                            onClick={handleAddRandom}
                            disabled={isAnimatingEnqueue || isAnimatingDequeue || isAnimatingPeek}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:hover:text-gray-500 transition-colors"
                        >
                            Add Random
                        </button>
                    </span>
                </div>
                <p className="text-gray-600 font-medium">Queue Size: {queue.length}</p>
            </div>

            <div ref={containerRef} className="relative w-full max-w-md h-[400px] flex items-start justify-center pt-20" style={{ perspective: "1000px" }}>
                {isAnimatingEnqueue && (
                    <EnqueuingAnimation position={getInputPosition()} value={enqueuingValue} zIndex={queue.length + 1} />
                )}

                <div className="relative w-64" style={{ transformStyle: "preserve-3d" }}>
                    <Floor queueLength={queue.length} />
                    <AnimatePresence>
                        {queue.map((item, index) => {
                            const isBottom = index === 0; // First item is at the bottom
                            const isDequeuing = isBottom && dequeuingItem?.id === item.id;
                            const isPeeking = isBottom && isAnimatingPeek;
                            const borderColor = isBottom && !isAnimatingEnqueue ? "#9CA3AF" : "#E5E7EB";

                            if (isAnimatingReset) {
                                const randomRotation = Math.random() * 60 - 30;
                                const randomXdrift = Math.random() * 100 - 50;
                                return (
                                    <QueueItemMotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        queueLength={queue.length}
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
                                    </QueueItemMotionWrapper>
                                );
                            }

                            if (isDequeuing) {
                                return (
                                    <QueueItemMotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        queueLength={queue.length}
                                        animation={ANIMATION_CONFIG.DEQUEUE.animate}
                                        exit={ANIMATION_CONFIG.DEQUEUE.exit}
                                    >
                                        {item.value}
                                    </QueueItemMotionWrapper>
                                );
                            }

                            if (isPeeking) {
                                return (
                                    <QueueItemMotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        queueLength={queue.length}
                                        animation={ANIMATION_CONFIG.PEEK}
                                    >
                                        {item.value}
                                    </QueueItemMotionWrapper>
                                );
                            }

                            return (
                                <QueueItemMotionWrapper
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    queueLength={queue.length}
                                    animation={{ ...ANIMATION_CONFIG.DEFAULT, borderColor }}
                                >
                                    {item.id === recentlyEnqueuedId ? item.value : "..."}
                                </QueueItemMotionWrapper>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default Queue;  
