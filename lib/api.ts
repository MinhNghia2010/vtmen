import { Order, OrderStatus } from "./orders";

export type BackendOrder = {
    id: string;
    createdTime: string;
    completedTime?: string;
    fullName: string;
    phone: string;
    address: string;
    quantity?: number;
    note: string;
    status: string;
    orderCode: string;
};

// Mappers from backend OrderModel to frontend Order
export function mapBackendOrderToFrontend(b: BackendOrder): Order {
    return {
        maDonHang: b.orderCode || b.id,
        sanPham: b.note || "N/A", // Use note for 'sanPham'
        tenKhachHang: b.fullName || "Guest",
        sdt: b.phone || "",
        diaChi: b.address || "",
        // Make sure status matches our literal types, fallback to pending if unrecognized
        trangThai: ["pending", "placed", "shipping", "delivered", "cancelled"].includes(b.status)
            ? (b.status as OrderStatus)
            : "pending",
        ngayGui: b.createdTime,
        thoiGianDuKien: "Unknown", // Backend doesn't have estimate time, just use Unknown
        soLuong: b.quantity, // <--- Added mapping for new quantity field
    };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function fetchActiveOrders(): Promise<Order[]> {
    try {
        const res = await fetch(`${API_BASE}/orders/active`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch active orders");
        const data: BackendOrder[] = await res.json();
        return data.map(mapBackendOrderToFrontend);
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function fetchOrderHistory(): Promise<Order[]> {
    try {
        const res = await fetch(`${API_BASE}/orders/history`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch order history");
        const data: BackendOrder[] = await res.json();
        return data.map(mapBackendOrderToFrontend);
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function completeOrderApi(id: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/orders/${id}/complete`, {
            method: "POST",
        });
        return res.ok;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export type CreateOrderPayload = {
    fullName: string;
    phone: string;
    address: string;
    quantity?: number;
    note: string;
    status?: string;
};

export async function createOrder(payload: CreateOrderPayload): Promise<BackendOrder | null> {
    try {
        const res = await fetch(`${API_BASE}/orders/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...payload,
                status: payload.status || "pending",
            }),
        });
        if (!res.ok) throw new Error("Failed to create order");
        const order: BackendOrder = await res.json();
        return order;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export type UpdateOrderPayload = {
    fullName?: string;
    phone?: string;
    address?: string;
    quantity?: number;
    note?: string;
};

export async function updateOrder(orderId: string, payload: UpdateOrderPayload): Promise<BackendOrder | null> {
    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update order");
        return await res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function cancelOrder(orderId: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
            method: "POST",
        });
        return res.ok;
    } catch (error) {
        console.error(error);
        return false;
    }
}
