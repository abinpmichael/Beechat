const { test, expect } = require('@playwright/test');

test.describe('Chat Widget Integration', () => {
  // Assuming there's a demo page or we inject the widget into a blank page
  // For the sake of the test, let's navigate to the main site which has the widget
  // or a specific route that mounts it
  
  test('should load the chat widget', async ({ page }) => {
    // Navigate to a page with the widget embedded (e.g., the test index or a demo site)
    // We'll use localhost/Bee/client/dist or a demo page. We'll use a mocked index if needed.
    // Assuming the React app mounts the widget or a demo component on / 
    await page.goto('/');
    
    // Wait for the widget button to appear
    const widgetButton = page.locator('button').filter({ hasText: 'Hello' }).or(page.locator('svg').nth(-1)); // Generic selector logic depending on implementation
    
    // As per previous implementations, the widget button has a distinct SVG (MessageSquare)
    const button = page.locator('button.w-20.h-20');
    await expect(button).toBeVisible();
  });

  test('should open chat window and send a message', async ({ page }) => {
    await page.goto('/');
    
    // Click to open widget
    const button = page.locator('button.w-20.h-20');
    await button.click();
    
    // The chat window should appear
    const chatWindow = page.locator('div.w-\\[400px\\]');
    await expect(chatWindow).toBeVisible();
    
    // Type a message
    const input = page.locator('input[placeholder="Enter message to hive..."]');
    await input.fill('Hello from Playwright');
    await input.press('Enter');
    
    // Verify message appears in chat
    const userMessage = page.locator('text=Hello from Playwright');
    await expect(userMessage).toBeVisible();
  });
});
