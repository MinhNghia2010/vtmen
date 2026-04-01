export type OrderStatus =
    | "pending"
    | "placed"      // đã gửi vào tủ, chưa giao
    | "shipping"    // robot đang giao
    | "delivered"
    | "cancelled";

export type Order = {
    maDonHang: string;
    sanPham: string;
    tenKhachHang: string;
    sdt: string;
    diaChi: string;
    trangThai: OrderStatus;
    ngayGui: string;
    thoiGianDuKien: string;
    soLuong?: number; // Added new field for quantity
};

export const statusLabels: Record<OrderStatus, string> = {
    pending: "Pending",
    placed: "Placed",
    shipping: "Shipping",
    delivered: "Completed",
    cancelled: "Cancelled",
};

// Note: The static 'orders' array was removed. Use fetchActiveOrders() and fetchOrderHistory() from lib/api.ts instead.
