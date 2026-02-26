"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    MessageSquare,
    Send,
    User as UserIcon,
    MessageCircle,
    ThumbsUp,
    Clock,
    CheckCircle2,
    Loader2
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface Question {
    _id: string;
    user: {
        name: string;
        phoneNumber: string;
    };
    questionText: string;
    likes: string[];

    comments: any[];
    adminAnswer?: {
        text: string;
        answeredAt: string;
    };
    createdAt: string;
}

export default function QuestionsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [answeringId, setAnsweringId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("pashumitra_token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchQuestions();
    }, [router]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/questions");
            setQuestions(data.data);
        } catch (error) {
            console.error("Failed to fetch questions", error);
            toast("Error fetching community feed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (id: string) => {
        if (!answerText) return;
        try {
            await api.put(`/questions/${id}/answer`, { text: answerText });
            toast("Expert advice shared successfully!");
            setAnsweringId(null);
            setAnswerText("");
            fetchQuestions();
        } catch (error) {
            console.error("Error answering question", error);
            toast("Failed to post answer", "error");
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <header>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Q&A Management</h2>
                <p className="text-slate-500 font-medium">Respond to farmer inquiries and share expert advice.</p>
            </header>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-emerald mx-auto mb-4" />
                    <p className="text-slate-500 font-medium italic">Loading conversation feed...</p>
                </div>
            ) : questions.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-medium italic">No questions asked yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((q, idx) => (
                        <motion.div
                            key={q._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{q.user?.name || "Anonymous"}</h4>
                                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                                <Clock className="w-3 h-3 text-brand-emerald" />
                                                {new Date(q.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <ThumbsUp className="w-4 h-4" />
                                            <span className="text-xs font-bold">{q.likes?.length || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <MessageCircle className="w-4 h-4" />
                                            <span className="text-xs font-bold">{q.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-lg font-medium text-slate-800 leading-relaxed italic pr-12">
                                        "{q.questionText}"
                                    </p>
                                </div>


                                <div className="mt-8 border-t border-slate-50 pt-6">
                                    {q.adminAnswer ? (
                                        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 relative">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600">Admin Answered</span>
                                            </div>
                                            <p className="text-slate-800 font-medium leading-relaxed">
                                                {q.adminAnswer.text}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setAnsweringId(q._id);
                                                    setAnswerText(q.adminAnswer!.text);
                                                }}
                                                className="absolute top-4 right-4 text-emerald-600 hover:scale-110 transition-transform p-2"
                                            >
                                                <RefreshCcwIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {answeringId === q._id ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-3"
                                                >
                                                    <textarea
                                                        autoFocus
                                                        value={answerText}
                                                        onChange={(e) => setAnswerText(e.target.value)}
                                                        className=" text-black w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all h-32 resize-none shadow-inner"
                                                        placeholder="Write your expert response here..."
                                                    />

                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setAnsweringId(null);
                                                                setAnswerText("");
                                                            }}
                                                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleAnswer(q._id)}
                                                            className="px-6 py-2 bg-brand-emerald text-white text-xs font-bold rounded-lg shadow-lg shadow-brand-emerald/10 flex items-center gap-2 hover:scale-105 transition-all"
                                                        >
                                                            <Send className="w-3.5 h-3.5" />
                                                            Submit Answer
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <button
                                                    onClick={() => setAnsweringId(q._id)}
                                                    className="w-fit flex items-center gap-2 px-6 py-3 bg-brand-emerald text-white font-bold rounded-2xl shadow-lg shadow-brand-emerald/20 hover:scale-105 transition-all"
                                                >
                                                    <MessageSquare className="w-5 h-5" />
                                                    Reply to Farmer
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

function RefreshCcwIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    );
}
