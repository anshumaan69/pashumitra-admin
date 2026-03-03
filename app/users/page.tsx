"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    Users as UsersIcon,
    Search,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Loader2,
    RefreshCcw,
    UserCircle,
    Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";

interface User {
    _id: string;
    phoneNumber: string;
    name: string;
    role: 'user' | 'admin' | 'super_admin';
    onboardingComplete: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("pashumitra_token");
        if (!token) {
            router.push("/login");
            return;
        }

        const userStr = localStorage.getItem("pashumitra_user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== 'super_admin') {
                toast("Unauthorized: Super Admin access required", "error");
                router.push("/");
                return;
            }
        }

        fetchUsers();
    }, [router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/auth");
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast("Could not load users", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingUserId(userId);
        try {
            const { data } = await api.put(`/auth/${userId}/role`, { role: newRole });
            if (data.success) {
                toast(`User role updated to ${newRole}`);
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
            }
        } catch (error) {
            console.error("Failed to update role", error);
            toast("Failed to update user role", "error");
        } finally {
            setUpdatingUserId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phoneNumber?.includes(searchTerm) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'super_admin': return <ShieldAlert className="w-3.5 h-3.5" />;
            case 'admin': return <ShieldCheck className="w-3.5 h-3.5" />;
            default: return <UserCircle className="w-3.5 h-3.5" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super_admin': return "bg-red-50 text-red-600 border-red-100";
            case 'admin': return "bg-emerald-50 text-emerald-600 border-emerald-100";
            default: return "bg-slate-50 text-slate-500 border-slate-100";
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="User Management"
                description="Manage platform users and assign administrative roles."
                icon={UsersIcon}
                search={{
                    value: searchTerm,
                    onChange: setSearchTerm,
                    placeholder: "Search users by name or phone..."
                }}
            />

            <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Total Users: {filteredUsers.length}
                    </p>
                    <button onClick={fetchUsers} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-brand-emerald transition-all uppercase tracking-widest">
                        <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                        Refresh List
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                                <th className="px-8 py-4">User Information</th>
                                <th className="px-8 py-4">Access Level</th>
                                <th className="px-8 py-4">Joined Date</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-emerald mx-auto mb-2" />
                                        <p className="text-slate-400 font-medium italic">Loading user directory...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400 font-medium italic">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="group hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner group-hover:scale-110 transition-transform">
                                                    <span className="font-bold text-lg">{user.name?.[0] || user.phoneNumber[0]}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-tight">{user.name || "Incomplete Profile"}</p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Phone className="w-3 h-3 text-slate-300" />
                                                        <p className="text-[11px] text-slate-400 font-medium">+91 {user.phoneNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit",
                                                getRoleColor(user.role)
                                            )}>
                                                {getRoleIcon(user.role)}
                                                {user.role.replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs text-slate-500 font-medium">
                                                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end items-center gap-2">
                                                {updatingUserId === user._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-brand-emerald" />
                                                ) : (
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        className="bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-3 text-[10px] font-bold text-slate-600 outline-none focus:ring-1 focus:ring-brand-emerald transition-all"
                                                    >
                                                        <option value="user">Assign User</option>
                                                        <option value="admin">Assign Admin</option>
                                                        <option value="super_admin">Assign Super Admin</option>
                                                    </select>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
