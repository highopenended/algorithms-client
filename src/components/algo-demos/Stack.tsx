import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StackItem {
    id: number;
    value: string;
}

export function Stack() {
    const [stack, setStack] = useState<StackItem[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [peekingIndex, setPeekingIndex] = useState<number | null>(null);
    const [nextId, setNextId] = useState(0);
    const [isAnimatingPush, setIsAnimatingPush] = useState(false);
    const [isAnimatingPop, setIsAnimatingPop] = useState(false);
    const [pushingValue, setPushingValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Base animation duration in seconds
    const BASE_DURATION = .5;

    const handlePush = () => {
        if (!inputValue.trim() || isAnimatingPush) return;
        
        const newItem = {
            id: nextId,
            value: inputValue.trim()
        };

        setPushingValue(inputValue.trim());
        setIsAnimatingPush(true);
        setInputValue("");
        
        setTimeout(() => {
            setStack([...stack, newItem]);
            setNextId(nextId + 1);
            setIsAnimatingPush(false);
            setPushingValue("");
        }, BASE_DURATION * 1000);
    };

    const handlePop = () => {
        if (stack.length === 0 || isAnimatingPop) return;
        
        setIsAnimatingPop(true);
        const newStack = [...stack];
        const popped = newStack.pop();
        
        setTimeout(() => {
            if (popped) setStack(newStack);
            setIsAnimatingPop(false);
        }, 200); // Quick pop animation
    };

    const handlePeek = () => {
        if (stack.length === 0) return;
        setPeekingIndex(stack.length - 1);
        setTimeout(() => setPeekingIndex(null), 1000);
    };

    // Calculate input field position for animation start point
    const getInputPosition = () => {
        if (!inputRef.current || !containerRef.current) return { x: 0, y: 0 };
        
        const inputRect = inputRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate center position relative to the container
        return {
            x: inputRect.left - containerRect.left + (inputRect.width / 2) - (containerRect.width / 2),
            y: inputRect.top - containerRect.top - (containerRect.height / 2) + (inputRect.height / 2)
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
                    <motion.div
                        initial={{ 
                            x: getInputPosition().x,
                            y: getInputPosition().y,
                            scale: 1,
                            opacity: 1,
                            backgroundColor: "rgba(255, 255, 255, 0)",
                            borderWidth: 0,
                            borderRadius: "0rem",
                            padding: "0rem",
                            boxShadow: "none",
                            width: "auto"
                        }}
                        animate={{ 
                            x: 0,
                            y: "-1.875rem",
                            zIndex: stack.length+1,
                            scale: 1,
                            opacity: 1,
                            backgroundColor: "rgba(255, 255, 255, 1)",
                            borderWidth: "0.125rem",
                            borderRadius: "0.5rem",
                            padding: "1rem",
                            boxShadow: "0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)",
                            width: "12rem"
                        }}
                        transition={{
                            duration: BASE_DURATION,
                            backgroundColor: { delay: 0, duration: BASE_DURATION * 0.4 },
                            borderWidth: { delay: 0, duration: BASE_DURATION },
                            borderRadius: { delay: 0, duration: BASE_DURATION },
                            padding: { delay: 0, duration: BASE_DURATION },
                            boxShadow: { delay: 0, duration: BASE_DURATION },
                            width: { delay: 0, duration: BASE_DURATION }
                        }}
                        className="absolute z-10 border-gray-400 flex items-center justify-center"
                    >
                        <span className="text-gray-700">{pushingValue}</span>
                    </motion.div>
                )}

                <div className="relative w-48">
                    <AnimatePresence>
                        {stack.map((item, index) => {
                            const isTop = index === stack.length - 1;
                            return (
                                <motion.div
                                    key={item.id}
                                    animate={{ 
                                        opacity: 1,
                                        scale: 1,
                                        y: (stack.length - index) * 20
                                    }}
                                    exit={{ x: 200, opacity: 1 }}
                                    className="absolute bottom-0 w-full"
                                    style={{ zIndex: index }}
                                >
                                    {/* Stack Item */}
                                    <motion.div
                                        animate={isTop && peekingIndex === index ? {
                                            scale: 1.1,
                                            y: "-1rem",
                                            borderColor: "#2563EB",
                                            boxShadow: "0 0 15px 5px rgba(37, 99, 235, 0.3)",
                                            transition: { 
                                                duration: 0.2,
                                                ease: "easeOut"
                                            }
                                        } : {
                                            scale: 1,
                                            y: 0,
                                            borderColor: isTop ? "#9CA3AF" : "#E5E7EB",
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            transition: {
                                                duration: 0.2,
                                                ease: "easeIn"
                                            }
                                        }}
                                        className={`
                                            h-16 w-full bg-white border-2
                                            rounded-lg flex items-center justify-center
                                            transform-gpu preserve-3d
                                        `}
                                        style={{
                                            transform: `translateZ(${index * 2}px)`
                                        }}
                                    >
                                        {/* Ellipses */}
                                        <motion.span 
                                            className="text-gray-700 absolute"
                                            initial={{ scale: 1, opacity: 1 }}
                                            animate={isTop && peekingIndex === index ? {
                                                scale: 0.2,
                                                opacity: 0
                                            } : {
                                                scale: 1,
                                                opacity: 1
                                            }}
                                            transition={{
                                                duration: 0.1,
                                                ease: "easeInOut",
                                                opacity: {
                                                    delay: isTop && peekingIndex === index ? 0 : 0.1
                                                },
                                                scale: {
                                                    delay: isTop && peekingIndex === index ? 0 : 0.1
                                                }
                                            }}
                                        >
                                            ...
                                        </motion.span>
                                        
                                        {/* Value */}
                                        <motion.span 
                                            className="text-gray-700 absolute"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={isTop && peekingIndex === index ? {
                                                scale: [0.2, 1.2, 1],
                                                opacity: [0, 1, 1],
                                                transition: {
                                                    duration: 0.4,
                                                    times: [0, 0.2, 1],
                                                    ease: "easeOut"
                                                }
                                            } : {
                                                scale: 0.5,
                                                opacity: 0,
                                                transition: {
                                                    duration: 0.2,
                                                    ease: "easeIn"
                                                }
                                            }}
                                        >
                                            {item.value}
                                        </motion.span>
                                    </motion.div>
                                </motion.div>
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