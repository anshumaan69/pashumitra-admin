"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import {
    Search,
    Calendar,
    Phone,
    User as UserIcon,
    Tag,
    Clock,
    Filter,
    Loader2,
    CheckCircle2,
    Clock4,
    ExternalLink,
    CalendarCheck,
    MessageSquarePlus,
    X,
    Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";

interface Booking {
    _id: string;
    user: {
        _id: string;
        phoneNumber: string;
        name: string;
    };
    problem: {
        title: string;
    };
    scheduledTime: string;
    status: 'pending' | 'completed';
    createdAt: string;
}

export default function BookingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

    // Q&A modal state
    const [qaModalOpen, setQaModalOpen] = useState(false);
    const [qaBooking, setQaBooking] = useState<Booking | null>(null);
    const [qaForm, setQaForm] = useState({ question: "", answer: "", category: "" });
    const [qaSubmitting, setQaSubmitting] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/bookings/admin/all");
            setBookings(data.data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
        try {
            await api.put(`/bookings/${id}/status`, { status: newStatus });
            fetchBookings();
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const openQaModal = (booking: Booking) => {
        setQaBooking(booking);
        setQaForm({ question: "", answer: "", category: booking.problem?.title || "General" });
        setQaModalOpen(true);
    };

    const handleAddToQA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!qaBooking) return;
        setQaSubmitting(true);
        try {
            await api.post("/posts", {
                question: qaForm.question,
                answer: qaForm.answer,
                category: qaForm.category,
                askedByName: qaBooking.user?.name || "Anonymous",
                askedBy: qaBooking.user?._id || null
            });
            toast("Question added to Knowledge Board!");
            setQaModalOpen(false);
            setQaBooking(null);
            setQaForm({ question: "", answer: "", category: "" });
        } catch (error) {
            console.error("Error adding to Q&A", error);
            toast("Failed to add to Knowledge Board", "error");
        } finally {
            setQaSubmitting(false);
        }
    };


    useEffect(() => {
        const token = localStorage.getItem("pashumitra_token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchBookings();
    }, [router]);

    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.user?.phoneNumber?.includes(searchTerm) ||
            b.problem?.title?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <div className="space-y-6">
                <PageHeader
                    title="Call Bookings"
                    description="Monitor and manage all animal health calls."
                    icon={CalendarCheck}
                    search={{
                        value: searchTerm,
                        onChange: setSearchTerm,
                        placeholder: "Search by farmer, phone or category..."
                    }}
                    action={
                        <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-border overflow-x-auto no-scrollbar max-w-full">
                            {['all', 'pending', 'completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status as any)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                        statusFilter === status
                                            ? "bg-white dark:bg-brand-emerald text-brand-emerald dark:text-white shadow-sm"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    }

                />


                <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-end">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Total Records: {filteredBookings.length}
                        </div>
                    </div>


                    <div className="overflow-x-auto no-scrollbar">

                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                                    <th className="px-6 py-4">Farmer / User</th>
                                    <th className="px-6 py-4">Problem Category</th>
                                    <th className="px-6 py-4">Scheduled Slot</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Q&A</th>
                                    <th className="px-6 py-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-emerald mx-auto mb-2" />
                                            <p className="text-slate-400 font-medium italic">Loading bookings...</p>
                                        </td>
                                    </tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-slate-400 font-medium italic">
                                            No bookings found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    <AnimatePresence>
                                        {filteredBookings.map((booking, idx) => (
                                            <motion.tr
                                                key={booking._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                            <UserIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{booking.user?.name || "Anonymous User"}</p>
                                                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                {booking.user?.phoneNumber}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                                                            <Tag className="w-3.5 h-3.5" />
                                                        </div>
                                                        <p className="text-sm font-semibold text-slate-700">{booking.problem?.title || "General Query"}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-brand-emerald" />
                                                            {new Date(booking.scheduledTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </p>
                                                        <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(booking.scheduledTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id, booking.status)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit shadow-sm transition-all hover:scale-105 active:scale-95",
                                                            booking.status === 'completed'
                                                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                                                : "bg-orange-500 text-white hover:bg-orange-600"
                                                        )}
                                                    >
                                                        {booking.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock4 className="w-3 h-3" />}
                                                        {booking.status}
                                                    </button>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <button className="p-2 text-slate-400 hover:text-brand-emerald hover:bg-emerald-50 rounded-lg transition-all"
                                                        onClick={() => openQaModal(booking)}
                                                        title="Add to Knowledge Board"
                                                    >
                                                        <MessageSquarePlus className="w-4 h-4" />
                                                    </button>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 text-slate-400 hover:text-brand-emerald hover:bg-emerald-50 rounded-lg transition-all">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add to Q&A Modal */}
            <AnimatePresence>
                {qaModalOpen && qaBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setQaModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
                                                <MessageSquarePlus className="w-6 h-6" />
                                            </div>
                                            Add to Q&A
                                        </h2>
                                        <p className="text-slate-500 font-medium text-sm mt-1 ml-13">Post a question from this booking to the Knowledge Board</p>
                                    </div>
                                    <button
                                        onClick={() => setQaModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Asked By</p>
                                        <p className="font-bold text-blue-700">{qaBooking!.user?.name || "Anonymous"}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleAddToQA} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-3 py-1 rounded-lg w-fit">
                                            Category
                                        </label>
                                        <input
                                            required
                                            value={qaForm.category}
                                            onChange={(e) => setQaForm({ ...qaForm, category: e.target.value })}
                                            className="w-full text-black bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-emerald/10 focus:border-brand-emerald transition-all"
                                            placeholder="e.g. Feeding, Breeding, Medical..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-3 py-1 rounded-lg w-fit">
                                            Question
                                        </label>
                                        <input
                                            required
                                            value={qaForm.question}
                                            onChange={(e) => setQaForm({ ...qaForm, question: e.target.value })}
                                            className="w-full text-black bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-emerald/10 focus:border-brand-emerald transition-all"
                                            placeholder="What did the farmer ask?"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-3 py-1 rounded-lg w-fit">
                                            Answer
                                        </label>
                                        <textarea
                                            required
                                            value={qaForm.answer}
                                            onChange={(e) => setQaForm({ ...qaForm, answer: e.target.value })}
                                            className="w-full text-black bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-emerald/10 focus:border-brand-emerald transition-all h-32 resize-none shadow-inner"
                                            placeholder="Provide the expert answer..."
                                        />
                                    </div>
                                    <button
                                        disabled={qaSubmitting}
                                        type="submit"
                                        className="w-full py-4 bg-brand-emerald text-white font-black rounded-2xl shadow-xl shadow-brand-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {qaSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                        Publish to Knowledge Board
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
