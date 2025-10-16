"use client";

import { useEffect, useState } from "react";

export default function TestComponent() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Initial");

  useEffect(() => {
    console.log("TestComponent useEffect triggered");
    
    // Simple test - just update state after 1 second
    setTimeout(() => {
      console.log("TestComponent timeout completed");
      setLoading(false);
      setMessage("Updated after 1 second");
    }, 1000);
  }, []);

  console.log("TestComponent render - loading:", loading, "message:", message);

  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-4" />
        <p className="text-white text-lg">Test Loading...</p>
        <p className="text-gray-400 text-sm mt-2">Debug: Loading={loading.toString()}</p>
        <p className="text-gray-400 text-sm mt-2">Message: {message}</p>
        <p className="text-gray-400 text-sm mt-2">Component mounted: {new Date().toISOString()}</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/90 z-10">
      <p className="text-white text-lg">Test Complete!</p>
      <p className="text-gray-400 text-sm mt-2">Debug: Loading={loading.toString()}</p>
      <p className="text-gray-400 text-sm mt-2">Message: {message}</p>
    </div>
  );
}


