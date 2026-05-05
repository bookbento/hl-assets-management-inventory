'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, UserPlus, Mail, Briefcase, Building, Layers, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getBusinessUnits } from '@/lib/api';
import { useEffect } from 'react';

const employeeSchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    email: z.string().email('Invalid email address'),
    businessUnitId: z.string().min(1, 'Business Unit is required'),
    departmentId: z.string().min(1, 'Department is required'),
    jobTitleId: z.string().min(1, 'Job Title is required'),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;
type JobTitle = { id: string; name: string };
type Department = { id: string; name: string; jobTitles: JobTitle[] };
type BusinessUnit = { id: string; name: string; departments: Department[] };

interface EmployeeFormProps {
    onClose: () => void;
    onSubmit: (data: EmployeeFormValues) => void;
    initialData?: Partial<EmployeeFormValues>;
}

export function EmployeeForm({ onClose, onSubmit, initialData }: EmployeeFormProps) {
    const {
        data: orgHierarchy = [],
        isLoading: isLoadingOrg,
        isError: isOrgError,
        error: orgError,
        refetch: refetchOrg,
    } = useQuery<BusinessUnit[]>({
        queryKey: ['org-hierarchy'],
        queryFn: getBusinessUnits,
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: initialData || {
            businessUnitId: '',
            departmentId: '',
            jobTitleId: '',
        },
    });

    const selectedBUId = watch('businessUnitId');
    const selectedDeptId = watch('departmentId');

    // Filtered options
    const departments = orgHierarchy.find((bu) => bu.id === selectedBUId)?.departments || [];
    const jobTitles = departments.find((dept) => dept.id === selectedDeptId)?.jobTitles || [];

    // Reset children when parent changes
    useEffect(() => {
        if (!initialData) {
            setValue('departmentId', '');
            setValue('jobTitleId', '');
        }
    }, [selectedBUId, setValue, initialData]);

    useEffect(() => {
        if (!initialData) {
            setValue('jobTitleId', '');
        }
    }, [selectedDeptId, setValue, initialData]);

    const submitHandler = (values: EmployeeFormValues) => {
        onSubmit({
            ...values,
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
        });
    };

    const orgErrorMessage = orgError instanceof Error ? orgError.message : 'Failed to load organization data';

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

                <form onSubmit={handleSubmit(submitHandler)} className="p-8">
                    <div className="space-y-5">
                        <div className="flex flex-col items-center justify-center mb-2">
                            <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 mb-1 overflow-hidden">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Upload Photo</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2">
                                    <UserPlus className="w-3 h-3" /> Full Name
                                </label>
                                <input
                                    {...register('name')}
                                    placeholder="e.g. Alex Johnson"
                                    className={cn(
                                        "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                        errors.name && "border-red-500"
                                    )}
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Email
                                </label>
                                <input
                                    {...register('email')}
                                    placeholder="alex.j@company.com"
                                    className={cn(
                                        "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                        errors.email && "border-red-500"
                                    )}
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2">
                                <Layers className="w-3 h-3" /> Business Unit
                            </label>
                            {isLoadingOrg && (
                                <p className="mb-2 text-xs text-gray-500 flex items-center gap-1.5">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Loading organization structure...
                                </p>
                            )}
                            {isOrgError && (
                                <div className="mb-2 p-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">
                                    <p className="flex items-center gap-1.5 font-medium">
                                        <AlertCircle className="w-3 h-3" />
                                        {orgErrorMessage}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => refetchOrg()}
                                        className="mt-1 underline underline-offset-2 hover:no-underline"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                            <select
                                {...register('businessUnitId')}
                                className={cn(
                                    "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none",
                                    errors.businessUnitId && "border-red-500"
                                )}
                                disabled={isLoadingOrg || isOrgError}
                            >
                                <option value="">Select Business Unit...</option>
                                {orgHierarchy.map((bu) => (
                                    <option key={bu.id} value={bu.id}>{bu.name}</option>
                                ))}
                            </select>
                            {errors.businessUnitId && <p className="mt-1 text-xs text-red-500 font-medium">{errors.businessUnitId.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2">
                                    <Building className="w-3 h-3" /> Department
                                </label>
                                <select
                                    {...register('departmentId')}
                                    className={cn(
                                        "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none",
                                        errors.departmentId && "border-red-500"
                                    )}
                                    disabled={!selectedBUId || isLoadingOrg || isOrgError}
                                >
                                    <option value="">Select Department...</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                                {errors.departmentId && <p className="mt-1 text-xs text-red-500 font-medium">{errors.departmentId.message}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2">
                                    <Briefcase className="w-3 h-3" /> Job Title
                                </label>
                                <select
                                    {...register('jobTitleId')}
                                    className={cn(
                                        "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none",
                                        errors.jobTitleId && "border-red-500"
                                    )}
                                    disabled={!selectedDeptId || isLoadingOrg || isOrgError}
                                >
                                    <option value="">Select Job Title...</option>
                                    {jobTitles.map((jt) => (
                                        <option key={jt.id} value={jt.id}>{jt.name}</option>
                                    ))}
                                </select>
                                {errors.jobTitleId && <p className="mt-1 text-xs text-red-500 font-medium">{errors.jobTitleId.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
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
