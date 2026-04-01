"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useScrollRestoration() {
    const pathname = usePathname();

    useEffect(() => {
        let scrollValue = "0";

        // Read the saved scroll position for this path
        const isSwipeNav = sessionStorage.getItem("is_swipe_nav") === "true";

        if (isSwipeNav) {
            const savedScroll = sessionStorage.getItem(`scroll_${pathname}`);
            if (savedScroll) {
                const targetY = parseInt(savedScroll, 10);

                // Aggressively attempt to scroll a few times to beat React hydration/painting
                let attempts = 0;
                const scrollInterval = setInterval(() => {
                    window.scrollTo(0, targetY);
                    document.documentElement.scrollTop = targetY;
                    document.body.scrollTop = targetY;
                    attempts++;
                    if (attempts > 5) clearInterval(scrollInterval); // stop after ~250ms
                }, 50);

                setTimeout(() => clearInterval(scrollInterval), 300);
            }
            // Clear the swipe nav flag
            sessionStorage.removeItem("is_swipe_nav");
        } else {
            // Normal click navigation: scroll to top immediately
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }

        // Save scroll position robustly
        const handleScroll = () => {
            // get highest scroll value from window or document
            const currentScroll = Math.max(
                window.scrollY || 0,
                document.documentElement.scrollTop || 0,
                document.body.scrollTop || 0
            );
            scrollValue = currentScroll.toString();
            sessionStorage.setItem(`scroll_${pathname}`, scrollValue);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            sessionStorage.setItem(`scroll_${pathname}`, scrollValue);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [pathname]);
}
