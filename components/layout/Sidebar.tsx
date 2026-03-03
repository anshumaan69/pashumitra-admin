"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    AlertCircle,
    LayoutGrid,
    CalendarDays,
    MessageSquare,
    BookOpen,
    LogOut,
    ChevronRight,
    Bell,
    CreditCard,
    X,
    Settings as SettingsIcon,
    ShieldAlert,
    Save,
    Users as UsersIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDetailsModal } from "@/components/modals/AdminDetailsModal";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/lib/context/UIContext";
import api from "@/lib/api";
import { useToast } from "@/components/ui/Toast";


const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: AlertCircle, label: "Problems", href: "/problems" },
    { icon: LayoutGrid, label: "Categories", href: "/categories" },
    { icon: CalendarDays, label: "Bookings", href: "/bookings" },
    { icon: CreditCard, label: "Subscriptions", href: "/subscriptions" },
    { icon: MessageSquare, label: "Q&A System", href: "/questions" },
    { icon: BookOpen, label: "Posts", href: "/posts" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
];

const superAdminItems = [
    { icon: UsersIcon, label: "User Management", href: "/users" },
    { icon: SettingsIcon, label: "System Settings", href: "/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const { isSidebarOpen, setSidebarOpen } = useUI();
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [adminUser, setAdminUser] = useState<any>(null);
    const [maintenanceText, setMaintenanceText] = useState("");
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem("pashumitra_user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setAdminUser(user);
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get("/settings");
            if (data.success) {
                setMaintenanceText(data.data.maintenanceText);
                setIsMaintenanceMode(data.data.isMaintenanceMode);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("pashumitra_token");
        localStorage.removeItem("pashumitra_user");
        router.push("/login");
    };

    const isSuperAdmin = adminUser?.role === 'super_admin';

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
                <div className="h-24 flex items-center justify-between px-8 bg-gradient-to-b from-white/5 to-transparent shrink-0">
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

                {/* Maintenance Display (for everyone except Super Admin) */}
                {!isSuperAdmin && maintenanceText && (
                    <div className="mx-4 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Notice</span>
                        </div>
                        <p className="text-xs text-red-400/80 leading-relaxed font-medium capitalize">
                            {maintenanceText}
                        </p>
                    </div>
                )}

                {/* Maintenance Mode Badge (for everyone) */}
                {isMaintenanceMode && (
                    <div className="mx-4 mb-4 p-3 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 animate-pulse border border-red-400">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Maintenance ON</span>
                            </div>
                        </div>
                    </div>
                )}

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
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

                    {/* Super Admin Special Sections */}
                    {isSuperAdmin && (
                        <>
                            <div className="px-4 pt-6 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Administration</span>
                            </div>
                            {superAdminItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                            "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                                            isActive
                                                ? "bg-emerald-500/10 text-emerald-400 shadow-inner"
                                                : "hover:text-emerald-400 hover:bg-emerald-500/5"
                                        )}
                                    >
                                        <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-emerald-400" : "text-slate-600 group-hover:text-emerald-500")} />
                                        <span className="font-semibold text-sm">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-sidebar"
                                                className="absolute left-0 w-1.5 h-6 bg-emerald-500 rounded-r-full"
                                            />
                                        )}
                                        <ChevronRight className={cn(
                                            "ml-auto w-4 h-4 transition-all duration-300",
                                            isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0"
                                        )} />
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>

                <div className="mt-auto p-4 space-y-4 shrink-0 bg-slate-950/80 backdrop-blur-md border-t border-white/5">
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
                                {isSuperAdmin ? "Super Administrator" : adminUser?.role === 'admin' ? "System Administrator" : "Admin Staff"}
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

