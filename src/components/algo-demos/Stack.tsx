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
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handlePush = () => {
        if (!inputValue.trim() || isAnimatingPush) return;
        
        const newItem = {
            id: nextId,
            value: inputValue.trim()
        };

        setIsAnimatingPush(true);
        
        // Reset after animation completes
        setTimeout(() => {
            setStack([...stack, newItem]);
            setNextId(nextId + 1);
            setInputValue("");
            setIsAnimatingPush(false);
        }, 2000); // Match animation duration
    };

    const handlePop = () => {
        if (stack.length === 0) return;
        
        const newStack = [...stack];
        const popped = newStack.pop();
        if (popped) setStack(newStack);
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

        // Calculate position relative to the container
        return {
            x: inputRect.left - containerRect.left - (containerRect.width / 2) + (inputRect.width / 2),
            y: inputRect.top - containerRect.top - (containerRect.height / 2)
        };
    };

    return (
        <div className="p-6 flex flex-col items-center">
            {/* Controls */}
            <div className="flex gap-4 mb-8 items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isAnimatingPush}
                    className="px-4 py-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={stack.length === 0}
                    className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                    Pop
                </button>
                <button
                    onClick={handlePeek}
                    disabled={stack.length === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    Peek
                </button>
            </div>

            {/* Stack Visualization Area */}
            <div ref={containerRef} className="relative w-full max-w-md h-[400px] flex items-center justify-center">
                {/* Push Animation */}
                {isAnimatingPush && (
                    <motion.div
                        initial={{ 
                            x: getInputPosition().x,
                            y: getInputPosition().y,
                            scale: 1,
                            opacity: 1 
                        }}
                        animate={{ 
                            x: 0,
                            y: -30,
                            zIndex: stack.length+1,
                            scale: 1,
                            opacity: 1
                        }}
                        transition={{ duration: 2 }}
                        className="absolute z-10 h-16 w-48 bg-white border-2 border-green-400 rounded-lg shadow-lg flex items-center justify-center"
                    >
                        <span className="text-gray-700">{inputValue}</span>
                    </motion.div>
                )}

                {/* Stack Items */}
                <div className="relative w-48">
                    <AnimatePresence>
                        {stack.map((item, index) => {
                            const isTop = index === stack.length - 1;
                            return (
                                <motion.div
                                    key={item.id}
                                    // initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ 
                                        opacity: 1,
                                        scale: 1,
                                        y: (stack.length - index) * 20 // Stack from bottom up
                                    }}
                                    exit={{ x: 200, opacity: 1 }}
                                    className="absolute bottom-0 w-full"
                                    style={{ zIndex: index }}
                                >
                                    <motion.div
                                        animate={isTop && peekingIndex === index ? {
                                            rotateY: [0, 180, 180, 0],
                                            transition: { 
                                                duration: 1,
                                                times: [0, 0.4, 0.6, 1]
                                            }
                                        } : {}}
                                        className={`
                                            h-16 w-full bg-white border-2 
                                            ${isTop ? 'border-gray-400' : 'border-gray-300'} 
                                            rounded-lg shadow-lg flex items-center justify-center
                                            transform-gpu preserve-3d
                                        `}
                                        style={{
                                            transform: `translateZ(${index * 2}px)`,
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                        }}
                                    >
                                        <span className="text-gray-700">
                                            {(isTop && peekingIndex === index) ? item.value : "..."}
                                        </span>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Stack Info */}
            <div className="mt-4 text-gray-600">
                <p>Stack Size: {stack.length}</p>
            </div>
        </div>
    );
}

export default Stack;
