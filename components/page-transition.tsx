"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Any real interaction should re-enable normal animations for future clicks
        const enableAnimations = () => {
            document.body.classList.remove('is-swipe-nav');
        };

        // Native browser back button or edge swipe should disable entry animations
        const disableAnimations = () => {
            document.body.classList.add('is-swipe-nav');
        };

        window.addEventListener('mousedown', enableAnimations, { passive: true });
        // Clean touchstart - allow touchend from swipe-hook to override if it was a swipe
        window.addEventListener('touchstart', enableAnimations, { passive: true });
        window.addEventListener('popstate', disableAnimations);

        return () => {
            window.removeEventListener('mousedown', enableAnimations);
            window.removeEventListener('touchstart', enableAnimations);
            window.removeEventListener('popstate', disableAnimations);
        };
    }, []);

    return <>{children}</>;
}
