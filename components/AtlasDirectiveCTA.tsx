'use client';

import type React from 'react';
import { motion, type MotionProps } from 'framer-motion';
import { handleSmoothScroll } from '@/lib/smooth-scroll';

const MotionDiv = motion.div as React.FC<MotionProps & React.HTMLAttributes<HTMLDivElement>>;
const MotionButton = motion.button as React.FC<MotionProps & React.ButtonHTMLAttributes<HTMLButtonElement>>;
const MotionSvg = motion.svg as React.FC<MotionProps & React.SVGAttributes<SVGSVGElement>>;
const MotionP = motion.p as React.FC<MotionProps & React.HTMLAttributes<HTMLParagraphElement>>;

export default function AtlasDirectiveCTA() {
  return (
    <section className="mt-10">
      <MotionDiv
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-black/40 p-8"
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-30">
          <MotionDiv
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="h-full w-full"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <MotionDiv
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Icon */}
            <MotionDiv
              animate={{
                rotateY: [0, 360],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="mx-auto mb-4 inline-block text-6xl"
            >
              🌠
            </MotionDiv>

            {/* Main text */}
            <h2 className="mb-2 text-3xl font-bold text-white md:text-4xl">
              Guide 3I/Atlas' Destiny
            </h2>
            
            <p className="mb-6 text-lg text-white/70">
              Your choices will shape humanity's future
            </p>
          </MotionDiv>

          {/* CTA Button with pulse animation */}
          <MotionButton
            type="button"
            onClick={() => handleSmoothScroll('game-section', { duration: 3500 })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/50"
          >
            {/* Animated glow */}
            <MotionDiv
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 blur-xl"
            />

            <span className="relative">CLICK HERE</span>
            
            {/* Arrow with bounce animation */}
            <MotionSvg
              animate={{
                y: [0, 5, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </MotionSvg>
          </MotionButton>

          {/* Subtitle hint */}
          <MotionP
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-4 text-sm text-white/50"
          >
            Scroll through our universe to discover the directive
          </MotionP>
        </div>

        {/* Decorative corner accents */}
        <div className="pointer-events-none absolute left-0 top-0 h-20 w-20 border-l-2 border-t-2 border-white/20" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 border-b-2 border-r-2 border-white/20" />
      </MotionDiv>
    </section>
  );
}

