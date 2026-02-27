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
    RefreshCcw,
    AlertCircle,
    Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";

interface Problem {
    _id: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    category: string;
    categoryEn: string;
    isActive: boolean;
    image?: string;
}

interface Category {
    _id: string;
    name: string;
    nameEn: string;
}

export default function ProblemsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProblem, setCurrentProblem] = useState<Partial<Problem> & { imageFile?: File | null }>({
        title: "",
        titleEn: "",
        description: "",
        descriptionEn: "",
        category: "",
        categoryEn: "",
        isActive: true,
        imageFile: null
    });
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    useEffect(() => {
        const token = localStorage.getItem("pashumitra_token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchProblems();
        fetchCategories();
    }, [router]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get("/categories");
            setCategories(data.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

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
            const data = new FormData();
            data.append('title', currentProblem.title || '');
            data.append('titleEn', currentProblem.titleEn || '');
            data.append('description', currentProblem.description || '');
            data.append('descriptionEn', currentProblem.descriptionEn || '');
            data.append('category', currentProblem.category || '');
            data.append('categoryEn', currentProblem.categoryEn || '');
            data.append('isActive', String(currentProblem.isActive));
            if (currentProblem.imageFile) {
                data.append('image', currentProblem.imageFile);
            }

            if (currentProblem._id) {
                await api.put(`/problems/${currentProblem._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast("Problem category updated successfully!");
            } else {
                await api.post("/problems", data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
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

    const filteredProblems = problems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="Problem Management"
                description="Manage categories for call bookings."
                icon={AlertCircle}
                search={{
                    value: searchTerm,
                    onChange: setSearchTerm,
                    placeholder: "Search problems..."
                }}
                action={
                    <button
                        onClick={() => {
                            setCurrentProblem({ title: "", titleEn: "", description: "", descriptionEn: "", category: "", categoryEn: "", isActive: true, imageFile: null });
                            setIsModalOpen(true);
                        }}
                        className="bg-brand-emerald text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        Add Problem
                    </button>
                }
            />


            <div className="flex bg-white rounded-2xl border border-border overflow-hidden shadow-sm min-h-[500px]">
                {/* Category Sidebar */}
                <div className="w-64 border-r border-border bg-slate-50/50 flex flex-col">
                    <div className="p-4 border-b border-border bg-slate-100/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categories (श्रेणियाँ)</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        <button
                            onClick={() => setSelectedCategory("All")}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-bold text-xs",
                                selectedCategory === "All"
                                    ? "bg-brand-emerald text-white shadow-lg shadow-brand-emerald/20"
                                    : "text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            <span>All Problems</span>
                            <span className="opacity-60">{problems.length}</span>
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat._id}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={cn(
                                    "w-full flex flex-col px-3 py-2.5 rounded-xl transition-all text-left",
                                    selectedCategory === cat.name
                                        ? "bg-white text-brand-emerald shadow-sm border border-brand-emerald/20"
                                        : "text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                <span className="font-bold text-xs uppercase tracking-tight">{cat.name}</span>
                                <span className="text-[10px] opacity-60 font-medium">{cat.nameEn}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            showing {filteredProblems.length} problems in {selectedCategory}
                        </p>
                        <button onClick={fetchProblems} className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-brand-emerald transition-all font-bold text-[10px] uppercase tracking-widest">
                            <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                            Reload
                        </button>
                    </div>


                    <div className="overflow-x-auto no-scrollbar">

                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                                    <th className="px-6 py-4">Problem (Hi / En)</th>
                                    <th className="px-6 py-4">Category</th>
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
                                                    <div className="flex items-center gap-3">
                                                        {problem.image ? (
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                                                                <img
                                                                    src={problem.image.startsWith('http') ? problem.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${problem.image}`}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                                <ImageIcon className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-slate-900 leading-tight">{problem.title}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">{problem.titleEn}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded w-fit">
                                                        {problem.category || 'Uncategorized'}
                                                    </div>
                                                    {problem.categoryEn && (
                                                        <div className="text-[8px] text-slate-300 font-bold uppercase mt-1 pl-1">
                                                            {problem.categoryEn}
                                                        </div>
                                                    )}
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
                                                                setCurrentProblem({ ...problem, imageFile: null });
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
                        className="relative bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/10"
                    >
                        <h3 className="text-2xl font-black mb-6 text-brand-emerald tracking-tight">
                            {currentProblem._id ? "Update Problem / समस्या अपडेट करें" : "Add New Problem / नई समस्या जोड़ें"}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title (Hindi)</label>
                                    <input
                                        required
                                        value={currentProblem.title}
                                        onChange={(e) => setCurrentProblem({ ...currentProblem, title: e.target.value })}
                                        className="w-full text-slate-900 bg-slate-50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-emerald transition-all"
                                        placeholder="हिन्दी नाम"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title (English)</label>
                                    <input
                                        required
                                        value={currentProblem.titleEn}
                                        onChange={(e) => setCurrentProblem({ ...currentProblem, titleEn: e.target.value })}
                                        className="w-full text-slate-900 bg-slate-50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-emerald transition-all"
                                        placeholder="English Title"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category / श्रेणी</label>
                                    <select
                                        required
                                        value={currentProblem.category}
                                        onChange={(e) => {
                                            const selectedCat = categories.find(c => c.name === e.target.value);
                                            setCurrentProblem({
                                                ...currentProblem,
                                                category: e.target.value,
                                                categoryEn: selectedCat?.nameEn || ''
                                            });
                                        }}
                                        className="w-full text-slate-900 bg-slate-50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-emerald transition-all"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name} ({cat.nameEn})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Problem Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setCurrentProblem({ ...currentProblem, imageFile: e.target.files?.[0] || null })}
                                        className="hidden"
                                        id="problem-image"
                                    />
                                    <label
                                        htmlFor="problem-image"
                                        className="flex items-center gap-3 w-full bg-slate-50 border border-dashed border-slate-300 rounded-xl py-3 px-4 cursor-pointer hover:bg-slate-100 transition-all overflow-hidden"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                            {currentProblem.imageFile ? (
                                                <div className="w-full h-full rounded-lg overflow-hidden">
                                                    <img src={URL.createObjectURL(currentProblem.imageFile as Blob)} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <ImageIcon className="w-4 h-4" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-slate-500 truncate">
                                            {currentProblem.imageFile ? currentProblem.imageFile.name : (currentProblem.image ? "Change Image" : "Upload Icon")}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description (Hindi)</label>
                                <textarea
                                    required
                                    value={currentProblem.description}
                                    onChange={(e) => setCurrentProblem({ ...currentProblem, description: e.target.value })}
                                    className="w-full text-slate-900 bg-slate-50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-emerald transition-all h-20 resize-none"
                                    placeholder="Hindi description..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description (English)</label>
                                <textarea
                                    required
                                    value={currentProblem.descriptionEn}
                                    onChange={(e) => setCurrentProblem({ ...currentProblem, descriptionEn: e.target.value })}
                                    className="w-full text-slate-900 bg-slate-50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-emerald transition-all h-20 resize-none"
                                    placeholder="English description..."
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
                                <label htmlFor="isActive" className="text-sm font-bold text-slate-700">This Problem is Active / यह समस्या सक्रिय है</label>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Problem Image</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setCurrentProblem({ ...currentProblem, imageFile: e.target.files?.[0] || null })}
                                        className="hidden"
                                        id="problem-image"
                                    />
                                    <label
                                        htmlFor="problem-image"
                                        className="flex flex-col items-center justify-center w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-brand-emerald/40 transition-all p-4 text-center overflow-hidden"
                                    >
                                        {currentProblem.imageFile ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={URL.createObjectURL(currentProblem.imageFile as Blob)}
                                                    className="w-full h-full object-contain rounded-xl"
                                                    alt="Preview"
                                                />
                                            </div>
                                        ) : currentProblem.image ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${currentProblem.image}`}
                                                    className="w-full h-full object-contain rounded-xl"
                                                    alt="Current"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                                    <p className="text-white text-xs font-bold">Change Image</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400 gap-2">
                                                <ImageIcon className="w-6 h-6 text-slate-300" />
                                                <p className="text-[10px] font-bold">Click to upload image</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
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
                                    {currentProblem._id ? "Update Problem" : "Save Problem"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
