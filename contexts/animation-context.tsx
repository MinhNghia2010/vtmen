"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";

type AnimationContextType = {
    animationsEnabled: boolean;
    disableAnimations: () => void;
    enableAnimations: () => void;
};

const AnimationContext = createContext<AnimationContextType>({
    animationsEnabled: true,
    disableAnimations: () => { },
    enableAnimations: () => { },
});

export function AnimationProvider({ children }: { children: ReactNode }) {
    const [animationsEnabled, setAnimationsEnabled] = useState(true);
    const pathname = usePathname();

    // Re-evaluate the animation flag every time the route changes
    useEffect(() => {
        const checkFlag = () => {
            const flag = localStorage.getItem("disable_animations");
            if (flag === "true") {
                setAnimationsEnabled(false);
                // Remove immediately so the NEXT navigation defaults to enabled
                localStorage.removeItem("disable_animations");
            } else {
                setAnimationsEnabled(true);
            }
        };

        checkFlag();
    }, [pathname]);

    const disableAnimations = () => {
        setAnimationsEnabled(false);
    };

    const enableAnimations = () => {
        setAnimationsEnabled(true);
    };

    return (
        <AnimationContext.Provider value={{ animationsEnabled, disableAnimations, enableAnimations }}>
            {children}
        </AnimationContext.Provider>
    );
}

export function useAnimations() {
    return useContext(AnimationContext);
}
