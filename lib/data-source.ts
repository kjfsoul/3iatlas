/**
 * Data source selection
 * NEXT_PUBLIC_DATA_SOURCE=astronomy -> use internal calculations (no network)
 * default -> existing Horizons workflow
 */

export function isAstronomyMode(): boolean {
  if (typeof process !== 'undefined') {
    const v = process.env.NEXT_PUBLIC_DATA_SOURCE || '';
    console.log('[Data Source] Process env NEXT_PUBLIC_DATA_SOURCE:', v);
    return v.toLowerCase() === 'astronomy';
  }
  // Runtime guard (browser)
  try {
    // @ts-ignore
    const v = (window as any).NEXT_PUBLIC_DATA_SOURCE || '';
    console.log('[Data Source] Window NEXT_PUBLIC_DATA_SOURCE:', v);
    return typeof v === 'string' && v.toLowerCase() === 'astronomy';
  } catch {
    return false;
  }
}
