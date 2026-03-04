import OrderCard from "@/components/order-card";

export default function Page() {
    return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center gap-3 bg-background px-4 py-5 animate-in fade-in slide-in-from-top-2">
                <h1 className="text-xl font-bold text-foreground">My Order</h1>
            </div>
            <OrderCard />
        </div>
    )
}