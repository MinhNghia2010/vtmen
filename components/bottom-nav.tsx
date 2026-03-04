"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Mail, User } from "lucide-react";

const navItems = [
    { href: "/user", label: "Home", icon: Home },
    { href: "/user/orders", label: "My Order", icon: Package },
    { href: "/user/inbox", label: "Inbox", icon: Mail },
    { href: "/user/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="user-bottom-nav">
            {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`user-bottom-nav-item ${isActive ? "active" : ""}`}
                    >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
