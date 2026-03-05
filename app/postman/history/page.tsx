"use client";

import OrderHistory from "@/components/order-history";
import { History, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSwipeBack } from "@/hooks/use-swipe-back";

export default function HistoryPage() {
    const router = useRouter();
    useSwipeBack('/postman/orders');

    return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
            {/* Premium Header */}
            <div className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button
                        onClick={() => {
                            if (window.history.length > 2) {
                                router.back();
                            } else {
                                router.replace('/postman/orders');
                            }
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-all hover:border-primary/50 hover:text-primary active:scale-95"
                        aria-label="Quay lại"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 shadow-md shadow-primary/20">
                            <History className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Lịch sử</h1>
                            <p className="text-xs text-muted-foreground">Đơn hàng đã hoàn thành</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order History List */}
            <OrderHistory />
        </div>
    );
}
