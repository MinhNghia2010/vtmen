"use client";

import { useState } from "react";
import { Plus, Loader2, Package, User, Phone, MapPin, FileText, Box } from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrder, type CreateOrderPayload } from "@/lib/api";

export default function CreateOrderDrawer({ onCreated }: { onCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<CreateOrderPayload>({
        fullName: "",
        phone: "",
        address: "",
        quantity: 1,
        note: "",
    });

    const handleChange = (field: keyof CreateOrderPayload, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: field === 'quantity' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async () => {
        if (!form.fullName || !form.phone || !form.address) return;
        setLoading(true);
        try {
            const result = await createOrder(form);
            if (result) {
                setOpen(false);
                setForm({ fullName: "", phone: "", address: "", quantity: 1, note: "" });
                onCreated?.();
            }
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
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <button
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
                    aria-label="Tạo đơn hàng mới"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-md">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2 text-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                <Package className="h-4 w-4 text-primary" />
                            </div>
                            Tạo đơn hàng mới
                        </DrawerTitle>
                        <DrawerDescription>
                            Điền thông tin bên dưới để tạo đơn hàng
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="space-y-4 px-4 pb-2">
                        {fields.map((field) => {
                            const Icon = field.icon;
                            return (
                                <div key={field.key} className="space-y-1.5">
                                    <Label htmlFor={field.key} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        <Icon className="h-3.5 w-3.5" />
                                        {field.label}
                                        {field.required && <span className="text-destructive">*</span>}
                                    </Label>
                                    <Input
                                        id={field.key}
                                        type={(field as any).type || "text"}
                                        placeholder={field.placeholder}
                                        value={form[field.key] || ""}
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
                            className="h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tạo đơn hàng
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
