"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    Bell,
    Plus,
    Loader2,
    Send,
    History,
    CheckCircle2,
    AlertCircle,
    Clock,
    User,
    Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";

interface NotificationHistory {
    _id: string;
    title: string;
    body: string;
    topic?: string;
    tokens?: string[];
    createdAt: string;
    status: "sent" | "scheduled" | "failed";
}

export default function NotificationsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [history, setHistory] = useState<NotificationHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        body: "",
        targetType: "topic" as "topic" | "tokens",
        targetValue: "farmers", // Default topic
        scheduledAt: "" // New field for scheduling
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("pashumitra_token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchHistory();
    }, [router]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/notifications");
            setHistory(data.data);
        } catch (error) {
            console.error("Failed to fetch notification history", error);
            toast("Error fetching history", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                title: formData.title,
                body: formData.body,
                scheduledAt: formData.scheduledAt || undefined,
                [formData.targetType]: formData.targetType === 'tokens'
                    ? formData.targetValue.split(',').map(t => t.trim())
                    : formData.targetValue
            };

            await api.post("/notifications/schedule", payload);

            toast("Notification scheduled/broadcasted successfully!");
            setIsAddModalOpen(false);
            setFormData({ title: "", body: "", targetType: "topic", targetValue: "farmers", scheduledAt: "" });
            fetchHistory();
        } catch (error) {
            console.error("Error sending notification", error);
            toast("Failed to send notification", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Notifications Central"
                    description="Broadcast messages to farmers via Firebase Cloud Messaging."
                    icon={Bell}
                />
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-emerald text-white font-bold rounded-2xl shadow-lg shadow-brand-emerald/20 hover:scale-105 transition-all w-full md:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" />
                    Send Notification
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
                        <History className="w-5 h-5" />
                    </div>
                    <h2 className="font-black text-slate-900 uppercase tracking-tight">Broadcast History</h2>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-emerald mx-auto mb-4" />
                        <p className="text-slate-500 font-medium italic">Retreiving history logs...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-slate-400 font-medium italic">No notifications sent yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {history.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-4">
                                            <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                                            <p className="text-xs text-slate-500 line-clamp-1">{item.body}</p>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                {item.topic ? (
                                                    <>
                                                        <Users className="w-3.5 h-3.5 text-brand-emerald" />
                                                        <span className="text-xs font-bold text-slate-600">Topic: {item.topic}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <User className="w-3.5 h-3.5 text-brand-accent" />
                                                        <span className="text-xs font-bold text-slate-600">{item.tokens?.length || 0} Devices</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full w-fit">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Delivered</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-xs font-medium text-slate-400">
                                            {new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Send Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
                                            <Send className="w-6 h-6" />
                                        </div>
                                        Broadcast
                                    </h2>
                                    <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                        <Plus className="w-6 h-6 rotate-45" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Title</label>
                                        <input
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 outline-none focus:border-brand-emerald transition-all"
                                            placeholder="Notification Heading"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Message Body</label>
                                        <textarea
                                            required
                                            value={formData.body}
                                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 outline-none focus:border-brand-emerald h-24 resize-none transition-all"
                                            placeholder="Write your message here..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Type</label>
                                            <select
                                                value={formData.targetType}
                                                onChange={(e) => setFormData({ ...formData, targetType: e.target.value as any })}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-emerald transition-all"
                                            >
                                                <option value="topic">Topic Based</option>
                                                <option value="tokens">Direct Tokens</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Value</label>
                                            <input
                                                required
                                                value={formData.targetValue}
                                                onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 outline-none focus:border-brand-emerald transition-all"
                                                placeholder={formData.targetType === 'topic' ? "e.g. farmers" : "Token1, Token2..."}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Schedule For (Optional - Leave blank for immediate)</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.scheduledAt}
                                            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 outline-none focus:border-brand-emerald transition-all"
                                        />
                                    </div>

                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full py-4 bg-brand-emerald text-white font-black rounded-2xl shadow-xl shadow-brand-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                        Dispatch Notification
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
