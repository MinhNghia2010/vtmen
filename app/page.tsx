import Link from "next/link";

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <h1 className="text-2xl font-bold text-center text-foreground mb-2">
                    Select Role
                </h1>
                <Link
                    href="/postman/orders"
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
                >
                    📦 Postman
                </Link>
                <Link
                    href="/user/orders"
                    className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-4 text-lg font-semibold text-secondary-foreground shadow-md transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
                >
                    👤 User
                </Link>
            </div>
        </div>
    );
}