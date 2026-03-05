"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isSwipeNav, setIsSwipeNav] = useState(false);

    useEffect(() => {
        // Check if the navigation was triggered by a swipe
        const flag = sessionStorage.getItem('is_swipe_navigation');
        if (flag === 'true') {
            setIsSwipeNav(true);
            // Clear the flag so it only applies once per navigation
            sessionStorage.removeItem('is_swipe_navigation');
        } else {
            setIsSwipeNav(false);
        }
    }, [pathname]);

    // If it was a swipe, we strip out the entry animation classes by wrapping the page
    // but the simplest way to disable animate-in for the whole page is adding a context or 
    // simply passing a prop, OR we can conditionally render a wrapper that resets animations.

    // An elegant approach in CSS is to use a data attribute to disable animations globally for this render path.
    useEffect(() => {
        if (isSwipeNav) {
            document.body.classList.add('disable-animations');
            // Remove it after a tick so subsequent actions animate
            const timer = setTimeout(() => {
                document.body.classList.remove('disable-animations');
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isSwipeNav]);

    return <>{children}</>;
}
