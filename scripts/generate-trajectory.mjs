// scripts/generate-trajectory.mjs

import { AstroTime, Body, HelioState } from 'astronomy-engine';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const START_DATE = '2025-07-01T00:00:00.000Z';
const END_DATE = '2026-01-01T00:00:00.000Z';
const STEP_DAYS = 1; // One data point per day

// Note: For 3I/ATLAS hyperbolic trajectory, we would need additional functions
// from the existing codebase (astronomy-engine-source.ts)

// --- Helper Functions ---
function generateVectors(bodyName, start, end, step) {
    const vectors = [];
    let currentDate = new Date(start);
    const endDate = new Date(end);
    
    // Map body names to Body enum
    const bodyMap = {
        'Earth': Body.Earth,
        'Mars': Body.Mars,
        'Mercury': Body.Mercury,
        'Venus': Body.Venus,
        'Jupiter': Body.Jupiter,
        'Saturn': Body.Saturn,
        'Uranus': Body.Uranus,
        'Neptune': Body.Neptune
    };
    
    const body = bodyMap[bodyName];
    if (!body) {
        console.error(`Unknown body: ${bodyName}`);
        return vectors;
    }
    
    while (currentDate <= endDate) {
        const astroTime = new AstroTime(currentDate);
        const vector = HelioState(body, astroTime);
        vectors.push({ 
            date: currentDate.toISOString(), 
            position: { x: vector.x, y: vector.y, z: vector.z },
            velocity: { vx: vector.vx, vy: vector.vy, vz: vector.vz }
        });
        currentDate.setDate(currentDate.getDate() + step);
    }
    return vectors;
}

// --- Main Execution ---
console.log('Generating trajectory data...');

const trajectoryData = {
    earth: generateVectors('Earth', START_DATE, END_DATE, STEP_DAYS),
    mars: generateVectors('Mars', START_DATE, END_DATE, STEP_DAYS),
};

const outputPath = path.resolve(process.cwd(), 'public', 'trajectory.json');
fs.writeFileSync(outputPath, JSON.stringify(trajectoryData, null, 2));

console.log(`✅ Trajectory data successfully generated and saved to: ${outputPath}`);
