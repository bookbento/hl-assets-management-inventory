'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock, User, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                username: formData.username,
                password: formData.password,
            });

            if (result?.error) {
                setError('Invalid username or password');
                setLoading(false);
            } else {
                const callbackUrl = searchParams.get('callbackUrl') || '/';
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err: any) {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 mx-auto mb-6">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">IT Asset Management</h1>
                    <p className="text-[#86868B] mt-2 font-medium">Asset Management System</p>
                </div>

                <div className="apple-card p-8 bg-white/80 backdrop-blur-xl border-white shadow-2xl shadow-gray-200/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="text-left">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#86868B] mb-1.5 ml-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="Enter your ID"
                                        className="w-full bg-gray-50 border border-[#D2D2D7] rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="text-left">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#86868B] mb-1.5 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border border-[#D2D2D7] rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-xs text-red-500 font-bold text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 group"
                        >
                            <span className="font-bold">{loading ? 'Signing in...' : 'Sign In'}</span>
                            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[#D2D2D7] text-center">
                        <p className="text-[11px] text-[#86868B] font-medium leading-relaxed">
                            Protected by hardware-level encryption. <br />
                            Need help? Contact <span className="text-primary font-bold cursor-pointer">IT Support</span>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center text-[10px] uppercase font-bold tracking-widest text-[#D2D2D7]">
                    Asset Management System &copy; 2024
                </div>
            </motion.div>
        </div>
    );
}
