"use client";

import React from "react";

interface TelemetryHUDProps {
  distanceFromSun: number;
  currentVelocity: number;
  currentDate: string;
  className?: string;
}

const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  distanceFromSun,
  currentVelocity,
  currentDate,
  className = "",
}) => {
  // Format distance with appropriate units
  const formatDistance = (distance: number): string => {
    if (distance >= 1) {
      return `${distance.toFixed(2)} AU`;
    } else {
      return `${(distance * 149597870.7).toFixed(0)} km`;
    }
  };

  // Format velocity with appropriate units
  const formatVelocity = (velocity: number): string => {
    if (velocity >= 1) {
      return `${velocity.toFixed(2)} km/s`;
    } else {
      return `${(velocity * 1000).toFixed(0)} m/s`;
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    if (!dateString) return "Loading...";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className={`absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-4 font-mono text-sm ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-green-400">Date:</span>
          <span className="text-white">{formatDate(currentDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-400">Distance:</span>
          <span className="text-white">{formatDistance(distanceFromSun)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">Velocity:</span>
          <span className="text-white">{formatVelocity(currentVelocity)}</span>
        </div>
      </div>
    </div>
  );
};

export default TelemetryHUD;
