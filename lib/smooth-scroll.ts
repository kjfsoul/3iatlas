/**
 * Smooth scroll utility with configurable duration and easing
 * Allows "window-browsing" effect as users scroll past content
 */

export interface SmoothScrollOptions {
  /** Target element ID or element itself */
  target: string | HTMLElement;
  /** Duration in milliseconds (default: 3500ms for window-browsing) */
  duration?: number;
  /** Offset from top in pixels (for fixed headers, etc.) */
  offset?: number;
  /** Easing function (default: easeInOutCubic) */
  easing?: (t: number) => number;
}

/**
 * Easing function for natural deceleration
 * Uses cubic bezier curve for smooth motion
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Perform smooth scroll to target element
 * @param options - Scroll configuration options
 */
export function smoothScrollTo(options: SmoothScrollOptions): void {
  const {
    target,
    duration = 3500, // 3.5 seconds for window-browsing effect
    offset = 0,
    easing = easeInOutCubic,
  } = options;

  // Get target element
  const targetElement =
    typeof target === 'string'
      ? document.getElementById(target.replace('#', ''))
      : target;

  if (!targetElement) {
    console.warn(`Smooth scroll target not found: ${target}`);
    return;
  }

  // Calculate positions
  const startPosition = window.pageYOffset;
  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
  const distance = targetPosition - startPosition;
  
  let startTime: number | null = null;

  // Animation function
  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Apply easing function
    const easedProgress = easing(progress);
    
    // Calculate new position
    const newPosition = startPosition + distance * easedProgress;
    window.scrollTo(0, newPosition);

    // Continue animation if not complete
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  // Start animation
  requestAnimationFrame(animation);
}

/**
 * Hook to handle smooth scroll with click event
 * Usage: onClick={() => handleSmoothScroll('target-id')}
 */
export function handleSmoothScroll(
  targetId: string,
  options?: Omit<SmoothScrollOptions, 'target'>
): void {
  smoothScrollTo({
    target: targetId,
    ...options,
  });
}

