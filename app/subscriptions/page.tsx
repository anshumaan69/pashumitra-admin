"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    CreditCard,
    User as UserIcon,
    Phone,
    CheckCircle2,
    XCircle,
    Clock4,
    AlertTriangle,
    BadgeCheck,
    Loader2,
    Calendar,
    RefreshCw,
    IndianRupee
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";

interface Subscription {
    _id: string;
    user: {
        _id: string;
        name: string;
        phoneNumber: string;
        createdAt: string;
    };
    status: 'created' | 'trial' | 'active' | 'halted' | 'cancelled' | 'completed' | 'expired';
    isTrial: boolean;
    trialEndsAt: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    paidCount: number;
    shortUrl: string | null;
    createdAt: string;
}

const STATUS_CONFIG: Record<
    Subscription['status'],
    { label: string; color: string; bg: string; icon: React.ElementType }
> = {
    trial: { label: 'Trial', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: Clock4 },
    active: { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
    created: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle },
    halted: { label: 'Halted', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: AlertTriangle },
    cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: XCircle },
    completed: { label: 'Completed', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', icon: BadgeCheck },
    expired: { label: 'Expired', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', icon: XCircle }
};

const ALL_STATUSES: Array<'all' | Subscription['status']> = [
    'all', 'trial', 'active', 'created', 'halted', 'cancelled', 'completed', 'expired'
];

export default function SubscriptionsPage() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | Subscription['status']>('all');

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/subscriptions/admin/all");
            setSubscriptions(data.data);
        } catch (error) {
            console.error("Failed to fetch subscriptions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("pashumitra_token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchSubscriptions();
    }, [router]);

    const filteredSubs = subscriptions.filter(s => {
        const matchesSearch =
            s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.user?.phoneNumber?.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length,
        trial: subscriptions.filter(s => s.status === 'trial').length,
        cancelled: subscriptions.filter(s => ['cancelled', 'expired', 'halted'].includes(s.status)).length,
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Subscriptions"
                description="Monitor all user subscriptions and payment status."
                icon={CreditCard}
                search={{
                    value: searchTerm,
                    onChange: setSearchTerm,
                    placeholder: "Search by farmer name or phone..."
                }}
                action={
                    <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-border overflow-x-auto no-scrollbar max-w-full">
                        {(['all', 'trial', 'active', 'cancelled'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status === 'cancelled' ? 'cancelled' : status)}
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'from-slate-100 to-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
                    { label: 'Active', value: stats.active, color: 'from-emerald-50 to-green-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                    { label: 'On Trial', value: stats.trial, color: 'from-blue-50 to-sky-50', text: 'text-blue-700', border: 'border-blue-200' },
                    { label: 'Lapsed', value: stats.cancelled, color: 'from-red-50 to-rose-50', text: 'text-red-700', border: 'border-red-200' },
                ].map((stat) => (
                    <div key={stat.label} className={cn("rounded-2xl border p-5 bg-gradient-to-br shadow-sm", stat.color, stat.border)}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                        <p className={cn("text-3xl font-black", stat.text)}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Total Records: {filteredSubs.length}
                    </div>
                    <button
                        onClick={fetchSubscriptions}
                        className="p-2 text-slate-400 hover:text-brand-emerald hover:bg-emerald-50 rounded-lg transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                                <th className="px-6 py-4">Farmer / User</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Payments</th>
                                <th className="px-6 py-4">Next Billing / Trial End</th>
                                <th className="px-6 py-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-emerald mx-auto mb-2" />
                                        <p className="text-slate-400 font-medium italic">Loading subscriptions...</p>
                                    </td>
                                </tr>
                            ) : filteredSubs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-medium italic">
                                        No subscriptions found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filteredSubs.map((sub, idx) => {
                                        const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.expired;
                                        const StatusIcon = cfg.icon;

                                        const nextBillingDate = sub.isTrial && sub.trialEndsAt
                                            ? new Date(sub.trialEndsAt)
                                            : sub.currentPeriodEnd
                                                ? new Date(sub.currentPeriodEnd)
                                                : null;

                                        return (
                                            <motion.tr
                                                key={sub._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group hover:bg-slate-50 transition-colors"
                                            >
                                                {/* User */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                            <UserIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{sub.user?.name || "Anonymous User"}</p>
                                                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                {sub.user?.phoneNumber}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border",
                                                        cfg.bg, cfg.color
                                                    )}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {cfg.label}
                                                    </span>
                                                </td>

                                                {/* Plan */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <IndianRupee className="w-3.5 h-3.5 text-brand-emerald" />
                                                        <span className="text-sm font-bold text-slate-700">
                                                            {sub.isTrial ? '1 Trial → 999/mo' : '999/month'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Payments made */}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {sub.paidCount ?? 0}
                                                        <span className="text-xs font-medium text-slate-400 ml-1">cycle{sub.paidCount !== 1 ? 's' : ''}</span>
                                                    </span>
                                                </td>

                                                {/* Next billing / trial end */}
                                                <td className="px-6 py-4">
                                                    {nextBillingDate ? (
                                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                                                            <Calendar className="w-3.5 h-3.5 text-brand-emerald" />
                                                            {nextBillingDate.toLocaleDateString('en-IN', {
                                                                day: 'numeric', month: 'short', year: 'numeric'
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">—</span>
                                                    )}
                                                </td>

                                                {/* Joined */}
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium text-slate-500">
                                                        {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
