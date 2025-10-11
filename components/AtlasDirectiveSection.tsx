'use client';

import { useState } from 'react';
import type React from 'react';
import { motion, type MotionProps } from 'framer-motion';
import AtlasDirectiveModal from './AtlasDirectiveModal';

const MotionDiv = motion.div as React.FC<MotionProps & React.HTMLAttributes<HTMLDivElement>>;

export default function AtlasDirectiveSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section
        id="game-section"
        className="mt-10 scroll-mt-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-black/20 p-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          {/* Header */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              The ATLAS Directive
            </h2>
            <p className="mb-2 text-lg text-white/70">
              An Interactive Narrative Experience
            </p>
          </MotionDiv>

          {/* Description */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 space-y-3 text-white/80"
          >
            <p>
              Step into a world where your decisions shape the outcome of humanity's
              encounter with 3I/ATLAS.
            </p>
            <p>
              Navigate complex choices, uncover hidden truths, and determine the fate
              of our species in this immersive story-driven game.
            </p>
          </MotionDiv>

          {/* CTA Button */}
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/50"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 blur-xl transition-opacity group-hover:opacity-30" />
              
              <span className="relative flex items-center gap-2">
                Enter The Directive
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </button>
          </MotionDiv>

          {/* Feature Highlights */}
          <MotionDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 grid gap-6 md:grid-cols-3"
          >
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-2xl">🎭</div>
              <h3 className="mb-1 font-semibold text-white">Dynamic Narrative</h3>
              <p className="text-sm text-white/60">
                Every choice branches into unique storylines
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-2xl">🌌</div>
              <h3 className="mb-1 font-semibold text-white">Immersive World</h3>
              <p className="text-sm text-white/60">
                Explore the mysteries of 3I/ATLAS
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-2xl">⚡</div>
              <h3 className="mb-1 font-semibold text-white">Consequential Choices</h3>
              <p className="text-sm text-white/60">
                Your decisions have lasting impact
              </p>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Modal */}
      <AtlasDirectiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

