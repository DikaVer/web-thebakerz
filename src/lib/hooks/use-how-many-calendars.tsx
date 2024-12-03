import { useState, useEffect } from "react";

const useHowManyCalendars = () => {
    const [number, setNumber] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setNumber(Math.min(Math.floor(window.innerWidth / 140), 7));
            } else {
                setNumber(Math.floor(window.innerWidth / 150) + 2);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Initial check

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return number;
};

export default useHowManyCalendars;