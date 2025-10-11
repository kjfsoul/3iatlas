import { test, expect } from '@playwright/test';

test.describe('3I/ATLAS 3D Tracker - All Views', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the 3D tracker to load
    await page.waitForSelector('[data-testid="atlas-3d-tracker"]', { timeout: 30000 });
  });

  test('Historical Flight View - Timeline and Controls', async ({ page }) => {
    // Switch to Historical Flight view
    await page.click('[data-testid="view-selector"] button:has-text("Historical Flight")');
    
    // Wait for view to load
    await page.waitForSelector('[data-testid="historical-flight-view"]', { timeout: 10000 });
    
    // Check timeline controls are present
    await expect(page.locator('[data-testid="timeline-scrubber"]')).toBeVisible();
    await expect(page.locator('[data-testid="play-pause-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="speed-control"]')).toBeVisible();
    
    // Test play/pause functionality
    await page.click('[data-testid="play-pause-button"]');
    await page.waitForTimeout(1000);
    
    // Test speed control
    await page.fill('[data-testid="speed-control"] input', '5');
    await page.waitForTimeout(500);
    
    // Check for trail visibility
    await expect(page.locator('[data-testid="comet-trail"]')).toBeVisible();
  });

  test('Current Moment View - Camera Controls', async ({ page }) => {
    // Switch to Current Moment view
    await page.click('[data-testid="view-selector"] button:has-text("Current Moment")');
    
    // Wait for view to load
    await page.waitForSelector('[data-testid="current-moment-view"]', { timeout: 10000 });
    
    // Check camera controls
    await expect(page.locator('[data-testid="camera-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="zoom-controls"]')).toBeVisible();
    
    // Test zoom functionality
    await page.click('[data-testid="zoom-in"]');
    await page.waitForTimeout(500);
    await page.click('[data-testid="zoom-out"]');
    
    // Check for object labels
    await expect(page.locator('[data-testid="object-labels"]')).toBeVisible();
  });

  test('Speed Simulation View - Motion Effects', async ({ page }) => {
    // Switch to Speed Simulation view
    await page.click('[data-testid="view-selector"] button:has-text("Speed Simulation")');
    
    // Wait for view to load
    await page.waitForSelector('[data-testid="speed-simulation-view"]', { timeout: 15000 });
    
    // Check for motion effects
    await expect(page.locator('[data-testid="motion-blur"]')).toBeVisible();
    await expect(page.locator('[data-testid="velocity-vector"]')).toBeVisible();
    
    // Test camera rotation around comet
    await page.click('[data-testid="camera-rotation-control"]');
    await page.waitForTimeout(1000);
    
    // Check for star field effects
    await expect(page.locator('[data-testid="star-field"]')).toBeVisible();
  });

  test('Perihelion Event View - Solar Effects', async ({ page }) => {
    // Switch to Perihelion Event view
    await page.click('[data-testid="view-selector"] button:has-text("Perihelion Event")');
    
    // Wait for view to load
    await page.waitForSelector('[data-testid="perihelion-event-view"]', { timeout: 15000 });
    
    // Check for solar effects
    await expect(page.locator('[data-testid="solar-corona"]')).toBeVisible();
    await expect(page.locator('[data-testid="comet-tail"]')).toBeVisible();
    
    // Test time-lapse controls
    await page.click('[data-testid="time-lapse-control"]');
    await page.waitForTimeout(2000);
    
    // Check for heat/radiation effects
    await expect(page.locator('[data-testid="heat-particles"]')).toBeVisible();
  });

  test('Trajectory Plotter View - Interactive Controls', async ({ page }) => {
    // Switch to Trajectory Plotter view
    await page.click('[data-testid="view-selector"] button:has-text("Trajectory Plotter")');
    
    // Wait for view to load
    await page.waitForSelector('[data-testid="trajectory-plotter-view"]', { timeout: 15000 });
    
    // Check for trajectory controls
    await expect(page.locator('[data-testid="trajectory-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="physics-dashboard"]')).toBeVisible();
    
    // Test trajectory manipulation
    await page.click('[data-testid="drag-trajectory"]');
    await page.waitForTimeout(1000);
    
    // Check for real-time calculations
    await expect(page.locator('[data-testid="velocity-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="acceleration-display"]')).toBeVisible();
  });

  test('View Switching - All Views Accessible', async ({ page }) => {
    const views = ['Historical Flight', 'Current Moment', 'Speed Simulation', 'Perihelion Event', 'Trajectory Plotter'];
    
    for (const viewName of views) {
      // Click on view selector
      await page.click(`[data-testid="view-selector"] button:has-text("${viewName}")`);
      
      // Wait for view to load (with longer timeout for complex views)
      await page.waitForTimeout(2000);
      
      // Verify view is active
      const activeView = page.locator(`[data-testid="view-selector"] button:has-text("${viewName}")`);
      await expect(activeView).toHaveClass(/active/);
    }
  });

  test('Performance - No Crashes or Excessive Load Times', async ({ page }) => {
    // Monitor console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Test all views quickly
    const views = ['Historical Flight', 'Current Moment', 'Speed Simulation', 'Perihelion Event', 'Trajectory Plotter'];
    
    for (const viewName of views) {
      await page.click(`[data-testid="view-selector"] button:has-text("${viewName}")`);
      await page.waitForTimeout(1000);
    }
    
    // Check for critical errors (filter out browser extension errors)
    const criticalErrors = errors.filter(error => 
      !error.includes('runtime.lastError') && 
      !error.includes('Could not establish connection') &&
      !error.includes('Receiving end does not exist')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Data Loading - No NaN Values', async ({ page }) => {
    // Monitor for NaN-related errors
    const nanErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('NaN')) {
        nanErrors.push(msg.text());
      }
    });
    
    // Test data-heavy views
    await page.click('[data-testid="view-selector"] button:has-text("Speed Simulation")');
    await page.waitForTimeout(3000);
    
    await page.click('[data-testid="view-selector"] button:has-text("Trajectory Plotter")');
    await page.waitForTimeout(3000);
    
    // Check for NaN errors
    expect(nanErrors).toHaveLength(0);
  });
});
