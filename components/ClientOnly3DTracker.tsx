"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// This component's SOLE PURPOSE is to dynamically import the main tracker,
// ensuring it and all its children are only ever rendered on the client.

const Atlas3DTrackerWrapper = dynamic(
  () => import("@/components/Atlas3DTrackerWrapper"),
  {
    ssr: false, // The most important part: disable server-side rendering
    loading: () => (
      // A placeholder to show while the heavy 3D component is loading
      <div className="flex h-full items-center justify-center rounded-xl bg-black/50">
        <div className="text-center">
          <div className="mb-4 inline-block h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-green-500" />
          <p className="text-lg text-white">Initializing 3D Tracker...</p>
        </div>
      </div>
    ),
  }
);

// This is the component we will use in our server-side page.tsx
export default function ClientOnly3DTracker() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center rounded-xl bg-black/50">
        <div className="text-center">
          <div className="mb-4 inline-block h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-green-500" />
          <p className="text-lg text-white">Loading 3D Solar System...</p>
        </div>
      </div>
    }>
      <Atlas3DTrackerWrapper
        startDate="2025-10-01"
        endDate="2025-10-31"
        stepSize="6h"
        autoPlay={true}
        playbackSpeed={2}
      />
    </Suspense>
  );
}
