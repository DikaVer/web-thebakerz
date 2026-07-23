/**
 * @fileoverview React hook that opens and closes a popover based on mouse hover.
 *
 * Exports useHoverPopover, which tracks hover state across a trigger element and
 * its popover via refs, keeps the popover open while the pointer is within a
 * 20px buffer zone between the two elements, and closes it on page scroll.
 */

import { useState, useRef, useEffect } from 'react';

export const useHoverPopover = () => {
    const [isHovered, setIsHovered] = useState(false);
    const triggerRef = useRef<HTMLElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const trigger = triggerRef.current;
        const popover = popoverRef.current;
        if (!trigger || !popover) return;
        
        const handleMouseEnter = () => {
            setIsHovered(true);
        };
        
        const handleMouseLeave = (e: MouseEvent) => {
            const relatedTarget = e.relatedTarget as Node;
            // Don't close if moving between trigger and popover
            if (
                (trigger.contains(relatedTarget) || popover.contains(relatedTarget))
            ) {
                return;
            }

            // Check if we're moving toward the popover
            const rect = popover.getBoundingClientRect();
            const triggerRect = trigger.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;

            // Create a buffer zone between trigger and popover
            const minX = Math.min(rect.left, triggerRect.left) - 20;
            const maxX = Math.max(rect.right, triggerRect.right) + 20;
            const minY = Math.min(rect.top, triggerRect.top) - 20;
            const maxY = Math.max(rect.bottom, triggerRect.bottom) + 20;

            if (
                x >= minX && x <= maxX &&
                y >= minY && y <= maxY
            ) {
                return;
            }
            
            setIsHovered(false);
        };

        // Add listeners to both trigger and popover
        trigger.addEventListener('mouseenter', handleMouseEnter);
        trigger.addEventListener('mouseleave', handleMouseLeave);
        popover.addEventListener('mouseenter', handleMouseEnter);
        popover.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
            trigger.removeEventListener('mouseenter', handleMouseEnter);
            trigger.removeEventListener('mouseleave', handleMouseLeave);
            popover.removeEventListener('mouseenter', handleMouseEnter);
            popover.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    // Close popover on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (isHovered) {
                setIsHovered(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isHovered]);
    
    return { isHovered, setIsHovered, triggerRef, popoverRef };
}; 