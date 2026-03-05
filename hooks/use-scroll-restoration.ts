"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useScrollRestoration() {
    const pathname = usePathname();

    useEffect(() => {
        // Read the saved scroll position for this path
        const savedScroll = sessionStorage.getItem(`scroll_${pathname}`);
        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll, 10));
        }

        // Save scroll position before unmount/navigation
        const handleScroll = () => {
            sessionStorage.setItem(`scroll_${pathname}`, window.scrollY.toString());
        };

        // We use a throttle or just passive listener
        window.addEventListener("scroll", handleScroll, { passive: true });

        // Save on unmount to be safe
        return () => {
            sessionStorage.setItem(`scroll_${pathname}`, window.scrollY.toString());
            window.removeEventListener("scroll", handleScroll);
        };
    }, [pathname]);
}
