import { useRef, useEffect, useState } from 'react';
import { useSprings, animated, SpringValue } from '@react-spring/web';

const AnimatedSpan = animated.span as React.FC<React.HTMLAttributes<HTMLSpanElement>>;

interface BlurTextProps {
    text?: string;
    delay?: number;
    className?: string;
    animateBy?: 'words' | 'letters';
    direction?: 'top' | 'bottom';
    threshold?: number;
    rootMargin?: string;
    animationFrom?: Record<string, any>;
    animationTo?: Record<string, any>[];
    easing?: (t: number) => number | string;
    onAnimationComplete?: () => void;
    once?: boolean;
}

const BlurText: React.FC<BlurTextProps> = ({
                                               text = '',
                                               delay = 200,
                                               className = '',
                                               animateBy = 'words',
                                               direction = 'top',
                                               threshold = 0.1,
                                               rootMargin = '0px',
                                               animationFrom,
                                               animationTo,
                                               easing = 'easeOutCubic',
                                               onAnimationComplete,
                                               once = true,
                                           }) => {
    const elements = animateBy === 'words' ? text.split(' ') : text.split('');
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);
    const animatedCount = useRef(0);
    const [animationCompleted, setAnimationCompleted] = useState(false);

    // Default animations based on direction
    const defaultFrom: Record<string, any> = direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,-50px,0)' }
        : { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,50px,0)' };

    const defaultTo: Record<string, any>[] = [
        {
            filter: 'blur(5px)',
            opacity: 0.5,
            transform: direction === 'top' ? 'translate3d(0,5px,0)' : 'translate3d(0,-5px,0)',
        },
        { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0,0)' },
    ];

    // Reset animation state if text changes
    useEffect(() => {
        animatedCount.current = 0;
        if (!once) {
            setAnimationCompleted(false);
        }
    }, [text, once]);

    useEffect(() => {
        // Skip if animation already completed and once=true
        if (once && animationCompleted) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (ref.current) {
                        observer.unobserve(ref.current);
                    }
                }
            },
            { threshold, rootMargin }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold, rootMargin, animationCompleted, once]);

    const springs = useSprings(
        elements.length,
        elements.map((_, i) => ({
            from: animationFrom || defaultFrom,
            to: inView && !animationCompleted
                ? async (next: (arg: Record<string, SpringValue<any>>) => Promise<void>) => {
                    for (const step of animationTo || defaultTo) {
                        await next(step);
                    }
                    animatedCount.current += 1;
                    if (animatedCount.current === elements.length) {
                        if (onAnimationComplete) {
                            onAnimationComplete();
                        }
                        if (once) {
                            setAnimationCompleted(true);
                        }
                    }
                }
                : animationCompleted 
                    ? (animationTo?.[animationTo.length - 1] || defaultTo[defaultTo.length - 1]) 
                    : (animationFrom || defaultFrom),
            delay: i * delay,
            config: { easing: easing as any },
        }))
    );

    return (
        <p ref={ref} className={`blur-text ${className} flex flex-wrap`}>
            {springs.map((props, index) => (
                <AnimatedSpan
                    key={index}
                    style={props}
                    className="inline-block will-change-[transform,filter,opacity]"
                >
                    {elements[index] === ' ' ? '\u00A0' : elements[index]}
                    {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
                </AnimatedSpan>
            ))}
        </p>
    );
};

export default BlurText;
