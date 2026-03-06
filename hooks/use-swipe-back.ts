"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function useSwipeBack(fallbackUrl?: string) {
    const router = useRouter();
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (touchStartX.current === null || touchStartY.current === null) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX.current;
            const deltaY = touchEndY - touchStartY.current;

            // Helper to set flag before navigation
            const navigate = (action: () => void) => {
                localStorage.setItem("disable_animations", "true");
                sessionStorage.setItem("is_swipe_nav", "true");
                action();
            };

            // Right swipe for back navigation (or left swipe if user explicitly meant it, but right swipe is standard).
            // Many users say "swipe left" meaning "swipe the previous page back in" from the left.
            // We'll support a standard right swipe (finger moves right, deltaX > 75).
            // We also require it to be mostly horizontal.
            // Swipe Right -> Go Back
            if (deltaX > 75 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
                navigate(() => {
                    if (window.history.length > 2) {
                        router.back();
                    } else if (fallbackUrl) {
                        router.replace(fallbackUrl);
                    } else {
                        router.back();
                    }
                });
            } else if (deltaX < -75 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
                // Swipe Left -> Go Forward
                navigate(() => router.forward());
            }
        };

        // Passive false so we can potentially call e.preventDefault() if needed later
        document.addEventListener("touchstart", handleTouchStart, { passive: true });
        document.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [router, fallbackUrl]);
}
