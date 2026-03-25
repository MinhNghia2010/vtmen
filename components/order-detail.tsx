"use client";

import { QRCodeSVG } from "qrcode.react";
import { type Order } from "@/lib/orders";
import { fetchActiveOrders, fetchOrderHistory, cancelOrder } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSwipeBack } from "@/hooks/use-swipe-back";

import { useAnimations } from "@/contexts/animation-context";
import { useOrdersWebSocket } from "@/hooks/use-orders-websocket";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import UpdateOrderDrawer from "@/components/update-order-drawer";

const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    shipping: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
};

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-3 border-b border-border last:border-b-0">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{value}</span>
        </div>
    );
}

export default function OrderDetail({ orderId }: { orderId: string }) {
    const router = useRouter();
    useSwipeBack('/postman/orders');
    const { animationsEnabled } = useAnimations();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updateDrawerOpen, setUpdateDrawerOpen] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const loadOrder = async () => {
        setLoading(true);
        try {
            if (animationsEnabled) {
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
            const [active, history] = await Promise.all([
                fetchActiveOrders(),
                fetchOrderHistory()
            ]);
            const allOrders = [...active, ...history];
            const found = allOrders.find((o) => o.maDonHang === orderId);
            if (found) {
                setOrder(found);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrder();
    }, [orderId, animationsEnabled]);

    // Instant update when this order changes via WebSocket
    useOrdersWebSocket((updatedOrders) => {
        const found = updatedOrders.find((o) => o.maDonHang === orderId);
        if (found) {
            setOrder(found);
        }
    });

    const handleCancelOrder = async () => {
        if (!order) return;
        setCancelLoading(true);
        try {
            const success = await cancelOrder(order.maDonHang);
            if (success) {
                toast.success(`Đã hủy đơn hàng ${order.maDonHang}`, {
                    className: "!text-red-500 !border-red-600",
                });
                // Navigate back after cancellation
                if (window.history.length > 2) {
                    router.back();
                } else {
                    router.replace('/postman/orders');
                }
            } else {
                toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi hủy đơn hàng");
        } finally {
            setCancelLoading(false);
        }
    };

    const handleOrderUpdated = () => {
        // Re-fetch to show updated data
        loadOrder();
    };

    return (
        <div className={`flex-1 px-4 pt-4 pb-6 ${animationsEnabled ? 'animate-in slide-in-from-right fade-in duration-300 fill-mode-both' : ''}`}>
            {loading ? (
                <div className={`flex h-[60vh] items-center justify-center text-muted-foreground ${animationsEnabled ? 'animate-pulse' : ''}`}>
                    Đang tải dữ liệu...
                </div>
            ) : !order ? (
                <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
                    <h2 className="text-lg font-semibold text-foreground">Không tìm thấy đơn hàng</h2>
                    <button
                        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        onClick={() => {
                            if (window.history.length > 2) {
                                router.back();
                            } else {
                                router.replace('/postman/orders');
                            }
                        }}
                    >
                        Quay lại
                    </button>
                </div>
            ) : (
                <div className={`space-y-5 ${animationsEnabled ? 'animate-in fade-in duration-500' : ''}`}>
                    {/* Header */}
                    <div className={`flex flex-col gap-4 ${animationsEnabled ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`} style={animationsEnabled ? { animationDelay: "50ms", animationFillMode: "both" } : undefined}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        if (window.history.length > 2) {
                                            router.back();
                                        } else {
                                            router.replace('/postman/orders');
                                        }
                                    }}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:border-primary hover:text-primary"
                                    aria-label="Go back"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <h1 className="text-lg font-bold text-foreground">
                                    Order &quot;<span className="text-primary">{order.maDonHang}</span>&quot;
                                </h1>
                            </div>
                            <span
                                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[order.trangThai] ?? "bg-muted text-muted-foreground"}`}
                            >
                                {order.trangThai}
                            </span>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className={`flex justify-center rounded-xl border border-border bg-white p-6 shadow-sm ${animationsEnabled ? 'animate-in fade-in zoom-in-95' : ''}`} style={animationsEnabled ? { animationDelay: "150ms", animationFillMode: "both" } : undefined}>
                        <QRCodeSVG
                            value={order ? JSON.stringify({
                                maDonHang: order.maDonHang,
                                sanPham: order.sanPham,
                                tenKhachHang: order.tenKhachHang,
                                sdt: order.sdt,
                                diaChi: order.diaChi,
                                trangThai: order.trangThai,
                            }) : ""}
                            size={200}
                            level="H"
                            includeMargin
                        />
                    </div>

                    {/* Order Info */}
                    <div className={`rounded-xl border border-border bg-card p-4 shadow-sm ${animationsEnabled ? 'animate-in fade-in slide-in-from-bottom-3' : ''}`} style={animationsEnabled ? { animationDelay: "250ms", animationFillMode: "both" } : undefined}>
                        <h2 className="mb-2 text-base font-semibold text-foreground">
                            Order Information
                        </h2>
                        <InfoRow label="Order ID" value={order.maDonHang} />
                        <InfoRow label="Product" value={order.sanPham} />
                        <InfoRow label="Quantity" value={order.soLuong?.toString() || "1"} />
                        <InfoRow label="Customer" value={order.tenKhachHang} />
                        <InfoRow label="Phone" value={order.sdt} />
                        <InfoRow label="Address" value={order.diaChi} />
                        <InfoRow label="Status" value={order.trangThai} />
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex gap-2 items-center justify-end ${animationsEnabled ? 'animate-in slide-in-from-bottom-4 duration-200' : ''}`} style={animationsEnabled ? { animationDelay: "350ms", animationFillMode: "both" } : undefined}>
                        {/* Update Order Button */}
                        <Button
                            variant="default"
                            size="lg"
                            className="bg-blue-500 hover:bg-blue-700"
                            onClick={() => setUpdateDrawerOpen(true)}
                        >
                            Update Order
                        </Button>

                        {/* Cancel Order Button with AlertDialog */}
                        <AlertDialog>
                            <AlertDialogTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        Cancel Order
                                    </Button>
                                }
                            />
                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogMedia className="bg-red-100 text-red-600">
                                        <AlertTriangle className="h-5 w-5" />
                                    </AlertDialogMedia>
                                    <AlertDialogTitle>Hủy đơn hàng?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bạn có chắc chắn muốn hủy đơn hàng <span className="font-semibold text-foreground">{order.maDonHang}</span>? Hành động này không thể hoàn tác.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Quay lại</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleCancelOrder}
                                        disabled={cancelLoading}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {cancelLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Đang hủy...
                                            </>
                                        ) : (
                                            "Xác nhận hủy"
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    {/* Update Order Drawer */}
                    <UpdateOrderDrawer
                        order={order}
                        open={updateDrawerOpen}
                        onOpenChange={setUpdateDrawerOpen}
                        onUpdated={handleOrderUpdated}
                    />
                </div>
            )}
        </div>
    );
}
