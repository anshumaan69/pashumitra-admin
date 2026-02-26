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
    ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Booking {
    _id: string;
    user: {
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
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Call Bookings</h2>
                    <p className="text-slate-500 font-medium">Monitor and manage all animal health calls.</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                statusFilter === status
                                    ? "bg-brand-emerald text-white shadow-lg shadow-brand-emerald/20"
                                    : "bg-white text-slate-400 border border-border hover:bg-slate-50"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-emerald outline-none transition-all"
                        />
                    </div>
                    <div className="text-xs font-bold text-slate-400">
                        Total Results: {filteredBookings.length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                                <th className="px-6 py-4">Farmer / User</th>
                                <th className="px-6 py-4">Problem Category</th>
                                <th className="px-6 py-4">Scheduled Slot</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-emerald mx-auto mb-2" />
                                        <p className="text-slate-400 font-medium italic">Loading bookings...</p>
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">
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
    );
}
