import UserOrderDetail from "@/components/user-order-detail";
import { Package } from "lucide-react";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;
    return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
            <UserOrderDetail orderId={orderId} />
        </div>
    );
}
