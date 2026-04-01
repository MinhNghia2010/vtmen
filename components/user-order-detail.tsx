"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Phone, Package, Clock, MapPin, CheckCircle2, Truck, Send, Box } from "lucide-react";
import { type Order } from "@/lib/orders";
import { fetchActiveOrders, fetchOrderHistory } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { useSwipeBack } from "@/hooks/use-swipe-back";

import { useAnimations } from "@/contexts/animation-context";

const trackingSteps = [
    { key: "pending", label: "Đơn hàng đang chờ", icon: Clock },
    { key: "placed", label: "Đã gửi vào tủ", icon: Package },
    { key: "shipping", label: "Robot đang giao hàng", icon: Truck },
    { key: "delivered", label: "Giao hàng thành công", icon: CheckCircle2 },
];

function getStepStatus(orderStatus: string, stepKey: string) {
    const statusOrder = ["pending", "placed", "shipping", "delivered"];
    const orderIdx = statusOrder.indexOf(orderStatus);
    const stepIdx = statusOrder.indexOf(stepKey);
    if (stepIdx < orderIdx) return "completed";
    if (stepIdx === orderIdx) return "current";
    return "waiting";
}

export default function UserOrderDetail({ orderId }: { orderId: string }) {
    const router = useRouter();
    useSwipeBack('/user/orders');
    const { animationsEnabled } = useAnimations();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        async function loadOrder() {
            setLoading(true);
            try {
                // Wait for the slide animation to finish (300ms) before fetching
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
        }
        loadOrder();
    }, [orderId, animationsEnabled]);

    const handleCallDelivery = () => {
        if (!order) return;
        alert(
            `🚀 Gọi giao hàng!\n\nĐơn: ${order.maDonHang}\nKhách: ${order.tenKhachHang}\nSĐT: ${order.sdt}\nĐịa chỉ: ${order.diaChi}\nSản phẩm: ${order.sanPham}\n\n→ Đã gửi lệnh cho robot!`
        );
        console.log("📦 Robot delivery command sent:", order);
    };

    return (
        <div className={`flex-1 px-4 pt-4 pb-6 ${animationsEnabled ? 'animate-in slide-in-from-right fade-in duration-300 fill-mode-both' : ''}`}>
            {loading ? (
                <div className={`flex h-[60vh] items-center justify-center text-muted-foreground ${animationsEnabled ? 'animate-pulse' : ''}`}>
                    Đang tải dữ liệu...
                </div>
            ) : !order ? (
                <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
                    <Package className="h-16 w-16 text-muted-foreground/30" />
                    <h2 className="text-lg font-semibold text-foreground">Không tìm thấy đơn hàng</h2>
                    <p className="text-sm text-muted-foreground">Mã đơn: {orderId}</p>
                    <button
                        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        onClick={() => {
                            if (window.history.length > 2) {
                                router.back();
                            } else {
                                router.replace('/user/orders');
                            }
                        }}
                    >
                        Quay lại
                    </button>
                </div>
            ) : (
                <div className={`space-y-5 ${animationsEnabled ? 'animate-in fade-in duration-500' : ''}`}>
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (window.history.length > 2) {
                                    router.back();
                                } else {
                                    router.replace('/user/orders');
                                }
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:border-primary hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <h1 className="text-lg font-bold text-foreground">
                            Track &quot;<span className="text-primary">{order.maDonHang}</span>&quot;
                        </h1>
                    </div>

                    {/* Shipper Info */}
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                            <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-1 flex-col">
                            <span className="text-sm font-semibold text-foreground">Robot Delivery</span>
                            <span className="text-xs text-muted-foreground">⭐ 4.8</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-primary/5">
                                <MessageCircle className="h-4 w-4" />
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-primary/5">
                                <Phone className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-3 gap-2.5">
                        {[
                            { icon: Package, value: order.maDonHang, label: "Track ID" },
                            { icon: Box, value: order.soLuong?.toString() || "1", label: "Quantity" },
                            { icon: Clock, value: order.thoiGianDuKien || "N/A", label: "Est. Time" },
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 shadow-sm">
                                <item.icon className="h-4 w-4 text-primary" />
                                <span className="text-center text-xs font-semibold text-foreground break-all">{item.value}</span>
                                <span className="text-[10px] text-muted-foreground">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Timeline */}
                    <div className="space-y-0 pl-1">
                        {trackingSteps.map((step, idx) => {
                            const status = getStepStatus(order.trangThai, step.key);
                            const StepIcon = step.icon;
                            return (
                                <div
                                    key={step.key}
                                    className={`flex gap-4 ${animationsEnabled ? 'animate-in fade-in slide-in-from-left-2' : ''}`}
                                    style={animationsEnabled ? { animationDelay: `${idx * 100}ms`, animationFillMode: "both" } : undefined}
                                >
                                    {/* Dot + Line */}
                                    <div className="flex flex-col items-center">
                                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all ${status === "completed" ? "bg-primary text-primary-foreground shadow-sm" :
                                            status === "current" ? "border-2 border-primary bg-background text-primary ring-4 ring-primary/10" :
                                                "bg-muted text-muted-foreground"
                                            }`}>
                                            <StepIcon className="h-3.5 w-3.5" />
                                        </div>
                                        {idx < trackingSteps.length - 1 && (
                                            <div className={`my-1 h-6 w-0.5 rounded-full ${status === "completed" ? "bg-primary" :
                                                status === "current" ? "bg-linear-to-b from-primary to-border" :
                                                    "bg-border"
                                                }`} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-4 pt-1">
                                        <span className={`text-sm font-medium ${status === "waiting" ? "text-muted-foreground" : "text-foreground"}`}>
                                            {step.label}
                                        </span>
                                        <span className={`block text-xs ${status === "completed" ? "text-primary" :
                                            status === "current" ? "font-medium text-primary" :
                                                "text-muted-foreground"
                                            }`}>
                                            {status === "completed" && "✓ Hoàn thành"}
                                            {status === "current" && "● Hiện tại"}
                                            {status === "waiting" && "Đang chờ"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Customer Info */}
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">Thông tin nhận hàng</h3>
                        {[
                            ["Khách hàng", order.tenKhachHang],
                            ["SĐT", order.sdt],
                            ["Địa chỉ", order.diaChi],
                            ["Sản phẩm", order.sanPham],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between border-b border-border/50 py-2 last:border-b-0">
                                <span className="text-xs text-muted-foreground">{label}</span>
                                <span className="max-w-[60%] text-right text-xs font-medium text-foreground">{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* QR / Action */}
                    {(order.trangThai === "shipping" || order.trangThai === "placed") && (
                        <div>
                            {!showQR ? (
                                <>
                                    {order.trangThai === "placed" && (
                                        <button
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
                                            onClick={handleCallDelivery}
                                        >
                                            <Send className="h-4 w-4" />
                                            Gọi giao hàng
                                        </button>
                                    )}
                                    {order.trangThai === "shipping" && (
                                        <button
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
                                            onClick={() => setShowQR(true)}
                                        >
                                            <Package className="h-4 w-4" />
                                            Mở QR để nhận hàng
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className={`flex flex-col items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-6 ${animationsEnabled ? 'animate-in fade-in zoom-in-95' : ''}`}>
                                    <p className="text-sm font-medium text-primary">Đưa mã QR này cho robot để mở tủ</p>
                                    <div className="rounded-xl bg-white p-4 shadow-md">
                                        <QRCodeSVG
                                            value={order ? JSON.stringify({
                                                action: "open_locker",
                                                maDonHang: order.maDonHang,
                                                tenKhachHang: order.tenKhachHang,
                                                sdt: order.sdt,
                                            }) : ""}
                                            size={180}
                                            level="H"
                                            includeMargin
                                        />
                                    </div>
                                    <p className="text-center text-xs text-muted-foreground leading-relaxed">
                                        Quét QR → Mở tủ → Đóng tủ = Giao hàng thành công!<br />
                                        Robot sẽ tự quay về trạm.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Report */}
                    <button className="w-full rounded-xl border border-destructive/30 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5">
                        Report an Issue
                    </button>
                </div>
            )}
        </div>
    );
}
