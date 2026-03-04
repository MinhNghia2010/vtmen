"use client";

import { QRCodeSVG } from "qrcode.react";
import { orders, type Order } from "@/lib/orders";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
    const order = orders.find((o) => o.maDonHang === orderId);

    if (!order) {
        notFound();
    }

    const qrData = JSON.stringify({
        maDonHang: order.maDonHang,
        sanPham: order.sanPham,
        tenKhachHang: order.tenKhachHang,
        sdt: order.sdt,
        diaChi: order.diaChi,
        trangThai: order.trangThai,
    });

    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-6">
            <div className="w-full max-w-md space-y-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:underline hover:text-foreground transition-colors animate-in fade-in slide-in-from-left-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to orders
                </button>
                {/* Header */}
                <div className="text-center space-y-1 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "50ms", animationFillMode: "both" }}>
                    <h1 className="text-2xl font-bold text-foreground">
                        Order {order.maDonHang}
                    </h1>
                    <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[order.trangThai] ?? "bg-muted text-muted-foreground"}`}
                    >
                        {order.trangThai}
                    </span>
                </div>

                {/* QR Code */}
                <div className="flex justify-center rounded-xl border border-border bg-white p-6 shadow-sm animate-in fade-in zoom-in-95" style={{ animationDelay: "150ms", animationFillMode: "both" }}>
                    <QRCodeSVG
                        value={qrData}
                        size={200}
                        level="H"
                        includeMargin
                    />
                </div>

                {/* Order Info */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm animate-in fade-in slide-in-from-bottom-3" style={{ animationDelay: "250ms", animationFillMode: "both" }}>
                    <h2 className="mb-2 text-base font-semibold text-foreground">
                        Order Information
                    </h2>
                    <InfoRow label="Order ID" value={order.maDonHang} />
                    <InfoRow label="Product" value={order.sanPham} />
                    <InfoRow label="Customer" value={order.tenKhachHang} />
                    <InfoRow label="Phone" value={order.sdt} />
                    <InfoRow label="Address" value={order.diaChi} />
                    <InfoRow label="Status" value={order.trangThai} />
                </div>
            </div>
        </div>
    );
}
