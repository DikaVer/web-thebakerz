// hooks/useInView.ts
import { useState, useEffect, useRef, RefObject } from 'react';

export function useInView<T extends HTMLElement = HTMLElement>(
    options?: IntersectionObserverInit
): [RefObject<T>, boolean] {
    const ref = useRef<T>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const currentRef = ref.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.unobserve(currentRef); // Stop observing after intersecting
                }
            },
            options
        );

        observer.observe(currentRef);

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, options]);

    return [ref, isIntersecting];
}
