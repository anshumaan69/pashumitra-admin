"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    AlertCircle, // Keep AlertCircle for Problems
    LayoutGrid, // Added for Categories
    CalendarDays, // Changed from CalendarCheck for Bookings
    MessageSquare,
    BookOpen,
    LogOut,
    ChevronRight,
    Bell, // Added for Notifications
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDetailsModal } from "@/components/modals/AdminDetailsModal";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/lib/context/UIContext";


const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: AlertCircle, label: "Problems", href: "/problems" },
    { icon: LayoutGrid, label: "Categories", href: "/categories" }, // Added Categories link
    { icon: CalendarDays, label: "Bookings", href: "/bookings" }, // Changed icon to CalendarDays
    { icon: MessageSquare, label: "Q&A System", href: "/questions" },
    { icon: BookOpen, label: "Posts", href: "/posts" },
    { icon: Bell, label: "Notifications", href: "/notifications" }, // Added Notifications link
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isSidebarOpen, setSidebarOpen } = useUI();
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [adminUser, setAdminUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("pashumitra_user");
        if (userStr) {
            try {
                setAdminUser(JSON.parse(userStr));
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("pashumitra_token");
        localStorage.removeItem("pashumitra_user");
        router.push("/login");
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={cn(
                "fixed left-0 top-0 h-screen w-64 bg-slate-950 text-slate-400 z-[60] border-r border-white/5 flex flex-col transition-all duration-300 transform lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Brand Header */}
                <div className="h-24 flex items-center justify-between px-8 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-emerald flex items-center justify-center text-white shadow-lg shadow-brand-emerald/20 rotate-3">
                            <span className="font-black text-xl">PM</span>
                        </div>
                        <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">Pashumitra</h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                                    isActive
                                        ? "bg-white/5 text-brand-emerald shadow-inner"
                                        : "hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-brand-emerald" : "text-slate-500 group-hover:text-slate-300")} />
                                <span className="font-semibold text-sm">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-sidebar"
                                        className="absolute left-0 w-1.5 h-6 bg-brand-emerald rounded-r-full shadow-[2px_0_10px_rgba(16,185,129,0.3)]"
                                    />
                                )}
                                <ChevronRight className={cn(
                                    "ml-auto w-4 h-4 transition-all duration-300",
                                    isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0"
                                )} />
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto p-4 space-y-4">
                    {/* Admin Profile Section */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsAdminModalOpen(true)}
                        className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left flex items-center gap-3 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 flex items-center justify-center border border-brand-emerald/10 text-brand-emerald shadow-inner">
                            <span className="font-bold text-lg">{adminUser?.name?.[0] || "A"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white truncate">{adminUser?.name || "Admin Staff"}</p>
                            <p className="text-[10px] text-brand-emerald/60 uppercase font-black tracking-widest truncate">
                                {adminUser?.role === 'admin' ? "System Administrator" : "Admin Staff"}
                            </p>
                        </div>
                    </motion.button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Secure Logout</span>
                    </button>
                </div>

                {/* User Details Modal */}
                <AdminDetailsModal
                    isOpen={isAdminModalOpen}
                    onClose={() => setIsAdminModalOpen(false)}
                    adminUser={adminUser}
                />
            </aside>
        </>
    );
}

