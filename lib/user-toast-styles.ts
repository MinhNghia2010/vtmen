// Match Postman `update-order-drawer` Sonner styling
export const userToastSuccess = { className: "!text-blue-500 !border-blue-600" };
export const userToastWarn = { className: "!text-yellow-500 !border-yellow-600" };
export const userToastError = { className: "!text-orange-500 !border-orange-600" };

export function dispatchSuccess(order: {
    maDonHang: string;
    destinationName?: string;
    diaChi: string;
}, etaSeconds?: number | null): string {
    const dest =
        order.destinationName?.trim() ||
        order.diaChi?.trim() ||
        "điểm nhận hàng";
    const eta =
        etaSeconds != null && Number.isFinite(etaSeconds)
            ? ` Dự kiến ~${Math.round(etaSeconds)}s.`
            : "";
    return `Đơn hàng ${order.maDonHang} đang giao hàng tới ${dest}.${eta}`;
}
