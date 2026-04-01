import OrderDetail from "@/components/order-detail";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;
    return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
            <OrderDetail orderId={orderId} />
        </div>
    );
}
