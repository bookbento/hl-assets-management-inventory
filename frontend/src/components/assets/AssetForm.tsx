'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AssetCategory, AssetStatus } from '@prisma/client';
import { X, Upload, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const assetSchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    category: z.nativeEnum(AssetCategory),
    status: z.nativeEnum(AssetStatus),
    serialNumber: z.string().min(2, 'Serial number is required'),
    assignedTo: z.string().optional(),
    purchaseDate: z.string().min(1, 'Purchase date is required'),
    warrantyExpiry: z.string().min(1, 'Warranty expiry is required'),
});

export type AssetFormValues = z.infer<typeof assetSchema>;

interface AssetFormProps {
    onClose: () => void;
    onSubmit: (data: AssetFormValues) => void;
    initialData?: Partial<AssetFormValues>;
    title?: string;
    isModal?: boolean;
}

export function AssetForm({ 
    onClose, 
    onSubmit, 
    initialData, 
    title = "Add New Asset",
    isModal = true 
}: AssetFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AssetFormValues>({
        resolver: zodResolver(assetSchema),
        defaultValues: initialData || {
            category: AssetCategory.LAPTOP,
            status: AssetStatus.AVAILABLE,
        },
    });

    // Update form when initialData changes
    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    const formContent = (
        <div className={cn(
            "relative w-full bg-white overflow-hidden",
            isModal ? "max-w-2xl rounded-apple-lg shadow-2xl" : "rounded-xl"
        )}>
            {isModal && (
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Asset Image</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer group bg-gray-50/50">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Upload className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-sm font-semibold mb-1">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-400 font-medium">PNG, JPG or WebP (max. 2MB)</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Asset Name</label>
                            <input
                                {...register('name')}
                                placeholder="e.g. MacBook Pro M3"
                                className={cn(
                                    "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                    errors.name && "border-red-500 focus:ring-red-200 focus:border-red-500"
                                )}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Category</label>
                            <select
                                {...register('category')}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                            >
                                {Object.values(AssetCategory).map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Status</label>
                            <select
                                {...register('status')}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                            >
                                {Object.values(AssetStatus).map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 text-left">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Serial Number</label>
                            <input
                                {...register('serialNumber')}
                                placeholder="e.g. SER-123456"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Assigned To</label>
                            <input
                                {...register('assignedTo')}
                                placeholder="User Name"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Purchase Date</label>
                                <input
                                    type="date"
                                    {...register('purchaseDate')}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Warranty Expiry</label>
                                <input
                                    type="date"
                                    {...register('warrantyExpiry')}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-primary" />
                        <p className="text-xs text-primary font-medium leading-tight text-left">
                            {initialData ? "Updating this asset will reflect across the inventory dashboard immediately." : "Adding assets will automatically update the inventory dashboard and notify the infrastructure team."}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary"
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );

    if (!isModal) {
        return formContent;
    }

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
                className="w-full max-w-2xl"
            >
                {formContent}
            </motion.div>
        </div>
    );
}

export default AssetForm;
