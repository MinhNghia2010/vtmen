import Link from "next/link"
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import { Badge } from "@/components/ui/badge"
import { Truck, Clock, Package, CheckCircle2, XCircle } from "lucide-react"

import { orders, statusLabels, type OrderStatus } from "@/lib/orders"

const statusStyles: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    placed: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    shipping: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

const statusIcons: Record<OrderStatus, React.ReactNode> = {
    pending: <Clock className="h-3.5 w-3.5" />,
    placed: <Package className="h-3.5 w-3.5" />,
    shipping: <Truck className="h-3.5 w-3.5" />,
    delivered: <CheckCircle2 className="h-3.5 w-3.5" />,
    cancelled: <XCircle className="h-3.5 w-3.5" />,
}

export default function OrderCard() {
    return (
        <div className="flex w-full max-w-md flex-col gap-6 px-4">
            <ItemGroup className="gap-4">
                {orders.map((order, idx) => (
                    <Item
                        key={order.maDonHang}
                        variant="outline"
                        role="listitem"
                        render={<Link href={`orders/${order.maDonHang}`} />}
                        className="animate-in fade-in slide-in-from-bottom-2 transition-all duration-200 hover:border-primary/70"
                        style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
                    >
                        <ItemMedia variant="icon">
                            <Truck className="h-5 w-5 text-primary" />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle className="line-clamp-1">
                                {order.maDonHang} -{" "}
                                <span className="text-muted-foreground">{order.tenKhachHang}</span>
                            </ItemTitle>
                            <ItemDescription>{order.sanPham}</ItemDescription>
                        </ItemContent>
                        <ItemContent className="flex-none text-center">
                            <Badge variant="outline" className={`gap-1 border-transparent ${statusStyles[order.trangThai]}`}>
                                {statusIcons[order.trangThai]}
                                {statusLabels[order.trangThai]}
                            </Badge>
                        </ItemContent>
                    </Item>
                ))}
            </ItemGroup>
        </div>
    )
}
