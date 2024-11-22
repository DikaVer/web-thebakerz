import React, { useState, useEffect } from 'react';
import { IconTrash, IconPlus, IconMinus } from "@/components/ui/icons";
import { useDebouncedCallback } from 'use-debounce';

interface StepperProps {
    product_id: string;
    onHoverChange: (isHovering: boolean) => void;
    onDelete: () => void;
    onUpdate: (id: string, amount: number) => void;
    isUpdating: (isUpdating: boolean) => void;
    amount: number;
}

const Stepper: React.FC<StepperProps> = ({ product_id, onHoverChange, onDelete, onUpdate, isUpdating, amount }) => {
    const [count, setCount] = useState(amount);

    // Debounced callback for updating the cart
    const handleUpdateCart = useDebouncedCallback(() => {
        onUpdate(product_id, count);
    }, 1000); // Debounce for 1 second

    // Effect to trigger cart update when count changes
    useEffect(() => {
        if (count !== amount) {
            handleUpdateCart();
        }
    }, [count]);

    useEffect(() => {
        setCount(amount);
    }, [amount]);

    const handleIncrement = () => {
        isUpdating(true);
        setCount(prevCount => Math.min(prevCount + 1, 99));
    }
    const handleDecrement = () => {
        isUpdating(true);
        setCount(prevCount => Math.max(prevCount - 1, 0));
    }
    const handleReset = () => onDelete();

    return (
        <div
            className="flex rounded-xl w-20 h-7 bg-grayComp justify-between items-center overflow-hidden"
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
        >
            {count === 1 ? (
                <>
                    <button onClick={handleReset} className="hover:bg-red-200 transition duration-300 focus:outline-none pl-1 py-1">
                        <IconTrash className="w-5 h-5" />
                    </button>
                    <div className="text-center font-medium">{count}</div>
                    <button onClick={handleIncrement} className="hover:bg-grayCompHover transition duration-300 focus:outline-none pr-1 py-1">
                        <IconPlus className="w-5 h-5" />
                    </button>
                </>
            ) : (
                <>
                    <button onClick={handleDecrement} disabled={count <= 0} className="hover:bg-grayCompHover transition duration-300 focus:outline-none pl-1 py-1">
                        <IconMinus className="w-5 h-5" />
                    </button>
                    <div className="text-center font-medium">{count}</div>
                    <button onClick={handleIncrement} disabled={count >= 99} className="hover:bg-grayCompHover transition duration-300 focus:outline-none pr-1 py-1">
                        <IconPlus className="w-5 h-5" />
                    </button>
                </>
            )}
        </div>
    );
};

export default Stepper;
