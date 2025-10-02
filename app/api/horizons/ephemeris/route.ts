/**
 * Server-side proxy for NASA Horizons Main API
 * Solves CORS issues by making requests from server instead of browser
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const HORIZONS_MAIN_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Extract all query parameters
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    params.append(key, value);
  });

  // Ensure format is JSON if not specified
  if (!params.has('format')) {
    params.set('format', 'json');
  }

  try {
    const url = `${HORIZONS_MAIN_URL}?${params.toString()}`;
    console.log(`[API Proxy] Fetching ephemeris from Horizons...`);
    console.log(`[API Proxy] Command: ${params.get('COMMAND')}`);
    console.log(`[API Proxy] Date range: ${params.get('START_TIME')} to ${params.get('STOP_TIME')}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': '3IAtlas-Tracker/1.0',
      },
    });

    if (!response.ok) {
      console.error(`[API Proxy] Horizons returned ${response.status}`);
      return NextResponse.json(
        { error: `Horizons API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API Proxy] Successfully fetched ephemeris data`);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400', // 7 days
      },
    });
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
