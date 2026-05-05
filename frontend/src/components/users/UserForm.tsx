'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, UserPlus, Mail, Briefcase, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const userSchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    email: z.string().email('Invalid email address'),
    role: z.string().min(2, 'Role is required'),
    department: z.string().min(2, 'Department is required'),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
    onClose: () => void;
    onSubmit: (data: UserFormValues) => void;
    initialData?: Partial<UserFormValues>;
}

export function UserForm({ onClose, onSubmit, initialData }: UserFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: initialData || {},
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-apple-lg shadow-2xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-lg font-bold">Add New Employee</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8">
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center mb-4">
                            <div className="w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 mb-2 overflow-hidden">
                                <UserPlus className="w-8 h-8" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Upload Photo</p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2">
                                <UserPlus className="w-3 h-3" /> Full Name
                            </label>
                            <input
                                {...register('name')}
                                placeholder="e.g. Alex Johnson"
                                className={cn(
                                    "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                    errors.name && "border-red-500"
                                )}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Email Address
                            </label>
                            <input
                                {...register('email')}
                                placeholder="alex.j@company.com"
                                className={cn(
                                    "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                    errors.email && "border-red-500"
                                )}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2">
                                    <Briefcase className="w-3 h-3" /> Job Title
                                </label>
                                <input
                                    {...register('role')}
                                    placeholder="e.g. Senior Designer"
                                    className={cn(
                                        "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                        errors.role && "border-red-500"
                                    )}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2">
                                    <Building className="w-3 h-3" /> Department
                                </label>
                                <input
                                    {...register('department')}
                                    placeholder="e.g. Engineering"
                                    className={cn(
                                        "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                        errors.department && "border-red-500"
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] btn-primary"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Employee'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
