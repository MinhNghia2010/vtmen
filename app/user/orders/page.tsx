"use client";

import UserOrderList from "@/components/user-order";
import CreateOrderDrawer from "@/components/create-order-drawer";
import { Package, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useSwipeBack } from "@/hooks/use-swipe-back";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useAnimations } from "@/contexts/animation-context";

export default function Page() {
    const [refreshKey, setRefreshKey] = useState(0);
    const { enableAnimations } = useAnimations();

    useSwipeBack('/');
    useScrollRestoration();

    const handleRefresh = () => {
        enableAnimations();
        setRefreshKey((k) => k + 1);
    };

    return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
            {/* Premium Header */}
            <div className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 shadow-md shadow-primary/20">
                            <Package className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Đơn hàng của tôi</h1>
                            <p className="text-xs text-muted-foreground">Theo dõi đơn hàng của tôi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-all hover:border-primary/50 hover:text-primary active:scale-95"
                            aria-label="Làm mới"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                        <CreateOrderDrawer onCreated={handleRefresh} />
                    </div>
                </div>
            </div>

            {/* Order List */}
            <div className="flex-1 pt-3 pb-6">
                <UserOrderList key={refreshKey} />
            </div>
        </div>
    );
}