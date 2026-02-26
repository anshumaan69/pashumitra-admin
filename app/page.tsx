"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import api from "@/lib/api";
import {
  Users,
  AlertCircle,
  Calendar,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  User,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState([

    { label: "Total Bookings", value: "...", icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active Problems", value: "...", icon: AlertCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Unanswered Q&A", value: "...", icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Total Users", value: "...", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
  ]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, problemsRes, questionsRes, usersRes] = await Promise.all([
        api.get("/bookings/admin/all"),
        api.get("/problems"),
        api.get("/questions"),
        api.get("/auth")
      ]);

      const totalBookings = bookingsRes.data.count || 0;
      const activeProblems = problemsRes.data.data.filter((p: any) => p.isActive).length;
      const unansweredQuestions = questionsRes.data.data.filter((q: any) => !q.adminAnswer).length;
      const totalUsers = usersRes.data.count || 0;

      setStats([
        { label: "Total Bookings", value: totalBookings.toString(), icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Active Problems", value: activeProblems.toString(), icon: AlertCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "Unanswered Q&A", value: unansweredQuestions.toString(), icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-50" },
        { label: "Total Users", value: totalUsers.toString(), icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
      ]);

      // Sort and pick latest 5 bookings
      const sortedBookings = bookingsRes.data.data
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentBookings(sortedBookings);

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
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
    fetchDashboardData();
  }, [router]);


  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pashumitra Admin Dashboard</h2>
        <p className="text-slate-500 font-medium">Real-time platform insights and animal health management.</p>
      </header>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-border shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="flex items-end gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value === "..." ? <Loader2 className="w-5 h-5 animate-spin inline text-slate-300" /> : stat.value}
              </h3>
            </div>
            <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 text-slate-200 group-hover:text-brand-emerald transition-colors" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-white dark:bg-slate-950 border border-border min-h-[400px]">
          <h3 className="text-xl font-bold mb-6 italic text-slate-400">Activity Analytics</h3>
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
            <TrendingUp className="w-12 h-12 text-slate-200 mb-2" />
            <p className="text-slate-400 font-bold italic text-sm">Interactive charts coming in V2</p>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-white dark:bg-slate-950 border border-border h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recent Bookings</h3>
            <a href="/bookings" className="text-xs font-bold text-brand-emerald hover:underline">View All</a>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-emerald opacity-20" /></div>
            ) : recentBookings.length === 0 ? (
              <p className="text-center py-10 text-slate-400 italic font-medium">No bookings yet</p>
            ) : (
              recentBookings.map((booking, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={booking._id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-emerald/10 flex items-center justify-center text-brand-emerald shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                      {booking.user?.name || "Farmer"}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                      {booking.problem?.title || "Health Inquiry"}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                      {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className={cn(
                      "text-[9px] uppercase tracking-widest font-black",
                      booking.status === 'completed' ? 'text-emerald-500' : 'text-orange-500'
                    )}>
                      {booking.status}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

