"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    AlertCircle,
    CalendarCheck,
    MessageSquareText,
    LogOut,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: AlertCircle, label: "Problems", href: "/problems" },
    { icon: CalendarCheck, label: "Bookings", href: "/bookings" },
    { icon: MessageSquareText, label: "Q&A System", href: "/questions" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("pashumitra_token");
        localStorage.removeItem("pashumitra_user");
        router.push("/login");
    };


    return (
        <div className="w-64 h-screen bg-brand-emerald text-white flex flex-col fixed left-0 top-0 z-50">
            <div className="p-8">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <span className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-brand-emerald">P</span>
                    Pashumitra
                </h1>
                <p className="text-brand-accent/60 text-xs font-medium mt-1 uppercase tracking-widest">Admin Panel</p>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative",
                                isActive
                                    ? "bg-white/10 text-brand-accent"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-brand-accent" : "text-white/40")} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-sidebar"
                                    className="absolute left-0 w-1 h-6 bg-brand-accent rounded-r-full"
                                />
                            )}
                            <ChevronRight className={cn(
                                "ml-auto w-4 h-4 transition-transform duration-300",
                                isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                            )} />
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                    <LogOut className="w-5 h-5 text-white/40" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>

        </div>
    );
}
