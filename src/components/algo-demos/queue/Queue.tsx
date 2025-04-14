import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlgoComponentProps } from "../../../types/algo.types";
import MotionWrapper from "./Queue.MotionWrapper.tsx";
import Controls from "./Queue.Controls.tsx";
import { QUEUE_CONFIG, BUTTON_CONFIG, ANIMATION_CONFIG } from "./Queue.config.ts";

interface QueueItem {
    id: number;
    value: string;
}

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

    const isButtonDisabled = (action: "Enqueue" | "Dequeue" | "Peek" | "Reset" | "AddRandom") => {
        const isAnimating = {
            Enqueue: isAnimatingEnqueue,
            Dequeue: isAnimatingDequeue,
            Peek: isAnimatingPeek,
            Reset: isAnimatingReset,
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
                    (isAnimating.Peek && !BUTTON_CONFIG.PEEK.btnEnabled[action]))) ||
            (action === "Reset" &&
                (actualQueue.length === 0 || isAnimating.Reset || isAnimating.Enqueue || isAnimating.Dequeue || isAnimating.Peek)) ||
            (action === "AddRandom" &&
                (isAnimating.Enqueue || isAnimating.Dequeue || isAnimating.Peek || isAnimating.Reset))
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
        if (e.key === 'Enter' && !isButtonDisabled("Enqueue")) {
            handleEnqueue();
        }
    };

    return (
        <div className="p-6 flex flex-col items-center" style={{ height: screenHeight, maxHeight: screenHeight }}>
            <Controls
                inputValue={inputValue}
                isInputShaking={isInputShaking}
                isAnimatingEnqueue={isAnimatingEnqueue}
                onInputChange={handleInputChange}
                onInputKeyDown={handleInputKeyDown}
                onEnqueue={handleEnqueue}
                onDequeue={handleDequeue}
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
                            Reset Queue
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
                            const isBottom = index === 0;
                            const isDequeuing = isBottom && dequeuingItem?.id === item.id;
                            const isPeeking = isBottom && isAnimatingPeek;
                            const borderColor = isBottom && !isAnimatingEnqueue ? "#9CA3AF" : "#E5E7EB";

                            if (isAnimatingReset) {
                                const randomRotation = Math.random() * 60 - 30;
                                const randomXdrift = Math.random() * 100 - 50;
                                return (
                                    <MotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        queueLength={visibleQueue.length}
                                        animation={ANIMATION_CONFIG.DEFAULT}
                                        config={QUEUE_CONFIG}
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
                                    </MotionWrapper>
                                );
                            }

                            if (isDequeuing) {
                                return (
                                    <MotionWrapper
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        queueLength={visibleQueue.length}
                                        animation={ANIMATION_CONFIG.DEQUEUE.animate}
                                        config={QUEUE_CONFIG}
                                        exit={ANIMATION_CONFIG.DEQUEUE.exit}
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
                                        queueLength={visibleQueue.length}
                                        animation={ANIMATION_CONFIG.PEEK}
                                        config={QUEUE_CONFIG}
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
                                    queueLength={visibleQueue.length}
                                    animation={{ ...ANIMATION_CONFIG.DEFAULT, borderColor }}
                                    config={QUEUE_CONFIG}
                                >
                                    {item.id === recentlyEnqueuedId ? item.value : "..."}
                                </MotionWrapper>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default Queue;  
