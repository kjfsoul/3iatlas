'use client';

import { useEffect } from 'react';
import type React from 'react';
import { motion, AnimatePresence, type MotionProps } from 'framer-motion';
import { createPortal } from 'react-dom';

const MotionDiv = motion.div as React.FC<MotionProps & React.HTMLAttributes<HTMLDivElement>>;

interface AtlasDirectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AtlasDirectiveModal({ isOpen, onClose }: AtlasDirectiveModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (typeof window === 'undefined') return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-4 z-50 mx-auto my-auto flex max-h-[90vh] max-w-7xl items-center justify-center md:inset-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-black/95 to-black/98 shadow-2xl">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-lg bg-white/10 p-2 text-white/80 transition-all hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="max-w-2xl"
                >
                  <h2 id="modal-title" className="mb-6 text-4xl font-bold text-white md:text-5xl">
                    The ATLAS Directive
                  </h2>
                  <div className="mb-8 space-y-4 text-lg text-white/80">
                    <p>Prepare to guide the fate of 3I/ATLAS through an immersive narrative experience.</p>
                    <p>Your choices will shape the destiny of humanity's first contact with an interstellar visitor.</p>
                  </div>
                  <div className="inline-block">
                    <div className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-6 py-3">
                      <span className="text-xl font-semibold text-emerald-400">Coming Soon</span>
                    </div>
                  </div>
                  <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-8">
                    <p className="text-sm text-white/60">
                      The full interactive experience is currently under development.
                      <br />
                      Stay tuned for the launch of this groundbreaking narrative game.
                    </p>
                  </div>
                </MotionDiv>
              </div>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

