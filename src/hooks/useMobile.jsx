import { useState, useEffect } from 'react';

function useScreenSize() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768); // Consider below 768px as mobile
        };

        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
}

export default useScreenSize;
