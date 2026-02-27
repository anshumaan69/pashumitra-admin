"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import {
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCcw,
    LayoutGrid,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";

interface Category {
    _id: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    isActive: boolean;
}

export default function CategoriesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({
        name: "",
        nameEn: "",
        description: "",
        descriptionEn: "",
        isActive: true
    });

    useEffect(() => {
        const token = localStorage.getItem("pashumitra_token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchCategories();
    }, [router]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/categories");
            setCategories(data.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
            toast("Could not connect to server", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentCategory._id) {
                await api.put(`/categories/${currentCategory._id}`, currentCategory);
                toast("Category updated successfully!");
            } else {
                await api.post("/categories", currentCategory);
                toast("New category added!");
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error: any) {
            console.error("Error saving category", error);
            toast(error.response?.data?.message || "Error saving changes", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This might affect problems linked to this category.")) return;
        try {
            await api.delete(`/categories/${id}`);
            toast("Category deleted successfully");
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category", error);
            toast("Failed to delete category", "error");
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Problem Categories"
                description="Manage categories for your services."
                icon={LayoutGrid}
                search={{
                    value: searchTerm,
                    onChange: setSearchTerm,
                    placeholder: "Search categories..."
                }}
                action={
                    <button
                        onClick={() => {
                            setCurrentCategory({ name: "", nameEn: "", description: "", descriptionEn: "", isActive: true });
                            setIsModalOpen(true);
                        }}
                        className="bg-brand-emerald text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Category
                    </button>
                }
            />

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-end">
                    <button onClick={fetchCategories} className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-brand-emerald transition-all font-bold text-[10px] uppercase tracking-widest">
                        <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                        Reload Data
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                                <th className="px-6 py-4">Name (Hi / En)</th>
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
                                        <p className="text-slate-400 font-medium italic">Loading categories...</p>
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400 font-medium italic">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{category.name}</p>
                                            <p className="text-xs text-slate-400">{category.nameEn}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-500 max-w-md line-clamp-1">{category.description}</p>
                                            <p className="text-[10px] text-slate-300 max-w-md line-clamp-1">{category.descriptionEn}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit",
                                                category.isActive
                                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                            )}>
                                                {category.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {category.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setCurrentCategory(category);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-brand-emerald hover:bg-emerald-50 rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category._id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                        <h3 className="text-2xl font-bold mb-6 text-brand-emerald">
                            {currentCategory._id ? "Update Category" : "Add New Category"}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Name (Hindi)</label>
                                    <input
                                        required
                                        value={currentCategory.name}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                        className="w-full text-slate-900 bg-slate-50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-emerald transition-all"
                                        placeholder="हिन्दी नाम"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Name (English)</label>
                                    <input
                                        required
                                        value={currentCategory.nameEn}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, nameEn: e.target.value })}
                                        className="w-full text-slate-900 bg-slate-50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-emerald transition-all"
                                        placeholder="English Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description (Hindi)</label>
                                <textarea
                                    value={currentCategory.description}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                                    className="w-full text-slate-900 bg-slate-50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-emerald transition-all h-20 resize-none"
                                    placeholder="Hindi description..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description (English)</label>
                                <textarea
                                    value={currentCategory.descriptionEn}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, descriptionEn: e.target.value })}
                                    className="w-full text-slate-900 bg-slate-50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-emerald transition-all h-20 resize-none"
                                    placeholder="English description..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={currentCategory.isActive}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded accent-brand-emerald"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Active</label>
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
                                    {currentCategory._id ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
