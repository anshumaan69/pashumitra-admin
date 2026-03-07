"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    Search,
    Loader2,
    CheckCircle,
    XCircle,
    Store,
    Clock,
    User as UserIcon
} from "lucide-react";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";

interface CowSale {
    _id: string;
    seller: {
        _id: string;
        name: string;
        phoneNumber: string;
        profileDetails?: {
            address?: string;
        };
    };
    cowDetails: {
        breed: string;
        age: number;
        price: number;
        yield: number;
        description: string;
    };
    status: 'pending' | 'approved' | 'rejected' | 'sold';
    createdAt: string;
}

export default function CowSalesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [sales, setSales] = useState<CowSale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("pashumitra_token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchSales();
    }, [router]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/cowsales/admin");
            setSales(data.data);
        } catch (error) {
            console.error("Failed to fetch cow sales", error);
            toast("Error fetching cow sales", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to mark this sale as ${newStatus}?`)) return;
        setUpdatingId(id);
        try {
            await api.put(`/cowsales/admin/${id}/status`, { status: newStatus });
            toast(`Sale ${newStatus} successfully!`);
            fetchSales();
        } catch (error) {
            console.error("Error updating sale status", error);
            toast("Failed to update status", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'sold': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const filteredSales = sales.filter(s =>
        (s.seller?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cowDetails.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.seller?.phoneNumber || "").includes(searchTerm)
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Cow Sales"
                    description="Manage farmer cow sale requests."
                    icon={Store}
                    search={{
                        value: searchTerm,
                        onChange: setSearchTerm,
                        placeholder: "Search by farmer, breed, or phone..."
                    }}
                />
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-emerald mx-auto mb-4" />
                    <p className="text-slate-500 font-medium italic">Loading sale requests...</p>
                </div>
            ) : filteredSales.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-medium italic">No sale requests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredSales.map((sale, idx) => (
                        <motion.div
                            key={sale._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border", getStatusColor(sale.status))}>
                                        {sale.status}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                                        <span className="text-[10px] font-medium text-slate-400">
                                            {new Date(sale.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{sale.seller?.name || "Unknown Farmer"}</p>
                                        <p className="text-xs text-slate-500">{sale.seller?.phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Breed:</span>
                                        <span className="font-semibold text-slate-900">{sale.cowDetails.breed}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Age:</span>
                                        <span className="font-semibold text-slate-900">{sale.cowDetails.age} years/months</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Milk Yield:</span>
                                        <span className="font-semibold text-slate-900">{sale.cowDetails.yield} L/day</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Price:</span>
                                        <span className="font-bold text-brand-emerald">₹{sale.cowDetails.price.toLocaleString('en-IN')}</span>
                                    </div>
                                    {sale.cowDetails.description && (
                                        <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                                            {sale.cowDetails.description}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {sale.status === 'pending' && (
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                    <button
                                        onClick={() => handleUpdateStatus(sale._id, 'approved')}
                                        disabled={updatingId === sale._id}
                                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {updatingId === sale._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(sale._id, 'rejected')}
                                        disabled={updatingId === sale._id}
                                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {updatingId === sale._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                        Reject
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
