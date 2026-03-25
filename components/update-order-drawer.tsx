"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Pencil, User, Phone, MapPin, FileText, Box, ChevronDown, X } from "lucide-react";
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
import { LOCATIONS } from "@/lib/locations";

function LocationPicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (address: string) => void;
}) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = LOCATIONS.find((l) => l.address === value);

    const filtered = LOCATIONS.filter((l) => {
        const q = query.toLowerCase();
        return l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q);
    });

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSelect(address: string) {
        onChange(address);
        setOpen(false);
        setQuery("");
    }

    function handleClear(e: React.MouseEvent) {
        e.stopPropagation();
        onChange("");
        setQuery("");
    }

    return (
        <div ref={containerRef} className="relative">
            <div
                className="flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 text-sm transition-all hover:bg-muted/50"
                onClick={() => {
                    setOpen((o) => !o);
                    setQuery("");
                }}
            >
                {selected ? (
                    <span className="truncate text-foreground">{selected.address}</span>
                ) : (
                    <span className="text-muted-foreground">Tìm theo tên hoặc địa chỉ...</span>
                )}
                <div className="ml-2 flex shrink-0 items-center gap-1">
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
            </div>

            {open && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border/60 bg-popover shadow-lg">
                    <div className="border-b border-border/40 p-2">
                        <Input
                            autoFocus
                            placeholder="Tìm kiếm..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="h-8 rounded-lg border-border/40 bg-muted/30 text-sm"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <ul className="max-h-52 overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <li className="py-4 text-center text-sm text-muted-foreground">
                                Không tìm thấy địa điểm
                            </li>
                        ) : (
                            filtered.map((loc) => (
                                <li
                                    key={loc.id}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelect(loc.address);
                                    }}
                                    className={`flex cursor-pointer flex-col rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                                        value === loc.address ? "bg-accent/50" : ""
                                    }`}
                                >
                                    <span className="font-medium leading-snug">{loc.name}</span>
                                    <span className="text-xs text-muted-foreground leading-snug">{loc.address}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

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
            [field]: field === "quantity" ? parseInt(value) || 0 : value,
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
        } catch {
            toast.error("Đã xảy ra lỗi khi cập nhật đơn hàng", {
                className: "!text-orange-500 !border-orange-600",
            });
        } finally {
            setLoading(false);
        }
    };

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
                            Chỉnh sửa thông tin đơn hàng{" "}
                            <span className="font-semibold text-foreground">{order.maDonHang}</span>
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="space-y-4 px-4 pb-2">
                        {/* Họ tên */}
                        <div className="space-y-1.5">
                            <Label htmlFor="update-fullName" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                Họ tên khách hàng
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="update-fullName"
                                placeholder="Nguyễn Văn A"
                                value={form.fullName}
                                onChange={(e) => handleChange("fullName", e.target.value)}
                                className="h-11 rounded-xl border-border/60 bg-muted/30 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Số điện thoại */}
                        <div className="space-y-1.5">
                            <Label htmlFor="update-phone" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" />
                                Số điện thoại
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="update-phone"
                                placeholder="0901234567"
                                value={form.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                className="h-11 rounded-xl border-border/60 bg-muted/30 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Địa chỉ */}
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                Địa chỉ giao hàng
                                <span className="text-destructive">*</span>
                            </Label>
                            <LocationPicker
                                value={form.address ?? ""}
                                onChange={(val) => handleChange("address", val)}
                            />
                        </div>

                        {/* Số lượng */}
                        <div className="space-y-1.5">
                            <Label htmlFor="update-quantity" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Box className="h-3.5 w-3.5" />
                                Số lượng
                            </Label>
                            <Input
                                id="update-quantity"
                                type="number"
                                placeholder="1"
                                value={form.quantity ?? ""}
                                onChange={(e) => handleChange("quantity", e.target.value)}
                                className="h-11 rounded-xl border-border/60 bg-muted/30 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Ghi chú */}
                        <div className="space-y-1.5">
                            <Label htmlFor="update-note" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <FileText className="h-3.5 w-3.5" />
                                Sản phẩm / Ghi chú
                            </Label>
                            <Input
                                id="update-note"
                                placeholder="iPhone 15 Pro Max"
                                value={form.note ?? undefined}
                                onChange={(e) => handleChange("note", e.target.value)}
                                className="h-11 rounded-xl border-border/60 bg-muted/30 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <DrawerFooter>
                        <Button
                            onClick={handleSubmit}
                            disabled={!isValid || loading}
                            className="h-12 w-full rounded-xl bg-blue-500 text-base font-semibold shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
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
