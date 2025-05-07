import { useEffect, useRef } from 'react';

interface UseScrollObserverParams {
    categoryRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
    isSmall: boolean;
    selectedTab: string;
    setSelectedTab: (category: string) => void;
}

export const useScrollObserver = ({
                                      categoryRefs,
                                      isSmall,
                                      selectedTab,
                                      setSelectedTab,
                                  }: UseScrollObserverParams) => {
    // Keep track of scroll position and direction
    const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
    const scrollingDirection = useRef<'up' | 'down'>('down');
    // Track bottom observers
    const bottomObservers = useRef<IntersectionObserver | null>(null);
    
    useEffect(() => {
        const headerOffset = isSmall ? 270 : 300;
        
        // Track scroll direction
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            scrollingDirection.current = currentScrollY > lastScrollY.current ? 'down' : 'up';
            lastScrollY.current = currentScrollY;
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Create a separate observer for bottom markers
        // This helps with determining when we're leaving a category
        bottomObservers.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const category = entry.target.getAttribute('data-category');
                    if (!category) return;
                    
                    // If scrolling up and a bottom marker is entering view
                    if (scrollingDirection.current === 'up' && entry.isIntersecting) {
                        if (category !== selectedTab) {
                            setSelectedTab(category);
                        }
                    }
                });
            },
            {
                threshold: [0.1, 0.5],
                rootMargin: `-${headerOffset + 50}px 0px 0px 0px`, // Focus on top area
            }
        );
        
        // Find and observe all bottom markers
        document.querySelectorAll('.category-observer-target.bottom').forEach(el => {
            if (bottomObservers.current) {
                bottomObservers.current.observe(el);
            }
        });
        
        // Create an observer that will detect when the target elements cross the threshold
        const observer = new IntersectionObserver(
            (entries) => {
                // Only process entries for top markers
                const topEntries = entries.filter(entry => 
                    entry.target.getAttribute('data-category-position') !== 'bottom'
                );
                
                // Find entries that are intersecting
                const intersectingEntries = topEntries.filter(entry => entry.isIntersecting);
                
                if (intersectingEntries.length > 0) {
                    // Sort entries differently based on scroll direction
                    const sortedEntries = [...intersectingEntries].sort((a, b) => {
                        // When scrolling down, prioritize entries from top to bottom
                        // When scrolling up, prioritize entries from bottom to top
                        if (scrollingDirection.current === 'down') {
                            return a.boundingClientRect.top - b.boundingClientRect.top;
                        } else {
                            return b.boundingClientRect.bottom - a.boundingClientRect.bottom;
                        }
                    });
                    
                    // Get the most relevant entry based on scroll direction
                    const relevantEntry = sortedEntries[0];
                    
                    // Find which category this element belongs to
                    const category = Object.keys(categoryRefs.current).find(
                        key => categoryRefs.current[key] === relevantEntry.target
                    );
                    
                    if (category && category !== selectedTab) {
                        // When scrolling up, only update if the category is significantly in view
                        if (scrollingDirection.current === 'up') {
                            const rect = relevantEntry.boundingClientRect;
                            const viewportHeight = window.innerHeight;
                            const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
                            const visibilityRatio = visibleHeight / rect.height;
                            
                            // Only update when the category is at least 40% visible when scrolling up
                            if (visibilityRatio >= 0.4 || rect.top <= headerOffset + 50) {
                                setSelectedTab(category);
                            }
                        } else {
                            // When scrolling down, update as soon as the category becomes visible
                            setSelectedTab(category);
                        }
                    }
                } else if (scrollingDirection.current === 'down') {
                    // Only use proximity logic when scrolling down to avoid unwanted tab changes
                    // If no entries are intersecting, check if we should select one
                    // based on proximity to the viewport
                    const allEntries = Array.from(topEntries);
                    const entryDistances = allEntries.map(entry => {
                        const rect = entry.boundingClientRect;
                        // Calculate distance from top of viewport (negative when above viewport)
                        const distanceFromViewport = rect.top - headerOffset;
                        return { entry, distance: Math.abs(distanceFromViewport) };
                    });
                    
                    // Sort by closest to viewport
                    entryDistances.sort((a, b) => a.distance - b.distance);
                    
                    if (entryDistances.length > 0) {
                        const closestEntry = entryDistances[0].entry;
                        const category = Object.keys(categoryRefs.current).find(
                            key => categoryRefs.current[key] === closestEntry.target
                        );
                        
                        if (category && category !== selectedTab) {
                            setSelectedTab(category);
                        }
                    }
                }
            },
            {
                threshold: [0, 0.1, 0.4, 0.5], 
                rootMargin: `-${headerOffset}px 0px -40% 0px`,
            }
        );
        
        // Observe all category ref elements (top markers)
        Object.values(categoryRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });
        
        return () => {
            observer.disconnect();
            if (bottomObservers.current) {
                bottomObservers.current.disconnect();
            }
            window.removeEventListener('scroll', handleScroll);
        };
    }, [categoryRefs, isSmall, selectedTab, setSelectedTab]);
};
