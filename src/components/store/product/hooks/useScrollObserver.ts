/**
 * @fileoverview Hook that syncs the active category tab with page scroll on
 * the store page.
 *
 * Exports useScrollObserver, which tracks scroll direction and uses an
 * IntersectionObserver on ".category-observer-target" marker elements to
 * determine which product category is currently in view, accounting for the
 * sticky header height, and calls setSelectedTab accordingly.
 */
import { useEffect, useRef } from 'react';

interface UseScrollObserverParams {
    categoryRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
    isSmall: boolean;
    selectedTab: string;
    setSelectedTab: (category: string) => void;
    categories: string[];
    isVisible: boolean;
    isShowDelivery: boolean;
}

export const useScrollObserver = ({
    categoryRefs,
    isSmall,
    selectedTab,
    setSelectedTab,
    categories,
    isVisible,
    isShowDelivery,
}: UseScrollObserverParams) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
    const scrollDirection = useRef<'up' | 'down'>('down');
    
    useEffect(() => {
        // Calculate the sticky header height based on current conditions
        const getStickyHeaderOffset = () => {
            if (isVisible) {
                return isShowDelivery ? 143 : 50;
            } else {
                return 0;
            }
        };

        // Track scroll direction
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            scrollDirection.current = currentScrollY > lastScrollY.current ? 'down' : 'up';
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Clean up previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const headerOffset = getStickyHeaderOffset();
        
        // Single observer for both top and bottom markers
        observerRef.current = new IntersectionObserver(
            (entries) => {
                const intersectingEntries = entries.filter(entry => entry.isIntersecting);
                
                if (intersectingEntries.length === 0) return;
                
                // Group entries by category
                const categoriesInView: Record<string, { top?: Element, bottom?: Element }> = {};
                
                intersectingEntries.forEach(entry => {
                    const category = entry.target.getAttribute('data-category');
                    const position = entry.target.getAttribute('data-category-position');
                    
                    if (category && position) {
                        if (!categoriesInView[category]) {
                            categoriesInView[category] = {};
                        }
                        categoriesInView[category][position as 'top' | 'bottom'] = entry.target;
                    }
                });
                
                // Find the best category to select based on scroll direction
                let targetCategory = '';
                
                if (scrollDirection.current === 'down') {
                    // When scrolling down, prefer categories that have their top marker visible
                    // This means we're entering a new category
                    for (const category of categories) {
                        if (categoriesInView[category]?.top) {
                            targetCategory = category;
                            break; // Take the first one in order
                        }
                    }
                    
                    // If no top markers, use bottom markers
                    if (!targetCategory) {
                        for (const category of categories) {
                            if (categoriesInView[category]?.bottom) {
                                targetCategory = category;
                                break;
                            }
                        }
                    }
                } else {
                    // When scrolling up, prefer categories that have their bottom marker visible
                    // This means we're in the middle/end of a category
                    for (let i = categories.length - 1; i >= 0; i--) {
                        const category = categories[i];
                        if (categoriesInView[category]?.bottom) {
                            targetCategory = category;
                            break; // Take the last one in order
                        }
                    }
                    
                    // If no bottom markers, use top markers
                    if (!targetCategory) {
                        for (let i = categories.length - 1; i >= 0; i--) {
                            const category = categories[i];
                            if (categoriesInView[category]?.top) {
                                targetCategory = category;
                                break;
                            }
                        }
                    }
                }
                
                // Update selected tab if we found a target category
                if (targetCategory && targetCategory !== selectedTab) {
                    setSelectedTab(targetCategory);
                }
            },
            {
                threshold: [0, 0.1, 0.3],
                rootMargin: `-${headerOffset + 10}px 0px -50% 0px`,
            }
        );

        // Observe all marker elements
        const observeElements = () => {
            document.querySelectorAll('.category-observer-target').forEach(element => {
                if (observerRef.current) {
                    observerRef.current.observe(element);
                }
            });
        };

        // Initial observation
        observeElements();

        // Re-observe when categories change
        const timeoutId = setTimeout(observeElements, 100);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [categoryRefs, isSmall, selectedTab, setSelectedTab, categories, isVisible, isShowDelivery]);
};
