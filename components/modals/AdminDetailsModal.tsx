"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AdminDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    adminUser: any;
}

export function AdminDetailsModal({ isOpen, onClose, adminUser }: AdminDetailsModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-emerald via-brand-accent to-brand-emerald" />

                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-3xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald mb-4 border-2 border-brand-emerald/20 shadow-xl">
                                <span className="text-4xl font-black">{adminUser?.name?.[0] || "A"}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {adminUser?.name || "Administrator"}
                            </h3>
                            <div className="mt-2 px-3 py-1 bg-brand-emerald/10 text-brand-emerald rounded-full text-[10px] font-black uppercase tracking-widest">
                                {adminUser?.role || "Admin"} Account
                            </div>

                            <div className="w-full mt-8 space-y-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{adminUser?.phoneNumber || "N/A"}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Access Level</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="font-bold text-slate-700 dark:text-slate-200 capitalize">{adminUser?.role || "Admin"}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="mt-10 w-full py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all text-slate-600 dark:text-slate-400"
                            >
                                Close Details
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
