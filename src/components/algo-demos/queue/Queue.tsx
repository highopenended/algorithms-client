import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlgoComponentProps } from "../../../types/algo.types";

interface QueueItem {
    id: number;
    value: string;
}

// Config constants
const QUEUE_CONFIG = {
    verticalSpacing: 16,
    enqueueOffsetY: "12rem",
    maxFloorOffset: 320, // Maximum distance the floor can move down (in pixels)
    maxBottomPosition: 0, // Will be set dynamically based on screen height
    itemHeight: 48, // Height of each item (3rem = 48px)
    minSpacing: 8, // Minimum spacing between items when compressed
    topItemSeparation: 32, // Constant separation for top item
    bottomItemSeparation: 32, // Constant separation for bottom item
    minCompressionRatio: 0.3, // Minimum allowed compression (30% of normal spacing)
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
    DEQUEUE: {
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
}) => {
    const getHorizontalOffset = () => {
        if (queueLength <= 1) return 0;
        if (index === queueLength - 1) return "-1rem"; // Top item
        if (index === 0) return "1rem"; // Bottom item
        return 0; // Middle items
    };

    // Calculate vertical spacing based on queue size
    const getVerticalPosition = () => {
        const maxItemsAtNormalSpacing = Math.floor(QUEUE_CONFIG.maxBottomPosition / QUEUE_CONFIG.verticalSpacing);
        
        if (queueLength <= maxItemsAtNormalSpacing) {
            // Normal spacing
            return Math.min((queueLength - index) * QUEUE_CONFIG.verticalSpacing, QUEUE_CONFIG.maxBottomPosition);
        } else {
            // Calculate available space and required spacing
            const availableSpace = QUEUE_CONFIG.maxBottomPosition - QUEUE_CONFIG.verticalSpacing - QUEUE_CONFIG.bottomItemSeparation - QUEUE_CONFIG.topItemSeparation;
            const middleItemCount = queueLength - 3; // Excluding top, bottom, and second-from-bottom items
            const requiredSpacing = availableSpace / middleItemCount;
            
            // Calculate compression ratio
            const compressionRatio = requiredSpacing / QUEUE_CONFIG.verticalSpacing;
            
            // If compression would exceed minimum ratio, use minimum spacing
            const effectiveSpacing = compressionRatio < QUEUE_CONFIG.minCompressionRatio
                ? QUEUE_CONFIG.verticalSpacing * QUEUE_CONFIG.minCompressionRatio
                : requiredSpacing;

            // Position items based on their role
            if (index === 0) {
                // Bottom item
                return QUEUE_CONFIG.maxBottomPosition;
            } else if (index === 1) {
                // Second from bottom item
                return QUEUE_CONFIG.maxBottomPosition - QUEUE_CONFIG.bottomItemSeparation;
            } else if (index === queueLength - 1) {
                // Top item - keep it at a fixed distance from maxBottomPosition
                return QUEUE_CONFIG.verticalSpacing;
            } else {
                // Middle items use effective spacing
                const bottomItemsHeight = QUEUE_CONFIG.maxBottomPosition - QUEUE_CONFIG.bottomItemSeparation;
                // Calculate how many items we can show at minimum compression
                const maxVisibleMiddleItems = Math.floor(availableSpace / (QUEUE_CONFIG.verticalSpacing * QUEUE_CONFIG.minCompressionRatio));
                
                if (compressionRatio < QUEUE_CONFIG.minCompressionRatio) {
                    // We're at max compression, show only visible items
                    if (index - 1 <= maxVisibleMiddleItems) {
                        // This item is within visible range
                        return bottomItemsHeight - (index - 1) * (QUEUE_CONFIG.verticalSpacing * QUEUE_CONFIG.minCompressionRatio);
                    } else {
                        // This item is beyond visible range, stack it with the last visible item
                        return bottomItemsHeight - maxVisibleMiddleItems * (QUEUE_CONFIG.verticalSpacing * QUEUE_CONFIG.minCompressionRatio);
                    }
                } else {
                    // Normal compression
                    return Math.min(bottomItemsHeight - (index - 1) * effectiveSpacing, QUEUE_CONFIG.maxBottomPosition);
                }
            }
        }
    };

    return (
        <motion.div
            initial={false}
            animate={{ 
                opacity: 1, 
                scale: 1, 
                y: getVerticalPosition(),
                x: getHorizontalOffset()
            }}
            exit={exit}
            className="absolute top-0 w-full"
            style={{ zIndex: queueLength - index + 10 }}
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

const Floor = ({ queueLength }: { queueLength: number }) => {
    const getFloorPosition = () => {
        if (queueLength === 0) return QUEUE_CONFIG.verticalSpacing + QUEUE_CONFIG.itemHeight;
        
        // Position floor below the last item
        const lastItemPosition = Math.min(queueLength * QUEUE_CONFIG.verticalSpacing, QUEUE_CONFIG.maxBottomPosition);
        const floorOffset = QUEUE_CONFIG.itemHeight + (QUEUE_CONFIG.verticalSpacing / 2);
        return Math.min(lastItemPosition + floorOffset, QUEUE_CONFIG.maxBottomPosition + QUEUE_CONFIG.itemHeight);
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

const EnqueuingAnimation = ({
    position,
    value,
    isFirstItem
}: {
    position: { x: number; y: number };
    value: string;
    isFirstItem: boolean;
}) => (
    <motion.div
        initial={{ x: position.x, y: position.y, scale: 1, opacity: 1, zIndex: 0, ...ANIMATION_CONFIG.ENQUEUE.initial }}
        animate={{ x: isFirstItem ? 0 : -20, y: QUEUE_CONFIG.enqueueOffsetY, zIndex: 0, scale: 1, opacity: 1, ...ANIMATION_CONFIG.ENQUEUE.animate }}
        transition={{
            duration: ANIMATION_CONFIG.ENQUEUE.baseDuration,
            backgroundColor: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration * 0.4 },
            borderWidth: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration },
            borderRadius: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration },
            padding: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration },
            boxShadow: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration },
            width: { delay: 0, duration: ANIMATION_CONFIG.ENQUEUE.baseDuration },
        }}
        className="absolute border-gray-400 flex items-center justify-center"
    >
        <span className="text-gray-700">{value}</span>
    </motion.div>
);

export function Queue({ screenHeight }: AlgoComponentProps) {
    const [actualQueue, setActualQueue] = useState<QueueItem[]>([]);
    const [visibleQueue, setVisibleQueue] = useState<QueueItem[]>([]);
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
    const prevScreenHeightRef = useRef(screenHeight);

    // Calculate container height based on screen height
    const containerHeight = Math.max(300, screenHeight - 280);

    // Adjust spacing based on container height
    const verticalSpacing = Math.min(16, Math.max(8, containerHeight / 20));
    QUEUE_CONFIG.verticalSpacing = verticalSpacing;
    // Leave space for the item height, floor line (0.5px) and some padding (16px)
    QUEUE_CONFIG.maxBottomPosition = containerHeight - QUEUE_CONFIG.itemHeight - 16;
    QUEUE_CONFIG.maxFloorOffset = QUEUE_CONFIG.maxBottomPosition;
    QUEUE_CONFIG.topItemSeparation = Math.max(16, verticalSpacing * 2);
    QUEUE_CONFIG.bottomItemSeparation = Math.max(16, verticalSpacing * 2);

    // Calculate maximum visible items based on available space
    const getMaxVisibleItems = () => {
        const availableSpace = QUEUE_CONFIG.maxFloorOffset - QUEUE_CONFIG.verticalSpacing - QUEUE_CONFIG.bottomItemSeparation - QUEUE_CONFIG.topItemSeparation;
        return Math.floor(availableSpace / (QUEUE_CONFIG.verticalSpacing * QUEUE_CONFIG.minCompressionRatio)) + 3;
    };

    // Update visible queue only when screen height actually changes
    useEffect(() => {
        if (prevScreenHeightRef.current === screenHeight) {
            return;
        }
        
        const maxVisible = getMaxVisibleItems();
        
        if (actualQueue.length <= maxVisible) {
            setVisibleQueue(actualQueue);
        } else {
            const startIndex = Math.max(0, actualQueue.length - maxVisible);
            setVisibleQueue(actualQueue.slice(startIndex));
        }

        prevScreenHeightRef.current = screenHeight;
    }, [screenHeight, actualQueue]);

    const handleEnqueue = () => {
        if (!inputValue.trim() || isAnimatingEnqueue) return;
        const newItem = { id: nextId, value: inputValue.trim() };
        setEnqueuingValue(inputValue.trim());
        setIsAnimatingEnqueue(true);
        setInputValue("");

        // Always add to actual queue
        const newActualQueue = [...actualQueue, newItem];
        setActualQueue(newActualQueue);

        // Only add to visible queue if under max visible items
        const maxVisible = getMaxVisibleItems();
        if (visibleQueue.length < maxVisible) {
            setTimeout(() => {
                setVisibleQueue([...visibleQueue, newItem]);
                setNextId(nextId + 1);
                setIsAnimatingEnqueue(false);
                setEnqueuingValue("");
                setRecentlyEnqueuedId(newItem.id);
                setTimeout(() => {
                    setRecentlyEnqueuedId(null);
                }, 500);
            }, ANIMATION_CONFIG.ENQUEUE.baseDuration * 1000);
        } else {
            // Still wait for animation to complete before clearing states
            setTimeout(() => {
                setNextId(nextId + 1);
                setIsAnimatingEnqueue(false);
                setEnqueuingValue("");
            }, ANIMATION_CONFIG.ENQUEUE.baseDuration * 1000);
        }
    };

    const handleDequeue = () => {
        if (actualQueue.length === 0 || isAnimatingDequeue) return;

        // Always remove from actual queue
        const [dequeuedItem, ...newActualQueue] = actualQueue;
        setActualQueue(newActualQueue);

        // Handle visible queue
        if (visibleQueue.length > 0) {
            setDequeuingItem(visibleQueue[0]);
            setIsAnimatingDequeue(true);

            setTimeout(() => {
                const [_, ...newVisibleQueue] = visibleQueue;
                
                // If we have more items in actual queue than visible queue can show,
                // add the next item from actual queue to visible queue
                const maxVisible = getMaxVisibleItems();
                if (newActualQueue.length > newVisibleQueue.length && newVisibleQueue.length < maxVisible) {
                    newVisibleQueue.push(newActualQueue[newVisibleQueue.length]);
                }
                
                setVisibleQueue(newVisibleQueue);
                setIsAnimatingDequeue(false);
                setDequeuingItem(null);
            }, ANIMATION_CONFIG.DEQUEUE.baseDuration * 1000);
        }
    };

    const handlePeek = () => {
        if (actualQueue.length === 0) return;
        setIsAnimatingPeek(true);
        setTimeout(() => {
            setIsAnimatingPeek(false);
        }, ANIMATION_CONFIG.PEEK.baseDuration * 1000);
    };

    const handleReset = () => {
        if (actualQueue.length === 0 || isAnimatingReset) return;
        setIsAnimatingReset(true);
        
        setTimeout(() => {
            setActualQueue([]);
            setVisibleQueue([]);
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

        // Add all items to actual queue
        setActualQueue([...actualQueue, ...newItems]);

        // Add items to visible queue only if there's space
        const maxVisible = getMaxVisibleItems();
        const availableSpace = maxVisible - visibleQueue.length;
        if (availableSpace > 0) {
            const itemsToAdd = newItems.slice(0, availableSpace);
            setVisibleQueue([...visibleQueue, ...itemsToAdd]);
        }

        setNextId(nextId + 5);
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
                (actualQueue.length === 0 ||
                    (isAnimating.Enqueue && !BUTTON_CONFIG.ENQUEUE.btnEnabled[action]) ||
                    (isAnimating.Dequeue && !BUTTON_CONFIG.DEQUEUE.btnEnabled[action]) ||
                    (isAnimating.Peek && !BUTTON_CONFIG.PEEK.btnEnabled[action]))) ||
            (action === "Peek" &&
                (actualQueue.length === 0 ||
                    (isAnimating.Enqueue && !BUTTON_CONFIG.ENQUEUE.btnEnabled[action]) ||
                    (isAnimating.Dequeue && !BUTTON_CONFIG.DEQUEUE.btnEnabled[action]) ||
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
            <div className="flex flex-col items-center gap-2 mb-4">
                <div className="flex items-center justify-center text-sm whitespace-nowrap">
                    <span className="w-[120px] text-right">
                        <button
                            onClick={handleReset}
                            disabled={actualQueue.length === 0 || isAnimatingReset || isAnimatingEnqueue || isAnimatingDequeue || isAnimatingPeek}
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
                <p className="text-gray-600 font-medium">Queue Size: {actualQueue.length}</p>
            </div>

            {isAnimatingEnqueue && (
                <EnqueuingAnimation 
                    position={{x:0,y:0}} 
                    value={enqueuingValue} 
                    isFirstItem={actualQueue.length === 1}
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
                    <Floor queueLength={visibleQueue.length} />
                    <AnimatePresence>
                        {visibleQueue.map((item, index) => {
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
                                        queueLength={visibleQueue.length}
                                        animation={ANIMATION_CONFIG.DEFAULT}
                                        exit={{
                                            ...ANIMATION_CONFIG.RESET.exit,
                                            rotate: randomRotation,
                                            x: randomXdrift,
                                            transition: {
                                                ...ANIMATION_CONFIG.RESET.exit.transition,
                                                delay: index * (ANIMATION_CONFIG.RESET.totalDuration / visibleQueue.length),
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
                                        queueLength={visibleQueue.length}
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
                                        queueLength={visibleQueue.length}
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
                                    queueLength={visibleQueue.length}
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
