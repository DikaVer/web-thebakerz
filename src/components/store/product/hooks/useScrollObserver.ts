import { useEffect } from 'react';

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
    useEffect(() => {
        const headerOffset = isSmall ? 270 : 300;
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries.filter(entry => entry.isIntersecting);
                if (visibleEntries.length > 0) {
                    const sorted = visibleEntries.sort(
                        (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
                    );
                    const topEntry = sorted[0];
                    const category = Object.keys(categoryRefs.current).find(
                        key => categoryRefs.current[key] === topEntry.target
                    );
                    if (category) {
                        setSelectedTab(category);
                    }
                }
            },
            {
                threshold: 1,
                rootMargin: `-${headerOffset}px 0px 0px 0px`,
            }
        );
        Object.values(categoryRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [categoryRefs, isSmall, selectedTab, setSelectedTab]);
};
