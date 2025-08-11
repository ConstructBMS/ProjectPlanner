import { test, expect } from '@playwright/test';

const ALLOWLIST = [
  /React DevTools/i,
  /ResizeObserver loop limit exceeded/i,
  /Sourcemap for .* not found/i,
  /User settings not found/i,
  /No projects found in ConstructBMS database/i,
  /Failed to load resource: the server responded with a status of 400/i,
];

test('no console errors or warnings on main view', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  page.on('console', msg => {
    const kind = msg.type(); // log | warning | error
    const text = msg.text();
    if (ALLOWLIST.some(rx => rx.test(text))) return;
    if (kind === 'error') errors.push(text);
    if (kind === 'warning') warnings.push(text);
  });

  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');

  if (errors.length || warnings.length) {
    console.log('Console warnings:', warnings);
    console.log('Console errors:', errors);
    expect(errors, 'Console errors found').toEqual([]);
    expect(warnings, 'Console warnings found').toEqual([]);
  }
});
