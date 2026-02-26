import { ReactNode, useEffect } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHeader } from "@/lib/context/HeaderContext";

interface PageHeaderProps {
    title: string;
    description: string;
    action?: ReactNode;
    search?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
    };
    icon?: any;
}

export function PageHeader({ title, description, action, search, icon: Icon }: PageHeaderProps) {
    const { setTitle, setDescription } = useHeader();

    useEffect(() => {
        setTitle(title);
        setDescription(description);
        // Reset description on unmount if needed, but usually next page will set it
    }, [title, description, setTitle, setDescription]);

    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-4 mb-24 px-1 min-h-[1px]">



            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">

                {search && (
                    <div className="relative group">
                        <div className="absolute inset-0 bg-brand-emerald/5 opacity-0 group-focus-within:opacity-100 rounded-2xl transition-all duration-500 blur-xl" />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-emerald transition-colors" />
                        <input
                            type="text"
                            placeholder={search.placeholder || "Search..."}
                            value={search.value}
                            onChange={(e) => search.onChange(e.target.value)}
                            className="relative w-full sm:w-64 md:w-80 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-white/5 rounded-2xl py-3 pl-11 pr-5 text-sm font-medium focus:ring-4 focus:ring-brand-emerald/10 focus:border-brand-emerald outline-none transition-all shadow-sm"

                        />
                    </div>
                )}
                {action && (
                    <div className="shrink-0">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}

