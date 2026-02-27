"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    Plus,
    Search,
    Trash2,
    CalendarCheck,
    MessageCircle,
    ThumbsUp,
    Clock,
    Tag,
    Loader2,
    X,
    Send
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";

interface Post {
    _id: string;
    question: string;
    answer: string;
    category: string;
    likes: string[];
    comments: any[];
    admin: {
        name: string;
    };
    createdAt: string;
}

export default function PostsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        category: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("pashumitra_token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchPosts();
    }, [router]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/posts");
            setPosts(data.data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
            toast("Error fetching posts board", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.delete(`/posts/${id}`);
            toast("Post deleted successfully!");
            fetchPosts();
        } catch (error) {
            console.error("Error deleting post", error);
            toast("Failed to delete post", "error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post("/posts", formData);
            toast("New knowledge post published!");
            setIsAddModalOpen(false);
            setFormData({ question: "", answer: "", category: "" });
            fetchPosts();
        } catch (error) {
            console.error("Error creating post", error);
            toast("Failed to create post", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPosts = posts.filter(p =>
        p.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Knowledge Board"
                    description="Upload and manage Q&A posts for the farmer community."
                    icon={CalendarCheck}
                    search={{
                        value: searchTerm,
                        onChange: setSearchTerm,
                        placeholder: "Search topics, questions..."
                    }}
                />
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-emerald text-white font-bold rounded-2xl shadow-lg shadow-brand-emerald/20 hover:scale-105 transition-all w-full md:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" />
                    New Post
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-emerald mx-auto mb-4" />
                    <p className="text-slate-500 font-medium italic">Loading knowledge feed...</p>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-medium italic">No posts found matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredPosts.map((post, idx) => (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald text-[10px] font-black uppercase tracking-wider rounded-lg border border-brand-emerald/10">
                                        {post.category}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight">
                                    Q: {post.question}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                                    <span className="font-bold text-slate-400 mr-1">A:</span>
                                    {post.answer}
                                </p>
                            </div>

                            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold">{post.likes?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold">{post.comments?.length || 0}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                                    <span className="text-[10px] font-medium text-slate-400">
                                        {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Post Modal */}
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
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            Create Post
                                        </h2>
                                        <p className="text-slate-500 font-medium text-sm mt-1 ml-13">Add new knowledge content for farmers</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-3 py-1 rounded-lg w-fit">
                                            Category
                                        </label>
                                        <input
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full text-black bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-emerald/10 focus:border-brand-emerald transition-all"
                                            placeholder="e.g. Feeding, Breeding, Medical..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-3 py-1 rounded-lg w-fit">
                                            Question (Part 1)
                                        </label>
                                        <input
                                            required
                                            value={formData.question}
                                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                            className="w-full text-black bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-emerald/10 focus:border-brand-emerald transition-all"
                                            placeholder="What is the question?"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-3 py-1 rounded-lg w-fit">
                                            Answer (Part 2)
                                        </label>
                                        <textarea
                                            required
                                            value={formData.answer}
                                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                            className="w-full text-black bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-emerald/10 focus:border-brand-emerald transition-all h-32 resize-none shadow-inner"
                                            placeholder="Provide the expert answer..."
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
                                        Publish Board Post
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
