'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/config';

interface AssetImageViewerProps {
  images: string[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
  title?: string;
}

export function AssetImageViewer({
  images,
  open,
  onClose,
  initialIndex = 0,
  title,
}: AssetImageViewerProps) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (!open) return;
    setCurrentIndex(Math.min(initialIndex, Math.max(safeImages.length - 1, 0)));
  }, [initialIndex, open, safeImages.length]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && safeImages.length > 1) {
        setCurrentIndex((current) => (current - 1 + safeImages.length) % safeImages.length);
      }
      if (event.key === 'ArrowRight' && safeImages.length > 1) {
        setCurrentIndex((current) => (current + 1) % safeImages.length);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, safeImages.length]);

  useEffect(() => {
    if (currentIndex >= safeImages.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, safeImages.length]);

  if (!open || !safeImages.length) {
    return null;
  }

  const currentImage = resolveMediaUrl(safeImages[currentIndex]) || safeImages[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          onClick={(event) => event.stopPropagation()}
          className="relative flex w-full max-w-5xl flex-col gap-4 rounded-3xl border border-white/10 bg-[#0F1115] p-4 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                Asset Gallery
              </p>
              <h3 className="truncate text-lg font-semibold">
                {title || `Image ${currentIndex + 1} of ${safeImages.length}`}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
            <div className="flex min-h-[320px] items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
              <img
                src={currentImage}
                alt={`Asset ${currentIndex + 1}`}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((current) => (current - 1 + safeImages.length) % safeImages.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((current) => (current + 1) % safeImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {safeImages.map((image, index) => {
              const resolved = resolveMediaUrl(image) || image;
              const active = index === currentIndex;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={[
                    'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition-all',
                    active
                      ? 'border-white ring-2 ring-white/70'
                      : 'border-white/10 opacity-70 hover:opacity-100',
                  ].join(' ')}
                >
                  <img src={resolved} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AssetImageViewer;
