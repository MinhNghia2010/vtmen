"use client";

import { useState, useEffect } from "react";
import { Loader2, Pencil, User, Phone, MapPin, FileText, Box } from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrder, type UpdateOrderPayload } from "@/lib/api";
import { type Order } from "@/lib/orders";

interface UpdateOrderDrawerProps {
    order: Order;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated?: () => void;
}

export default function UpdateOrderDrawer({ order, open, onOpenChange, onUpdated }: UpdateOrderDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<UpdateOrderPayload>({
        fullName: "",
        phone: "",
        address: "",
        quantity: 1,
        note: "",
    });

    // Pre-fill form when order changes or drawer opens
    useEffect(() => {
        if (open && order) {
            setForm({
                fullName: order.tenKhachHang || "",
                phone: order.sdt || "",
                address: order.diaChi || "",
                quantity: order.soLuong || 1,
                note: order.sanPham || "",
            });
        }
    }, [open, order]);

    const handleChange = (field: keyof UpdateOrderPayload, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: field === 'quantity' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async () => {
        if (!form.fullName || !form.phone || !form.address) return;
        setLoading(true);
        try {
            const result = await updateOrder(order.maDonHang, form);
            if (result) {
                toast.success(`Đã cập nhật đơn hàng ${order.maDonHang}`, {
                    className: "!text-blue-500 !border-blue-600",
                });
                onOpenChange(false);
                onUpdated?.();
            } else {
                toast.error("Không thể cập nhật đơn hàng. Vui lòng thử lại sau.", {
                    className: "!text-yellow-500 !border-yellow-600",
                });
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi cập nhật đơn hàng", {
                className: "!text-orange-500 !border-orange-600",
            });
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { key: "fullName" as const, label: "Họ tên khách hàng", icon: User, placeholder: "Nguyễn Văn A", required: true },
        { key: "phone" as const, label: "Số điện thoại", icon: Phone, placeholder: "0901234567", required: true },
        { key: "address" as const, label: "Địa chỉ giao hàng", icon: MapPin, placeholder: "123 Nguyễn Huệ, Q1", required: true },
        { key: "quantity" as const, label: "Số lượng", icon: Box, placeholder: "1", type: "number" },
        { key: "note" as const, label: "Sản phẩm / Ghi chú", icon: FileText, placeholder: "iPhone 15 Pro Max" },
    ];

    const isValid = form.fullName && form.phone && form.address;

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <div className="mx-auto w-full max-w-md">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2 text-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                <Pencil className="h-4 w-4 text-blue-500" />
                            </div>
                            Cập nhật đơn hàng
                        </DrawerTitle>
                        <DrawerDescription>
                            Chỉnh sửa thông tin đơn hàng <span className="font-semibold text-foreground">{order.maDonHang}</span>
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="space-y-4 px-4 pb-2">
                        {fields.map((field) => {
                            const Icon = field.icon;
                            return (
                                <div key={field.key} className="space-y-1.5">
                                    <Label htmlFor={`update-${field.key}`} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        <Icon className="h-3.5 w-3.5" />
                                        {field.label}
                                        {field.required && <span className="text-destructive">*</span>}
                                    </Label>
                                    <Input
                                        id={`update-${field.key}`}
                                        type={(field as any).type || "text"}
                                        placeholder={field.placeholder}
                                        value={form[field.key]?.toString() || ""}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                        className="h-11 rounded-xl border-border/60 bg-muted/30 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <DrawerFooter>
                        <Button
                            onClick={handleSubmit}
                            disabled={!isValid || loading}
                            className="h-12 w-full rounded-xl bg-blue-500 text-base font-semibold shadow-md shadow-green-500/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-green-500/30"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Cập nhật đơn hàng
                                </>
                            )}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline" className="h-11 w-full rounded-xl">
                                Hủy bỏ
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
