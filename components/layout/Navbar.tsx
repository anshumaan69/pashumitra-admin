"use client";

import { Bell, Search, User } from "lucide-react";

export function Navbar() {
    return (
        <header className="h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-border fixed top-0 right-0 left-64 z-40 px-8 flex items-center justify-between">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search bookings, questions..."
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-emerald transition-all"
                />
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-brand-emerald hover:text-white transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-accent rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-border">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Admin Staff</p>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">System Administrator</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-brand-emerald flex items-center justify-center text-white shadow-lg shadow-brand-emerald/20">
                        <User className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </header>
    );
}
