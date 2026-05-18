'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AssetCategory, AssetStatus } from '@/lib/mockups/types';
import { X, Upload, Info, Image as ImageIcon, Trash2, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { resolveMediaUrl } from '@/lib/config';

const assetSchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    category: z.nativeEnum(AssetCategory),
    status: z.nativeEnum(AssetStatus),
    serialNumber: z.string().min(2, 'Serial number is required'),
    assignedTo: z.string().optional(),
    purchaseDate: z.string().min(1, 'Purchase date is required'),
    warrantyExpiry: z.string().min(1, 'Warranty expiry is required'),
});

const categoryLabels = {
    [AssetCategory.LAPTOP]: 'Laptop',
    [AssetCategory.MONITOR]: 'Monitor',
    [AssetCategory.PERIPHERAL]: 'Peripheral',
    [AssetCategory.NETWORKING]: 'Networking',
    [AssetCategory.MOBILE]: 'Mobile',
    [AssetCategory.OTHER]: 'Other',
};

const statusLabels = {
    [AssetStatus.AVAILABLE]: 'Available',
    [AssetStatus.IN_USE]: 'In Use',
    [AssetStatus.MAINTENANCE]: 'Maintenance',
    [AssetStatus.RETIRED]: 'Retired',
};

export type AssetFormValues = z.infer<typeof assetSchema>;
export type AssetFormSubmitValues = AssetFormValues & {
    imageFiles?: File[];
    imageUrl?: string | null;
    removeImage?: string;
};

interface AssetFormProps {
    onClose: () => void;
    onSubmit: (data: AssetFormSubmitValues) => void;
    initialData?: Partial<AssetFormValues> & { imageUrl?: string | null; images?: string[] };
    title?: string;
    isModal?: boolean;
    employees?: any[];
}

export function AssetForm({
    onClose,
    onSubmit,
    initialData,
    title = "Add New Asset",
    isModal = true,
    employees = []
}: AssetFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedPreviewUrls, setSelectedPreviewUrls] = useState<string[]>([]);
    const [activePreviewIndex, setActivePreviewIndex] = useState(0);
    const [removeExistingImage, setRemoveExistingImage] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const existingImageUrls = useMemo(() => {
        if (initialData?.images?.length) {
            return initialData.images;
        }
        return initialData?.imageUrl ? [initialData.imageUrl] : [];
    }, [initialData]);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<AssetFormValues>({
        resolver: zodResolver(assetSchema),
        defaultValues: initialData || {
            category: AssetCategory.LAPTOP,
            status: AssetStatus.AVAILABLE,
        },
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
            setSelectedFiles([]);
            setSelectedPreviewUrls([]);
            setActivePreviewIndex(0);
            setRemoveExistingImage(false);
        }
    }, [initialData, reset]);

    const [searchUser, setSearchUser] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const assignedToValue = watch('assignedTo');
    const selectedEmployee = useMemo(() =>
        employees?.find(e => e.id === assignedToValue)
        , [employees, assignedToValue]);

    useEffect(() => {
        if (selectedEmployee) {
            setSearchUser(selectedEmployee.name);
        } else {
            setSearchUser('');
        }
    }, [selectedEmployee]);

    const filteredEmployees = useMemo(() =>
        employees?.filter(e =>
            e.name.toLowerCase().includes(searchUser.toLowerCase()) ||
            e.department?.name?.toLowerCase().includes(searchUser.toLowerCase())
        ) || []
        , [employees, searchUser]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
                if (selectedEmployee) {
                    setSearchUser(selectedEmployee.name);
                } else {
                    setSearchUser('');
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedEmployee]);

    useEffect(() => {
        const urls = selectedFiles.map((file) => URL.createObjectURL(file));
        setSelectedPreviewUrls(urls);

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [selectedFiles]);

    const combinedImages = useMemo(() => {
        const currentExisting = removeExistingImage ? [] : existingImageUrls.map((url) => ({
            type: 'existing' as const,
            url: resolveMediaUrl(url) || url,
            source: url,
        }));

        const currentNew = selectedPreviewUrls.map((url, index) => ({
            type: 'new' as const,
            url,
            source: selectedFiles[index]?.name || `Upload ${index + 1}`,
        }));

        return [...currentExisting, ...currentNew];
    }, [existingImageUrls, removeExistingImage, selectedFiles, selectedPreviewUrls]);

    useEffect(() => {
        if (activePreviewIndex >= combinedImages.length) {
            setActivePreviewIndex(0);
        }
    }, [activePreviewIndex, combinedImages.length]);

    const activePreview = combinedImages[activePreviewIndex];

    const handleFileSelect = (files?: FileList | File[]) => {
        const list = Array.from(files || []);
        const validFiles = list.filter((file) => file.type.startsWith('image/'));
        if (!validFiles.length) return;

        setRemoveExistingImage(false);
        setSelectedFiles((current) => [...current, ...validFiles]);
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
        setActivePreviewIndex((current) => Math.max(0, Math.min(current, combinedImages.length - 2)));
    };

    const clearAllFiles = () => {
        setSelectedFiles([]);
        setSelectedPreviewUrls([]);
        setRemoveExistingImage(Boolean(existingImageUrls.length));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const imageBox = useMemo(() => {
        if (activePreview) {
            return (
                <div className="relative w-full min-h-[220px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
                    <img
                        src={activePreview.url}
                        alt="Asset preview"
                        className="h-[220px] w-full object-cover"
                    />
                    {combinedImages.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePreviewIndex((current) => (current - 1 + combinedImages.length) % combinedImages.length);
                                }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePreviewIndex((current) => (current + 1) % combinedImages.length);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <ImageIcon className="w-4 h-4" />
                                <span>
                                    {activePreview.type === 'existing'
                                        ? `Existing image ${activePreviewIndex + 1}`
                                        : activePreview.source}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearAllFiles();
                                }}
                                className="rounded-full bg-black/30 p-2 hover:bg-black/45"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={cn(
                "border-2 border-dashed border-[var(--border)] rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer group bg-[var(--surface-soft)]",
                dragActive && "border-primary bg-primary/5"
            )}>
                <div className="w-12 h-12 rounded-full bg-[var(--surface)] shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-[var(--muted-foreground)] font-medium">PNG, JPG or WebP (max. 2MB)</p>
            </div>
        );
    }, [activePreview, clearAllFiles, combinedImages.length, dragActive]);

    const formContent = (
        <div className={cn(
            "relative w-full bg-[var(--surface)] text-[var(--foreground)] overflow-hidden",
            isModal ? "max-w-2xl rounded-apple-lg shadow-2xl border border-[var(--border)]" : "rounded-xl"
        )}>
            {isModal && (
                <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-soft)]">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--surface-muted)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                    </button>
                </div>
            )}

            <form
                onSubmit={handleSubmit((values) =>
                    onSubmit({
                        ...values,
                        imageFiles: selectedFiles,
                        removeImage: removeExistingImage ? 'true' : undefined,
                    })
                )}
                className="p-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Asset Image</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files || undefined)}
                        />
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragActive(false);
                                handleFileSelect(e.dataTransfer.files);
                            }}
                        >
                            {imageBox}
                        </div>
                        {combinedImages.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {(() => {
                                    const existingCount = removeExistingImage ? 0 : existingImageUrls.length;

                                    return combinedImages.map((image, index) => {
                                        const isActive = index === activePreviewIndex;
                                        const isNew = image.type === 'new';
                                        const selectedIndex = isNew ? index - existingCount : -1;

                                        return (
                                            <div
                                                key={`${image.source}-${index}`}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setActivePreviewIndex(index)}
                                                className={cn(
                                                    "relative h-16 w-16 overflow-hidden rounded-lg border transition-all cursor-pointer",
                                                    isActive ? "border-primary ring-2 ring-primary/20" : "border-[var(--border)]"
                                                )}
                                            >
                                                <img src={image.url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                                                {isNew && selectedIndex >= 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeSelectedFile(selectedIndex);
                                                        }}
                                                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                                {existingImageUrls.length > 0 && !removeExistingImage && (
                                    <button
                                        type="button"
                                        onClick={() => setRemoveExistingImage(true)}
                                        className="h-16 rounded-lg border border-dashed border-[var(--border)] px-3 text-xs font-semibold text-[var(--muted-foreground)] hover:border-red-300 hover:text-red-600"
                                    >
                                        Remove existing
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Asset Name</label>
                            <input
                                {...register('name')}
                                placeholder="e.g. MacBook Pro M3"
                                className={cn(
                                    "w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                    errors.name && "border-red-500 focus:ring-red-200 focus:border-red-500"
                                )}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Category</label>
                            <select
                                {...register('category')}
                                className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                            >
                                {Object.values(AssetCategory).map((cat) => (
                                    <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Status</label>
                            <select
                                {...register('status')}
                                className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                            >
                                {Object.values(AssetStatus).map((status) => (
                                    <option key={status} value={status}>{statusLabels[status]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 text-left">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Serial Number</label>
                            <input
                                {...register('serialNumber')}
                                placeholder="e.g. SER-123456"
                                className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div ref={dropdownRef} className="relative">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Assigned To</label>
                            <input
                                type="text"
                                value={searchUser}
                                onChange={(e) => {
                                    setSearchUser(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="Search and select user..."
                                className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    <div
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-[var(--foreground)]"
                                        onClick={() => {
                                            setValue('assignedTo', '', { shouldDirty: true });
                                            setSearchUser('');
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        Unassigned
                                    </div>
                                    {filteredEmployees.map((emp: any) => (
                                        <div
                                            key={emp.id}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-[var(--foreground)] flex justify-between items-center"
                                            onClick={() => {
                                                setValue('assignedTo', emp.id, { shouldDirty: true });
                                                setSearchUser(emp.name);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <span>{emp.name}</span>
                                            {emp.department?.name && (
                                                <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg ">
                                                    <Briefcase className="w-3.5 h-3.5 text-[#86868B]" />
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded text-gray-500 uppercase font-bold">
                                                        {emp.department.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Purchase Date</label>
                                <input
                                    type="date"
                                    {...register('purchaseDate')}
                                    className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Warranty Expiry</label>
                                <input
                                    type="date"
                                    {...register('warrantyExpiry')}
                                    className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                            className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] rounded-lg transition-colors"
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
