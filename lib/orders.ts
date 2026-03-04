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
    ngayGui?: string;
    khoiLuong?: string;
    thoiGianDuKien?: string;
};

export const statusLabels: Record<OrderStatus, string> = {
    pending: "Pending",
    placed: "Placed",
    shipping: "Shipping",
    delivered: "Completed",
    cancelled: "Cancelled",
};

export const orders: Order[] = [
    {
        maDonHang: "SK92863628",
        sanPham: "iPhone 15 Pro Max",
        tenKhachHang: "Nguyen Van A",
        sdt: "0901234567",
        diaChi: "123 Nguyen Hue, Q1, TP.HCM",
        trangThai: "shipping",
        ngayGui: "2026-03-04",
        khoiLuong: "2.4 kg",
        thoiGianDuKien: "2-3 days",
    },
    {
        maDonHang: "SK27367279",
        sanPham: "Samsung Galaxy S24 Ultra",
        tenKhachHang: "Tran Thi B",
        sdt: "0912345678",
        diaChi: "456 Le Loi, Q3, TP.HCM",
        trangThai: "placed",
        ngayGui: "2026-03-03",
        khoiLuong: "1.8 kg",
        thoiGianDuKien: "1-2 days",
    },
    {
        maDonHang: "SK83637729",
        sanPham: "MacBook Air M3",
        tenKhachHang: "Le Van C",
        sdt: "0923456789",
        diaChi: "789 Hai Ba Trung, Q1, TP.HCM",
        trangThai: "delivered",
        ngayGui: "2026-02-28",
        khoiLuong: "1.5 kg",
        thoiGianDuKien: "1 day",
    },
    {
        maDonHang: "SK92746287",
        sanPham: "AirPods Pro 2",
        tenKhachHang: "Pham Thi D",
        sdt: "0934567890",
        diaChi: "12 Vo Van Tan, Q3, TP.HCM",
        trangThai: "delivered",
        ngayGui: "2026-02-27",
        khoiLuong: "0.3 kg",
        thoiGianDuKien: "1 day",
    },
    {
        maDonHang: "SK38379295",
        sanPham: "iPad Pro M4",
        tenKhachHang: "Hoang Van E",
        sdt: "0945678901",
        diaChi: "34 Ly Tu Trong, Q1, TP.HCM",
        trangThai: "placed",
        ngayGui: "2026-03-02",
        khoiLuong: "0.8 kg",
        thoiGianDuKien: "2-3 days",
    },
    {
        maDonHang: "SK73869173",
        sanPham: "Dell XPS 15",
        tenKhachHang: "Vo Thi F",
        sdt: "0956789012",
        diaChi: "56 CMT8, Q10, TP.HCM",
        trangThai: "delivered",
        ngayGui: "2026-02-25",
        khoiLuong: "2.1 kg",
        thoiGianDuKien: "2 days",
    },
    {
        maDonHang: "SK44521890",
        sanPham: "Sony WH-1000XM5",
        tenKhachHang: "Dang Van G",
        sdt: "0967890123",
        diaChi: "78 Dien Bien Phu, Binh Thanh, TP.HCM",
        trangThai: "pending",
        khoiLuong: "0.5 kg",
    },
    {
        maDonHang: "SK55632901",
        sanPham: "Apple Watch Ultra 2",
        tenKhachHang: "Bui Thi H",
        sdt: "0978901234",
        diaChi: "90 Nguyen Dinh Chieu, Q3, TP.HCM",
        trangThai: "shipping",
        ngayGui: "2026-03-04",
        khoiLuong: "0.4 kg",
        thoiGianDuKien: "1 day",
    },
    {
        maDonHang: "SK66743012",
        sanPham: "Xiaomi 14 Ultra",
        tenKhachHang: "Ngo Van I",
        sdt: "0989012345",
        diaChi: "102 Pasteur, Q1, TP.HCM",
        trangThai: "pending",
        khoiLuong: "0.6 kg",
    },
    {
        maDonHang: "SK77854123",
        sanPham: "Logitech MX Master 3S",
        tenKhachHang: "Do Thi K",
        sdt: "0990123456",
        diaChi: "204 Cach Mang Thang 8, Q3, TP.HCM",
        trangThai: "cancelled",
        khoiLuong: "0.4 kg",
    },
    {
        maDonHang: "SK73869173",
        sanPham: "Dell XPS 15",
        tenKhachHang: "Vo Thi F",
        sdt: "0956789012",
        diaChi: "56 CMT8, Q10, TP.HCM",
        trangThai: "delivered",
        ngayGui: "2026-02-25",
        khoiLuong: "2.1 kg",
        thoiGianDuKien: "2 days",
    },
    {
        maDonHang: "SK73869173",
        sanPham: "Dell XPS 15",
        tenKhachHang: "Vo Thi F",
        sdt: "0956789012",
        diaChi: "56 CMT8, Q10, TP.HCM",
        trangThai: "shipping",
        ngayGui: "2026-02-25",
        khoiLuong: "2.1 kg",
        thoiGianDuKien: "2 days",
    },
];
