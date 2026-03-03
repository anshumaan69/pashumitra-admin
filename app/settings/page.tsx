"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    Settings,
    ShieldAlert,
    Save,
    Loader2,
    RefreshCcw,
    MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";

export default function SettingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [maintenanceText, setMaintenanceText] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("pashumitra_token");
        if (!token) {
            router.push("/login");
            return;
        }

        const userStr = localStorage.getItem("pashumitra_user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== 'super_admin') {
                toast("Unauthorized: Super Admin access required", "error");
                router.push("/");
                return;
            }
        }

        fetchSettings();
    }, [router]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/settings");
            if (data.success) {
                setMaintenanceText(data.data.maintenanceText);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast("Failed to load settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data } = await api.put("/settings", { maintenanceText });
            if (data.success) {
                toast("Maintenance text updated successfully!");
                // Trigger a local storage update for the sidebar if needed, or just let it be
            }
        } catch (error) {
            console.error("Failed to update settings", error);
            toast("Failed to update maintenance settings", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="System Settings"
                description="Manage global application messages and maintenance status."
                icon={Settings}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Maintenance Message Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white rounded-3xl p-8 border border-border shadow-sm space-y-6"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Maintenance Message</h3>
                            <p className="text-xs text-slate-500 font-medium">This text will be shown to ALL users on the mobile app and admin panel.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Banner Announcement Text</label>
                            <textarea
                                value={maintenanceText}
                                onChange={(e) => setMaintenanceText(e.target.value)}
                                placeholder="Enter message (e.g., Scheduled maintenance today at 6 PM. Apps might be slow.)"
                                className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-brand-emerald transition-all resize-none shadow-inner"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <button
                                onClick={fetchSettings}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-emerald transition-colors"
                            >
                                <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                                Reset to Current
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={isSaving || loading}
                                className="bg-brand-emerald text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Preview Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div className="bg-slate-950 rounded-3xl p-8 text-white border border-white/5 space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Live Preview</h4>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-4 h-4 text-brand-accent" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">App Banner</span>
                                </div>
                                <div className={cn(
                                    "p-3 bg-red-500/10 border border-red-500/20 rounded-xl",
                                    !maintenanceText && "opacity-20 italic"
                                )}>
                                    <p className="text-xs text-red-400 font-bold">
                                        {maintenanceText || "No text set. Banner will be hidden."}
                                    </p>
                                </div>
                            </div>

                            <p className="text-[10px] text-white/20 italic text-center">
                                Banner is displayed on the Top of Home Screen and Sidebar for all users.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
