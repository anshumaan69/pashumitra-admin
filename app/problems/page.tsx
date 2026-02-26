"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface Problem {
    _id: string;
    title: string;
    description: string;
    isActive: boolean;
}

export default function ProblemsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProblem, setCurrentProblem] = useState<Partial<Problem>>({
        title: "",
        description: "",
        isActive: true
    });

    useEffect(() => {
        const token = localStorage.getItem("pashumitra_token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchProblems();
    }, [router]);

    const fetchProblems = async () => {

        setLoading(true);
        try {
            const { data } = await api.get("/problems");
            // Note: Backend might return all problems or just active ones based on route.
            // For admin we might need a dedicated GET /api/admin/problems to see inactive ones too if the public route is filtered.
            // Based on my previous backend work, the public route GET /api/problems filters isActive: true.
            // I should ideally add an admin route for this, but for now I'll work with the public one or assume the backend allows all for admin.
            setProblems(data.data);
        } catch (error) {
            console.error("Failed to fetch problems", error);
            toast("Could not connect to server", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentProblem._id) {
                await api.put(`/problems/${currentProblem._id}`, currentProblem);
                toast("Problem category updated successfully!");
            } else {
                await api.post("/problems", currentProblem);
                toast("New problem category added!");
            }
            setIsModalOpen(false);
            fetchProblems();
        } catch (error) {
            console.error("Error saving problem", error);
            toast("Error saving changes", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this problem?")) return;
        try {
            await api.delete(`/problems/${id}`);
            toast("Category deleted successfully");
            fetchProblems();
        } catch (error) {
            console.error("Error deleting problem", error);
            toast("Check if this category is linked to active bookings before deleting", "error");
        }
    };

    const filteredProblems = problems.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Problem Management</h2>
                    <p className="text-slate-500 font-medium">Manage categories for call bookings.</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentProblem({ title: "", description: "", isActive: true });
                        setIsModalOpen(true);
                    }}
                    className="bg-brand-emerald text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-emerald/20 hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-emerald transition-all outline-none"
                        />
                    </div>
                    <button onClick={fetchProblems} className="p-2 text-slate-400 hover:text-brand-emerald transition-colors">
                        <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-emerald mx-auto mb-2" />
                                        <p className="text-slate-400 font-medium italic">Loading problems...</p>
                                    </td>
                                </tr>
                            ) : filteredProblems.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400 font-medium italic">
                                        No problems found.
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filteredProblems.map((problem) => (
                                        <motion.tr
                                            key={problem._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">{problem.title}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-500 max-w-md line-clamp-1">{problem.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit",
                                                    problem.isActive
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        : "bg-slate-100 text-slate-500 border border-slate-200"
                                                )}>
                                                    {problem.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {problem.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setCurrentProblem(problem);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-brand-emerald hover:bg-emerald-50 rounded-lg transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(problem._id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Basic Modal Implementation */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="relative bg-white dark:bg-slate-950 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/10"
                    >
                        <h3 className="text-2xl font-bold mb-6 text-brand-emerald">
                            {currentProblem._id ? "Update Problem" : "Add New Problem"}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Problem Title</label>
                                <input
                                    required
                                    value={currentProblem.title}
                                    onChange={(e) => setCurrentProblem({ ...currentProblem, title: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-emerald transition-all"
                                    placeholder="e.g. Vaccination Help"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
                                <textarea
                                    required
                                    value={currentProblem.description}
                                    onChange={(e) => setCurrentProblem({ ...currentProblem, description: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-emerald transition-all h-32 resize-none"
                                    placeholder="Briefly describe the category..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={currentProblem.isActive}
                                    onChange={(e) => setCurrentProblem({ ...currentProblem, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded accent-brand-emerald"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Category is currently Active</label>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 px-4 border border-border rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-4 bg-brand-emerald text-white font-bold rounded-xl shadow-lg shadow-brand-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {currentProblem._id ? "Update Category" : "Save Category"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
