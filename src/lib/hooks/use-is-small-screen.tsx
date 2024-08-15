import { useState, useEffect } from "react";

const useIsSmallScreen = (breakpoint = 460) => {
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= breakpoint);
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Initial check

        return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);

    return isSmallScreen;
};

export default useIsSmallScreen;
