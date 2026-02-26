import { useState, useEffect } from "react";
import { Bell, User, CheckCircle2, MessageSquare, Calendar, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { useHeader } from "@/lib/context/HeaderContext";
import { useUI } from "@/lib/context/UIContext";
import { AdminDetailsModal } from "@/components/modals/AdminDetailsModal";

export function Navbar() {
    const { title, description } = useHeader();
    const { toggleSidebar, isSidebarOpen } = useUI();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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

    // Mock Notifications List
    const notifications = [
        { id: 1, type: 'booking', message: 'New booking from Farmer Anshu', time: '5m ago', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 2, type: 'question', message: 'New question: "Can I give mustard cake..."', time: '12m ago', icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 3, type: 'system', message: 'System security patch successful', time: '1h ago', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <header className="h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-border fixed top-0 right-0 left-0 lg:left-64 z-40 px-4 sm:px-8 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none truncate max-w-[150px] sm:max-w-none">
                        {title || "Dashboard"}
                    </h1>
                    {description && (
                        <p className="hidden xs:block text-[9px] sm:text-[10px] font-black text-brand-emerald uppercase tracking-widest mt-0.5 opacity-80 italic truncate max-w-[150px] sm:max-w-none">
                            {description}
                        </p>
                    )}
                </div>
            </div>


            <div className="flex items-center gap-4">

                {/* Notifications Button & Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={cn(
                            "p-2.5 rounded-xl transition-all relative group",
                            isNotificationsOpen
                                ? "bg-brand-emerald text-white shadow-lg shadow-brand-emerald/20"
                                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        )}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-accent rounded-full border-2 border-white dark:border-slate-950"></span>
                    </button>

                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <>
                                <div className="fixed inset-0 z-[-1]" onClick={() => setIsNotificationsOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border overflow-hidden"
                                >
                                    <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
                                        <h4 className="font-black text-xs uppercase tracking-widest text-slate-500">Recent Activity</h4>
                                        <span className="px-2 py-0.5 bg-brand-accent/20 text-brand-accent rounded-full text-[9px] font-black uppercase">3 New</span>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.map((n) => (
                                            <div key={n.id} className="p-4 border-b border-border last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", n.bg)}>
                                                    <n.icon className={cn("w-5 h-5", n.color)} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight italic">{n.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full py-3 bg-brand-emerald/5 text-brand-emerald font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-emerald/10 transition-colors">
                                        View All Alerts
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Section */}
                <div
                    onClick={() => setIsAdminModalOpen(true)}
                    className="flex items-center gap-3 pl-6 border-l border-border group cursor-pointer transition-opacity hover:opacity-80"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-brand-accent uppercase tracking-[0.15em] mb-0.5">Admin Staff</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {adminUser?.name || "System Administrator"}
                        </p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-brand-emerald/10 border-2 border-brand-emerald/10 flex items-center justify-center text-brand-emerald shadow-sm transition-transform group-hover:scale-105">
                        <User className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Admin Details Modal */}
            <AdminDetailsModal
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
                adminUser={adminUser}
            />
        </header>
    );
}


