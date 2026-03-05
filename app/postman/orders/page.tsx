"use client";

import Link from "next/link";
import OrderCard from "@/components/order-card";
import CreateOrderDrawer from "@/components/create-order-drawer";
import { TruckElectric, RefreshCw, History } from "lucide-react";
import { useState } from "react";
import { useSwipeBack } from "@/hooks/use-swipe-back";

export default function Page() {
    const [refreshKey, setRefreshKey] = useState(0);
    useSwipeBack('/app');

    return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
            {/* Premium Header */}
            <div className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 shadow-md shadow-primary/20">
                            <TruckElectric className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Đơn hàng</h1>
                            <p className="text-xs text-muted-foreground">Quản lý giao hàng</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/postman/history"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-all hover:border-primary/50 hover:text-primary active:scale-95"
                            aria-label="Lịch sử"
                        >
                            <History className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={() => setRefreshKey((k) => k + 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-all hover:border-primary/50 hover:text-primary active:scale-95"
                            aria-label="Làm mới"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                        <CreateOrderDrawer onCreated={() => setRefreshKey((k) => k + 1)} />
                    </div>
                </div>
            </div>

            {/* Order List */}
            <div className="flex-1 pt-3 pb-6">
                <OrderCard key={refreshKey} />
            </div>
        </div>
    );
}