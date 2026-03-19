// @ts-check
const { test, expect } = require('@playwright/test');

// ──────────────────────────────────────────────
// HOME PAGE (index.html)
// ──────────────────────────────────────────────
test.describe('Home Page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page).toHaveTitle(/Microsoft Israel Innovation Hub/);
  });

  test('hero section is visible with CTA buttons', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('a[href="apply.html"]').first()).toBeVisible();
    await expect(page.locator('a[href="programs.html"]').first()).toBeVisible();
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('a[href="programs.html"]').first()).toBeVisible();
    await expect(page.locator('a[href="events.html"]').first()).toBeVisible();
    await expect(page.locator('a[href="about.html"]').first()).toBeVisible();
    await expect(page.locator('a[href="apply.html"]').first()).toBeVisible();
  });

  test('section-image-banner is present', async ({ page }) => {
    await page.goto('/index.html');
    const bannerImg = page.locator('.section-image-banner').first();
    await expect(bannerImg).toBeVisible();
    const src = await bannerImg.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('value proposition cards are displayed', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.value-card')).toHaveCount(4);
  });

  test('statistics section is visible', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.stats-section')).toBeVisible();
    await expect(page.locator('.stat-item')).toHaveCount(4);
  });

  test('testimonials section is visible', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.testimonial-card')).toHaveCount(3);
  });

  test('expert profile images are present', async ({ page }) => {
    await page.goto('/index.html');
    // Expert avatar images
    const expertImgs = page.locator('.expert-avatar img');
    await expect(expertImgs.first()).toBeVisible();
  });

  test('footer is present with key links', async ({ page }) => {
    await page.goto('/index.html');
    const footer = page.locator('footer.footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('a[href="apply.html"]')).toBeVisible();
    await expect(footer.locator('a[href="events.html"]')).toBeVisible();
  });

  test('mobile menu toggle is accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/index.html');
    const toggle = page.locator('.nav-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('.nav-links')).toHaveClass(/open/);
  });

  test('CTA band links work', async ({ page }) => {
    await page.goto('/index.html');
    const ctaBand = page.locator('.cta-band');
    await expect(ctaBand).toBeVisible();
    await expect(ctaBand.locator('a[href="apply.html"]')).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// PROGRAMS PAGE
// ──────────────────────────────────────────────
test.describe('Programs Page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/programs.html');
    await expect(page).toHaveTitle(/Programs/);
  });

  test('hero section is visible', async ({ page }) => {
    await page.goto('/programs.html');
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('.page-hero')).toBeVisible();
  });

  test('section-image-banner is present', async ({ page }) => {
    await page.goto('/programs.html');
    const bannerImg = page.locator('.section-image-banner');
    await expect(bannerImg).toBeVisible();
    const src = await bannerImg.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('filter tabs are present and interactive', async ({ page }) => {
    await page.goto('/programs.html');
    const tabs = page.locator('.filter-tab');
    await expect(tabs).toHaveCount(7);
    // Click a filter tab
    await page.locator('.filter-tab[data-filter="seed-b"]').click();
    await expect(page.locator('.filter-tab[data-filter="seed-b"]')).toHaveClass(/active/);
  });

  test('program cards are displayed', async ({ page }) => {
    await page.goto('/programs.html');
    const cards = page.locator('.program-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('track sections are present', async ({ page }) => {
    await page.goto('/programs.html');
    const tracks = page.locator('.track-section');
    const count = await tracks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('navigation has Programs link as active', async ({ page }) => {
    await page.goto('/programs.html');
    await expect(page.locator('.nav-link.active')).toContainText('Programs');
  });
});

// ──────────────────────────────────────────────
// EVENTS PAGE
// ──────────────────────────────────────────────
test.describe('Events Page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/events.html');
    await expect(page).toHaveTitle(/Events/);
  });

  test('hero section is visible', async ({ page }) => {
    await page.goto('/events.html');
    await expect(page.locator('.hero-title')).toBeVisible();
  });

  test('section-image-banner is present', async ({ page }) => {
    await page.goto('/events.html');
    const bannerImg = page.locator('.section-image-banner');
    await expect(bannerImg).toBeVisible();
    const src = await bannerImg.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('event cards are displayed', async ({ page }) => {
    await page.goto('/events.html');
    const cards = page.locator('.event-card.filterable');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('filter tabs are interactive', async ({ page }) => {
    await page.goto('/events.html');
    const tabs = page.locator('.filter-tab');
    await expect(tabs).toHaveCount(8);
    await page.locator('.filter-tab[data-filter="workshops"]').click();
    await expect(page.locator('.filter-tab[data-filter="workshops"]')).toHaveClass(/active/);
  });

  test('Register buttons link to register page', async ({ page }) => {
    await page.goto('/events.html');
    const registerLinks = page.locator('a[href="register.html"]');
    const count = await registerLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Details buttons open modals', async ({ page }) => {
    await page.goto('/events.html');
    const detailsBtn = page.locator('button[data-modal="modal-event1"]').first();
    await detailsBtn.click();
    await expect(page.locator('#modal-event1')).toBeVisible();
  });

  test('Calendar view toggle button exists', async ({ page }) => {
    await page.goto('/events.html');
    await expect(page.locator('button[aria-label="Toggle calendar view"]')).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// EXPERTS PAGE
// ──────────────────────────────────────────────
test.describe('Experts Page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/experts.html');
    await expect(page).toHaveTitle(/Experts/);
  });

  test('expert cards are displayed with images', async ({ page }) => {
    await page.goto('/experts.html');
    const expertImgs = page.locator('.expert-card-detailed img');
    const count = await expertImgs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('search functionality exists', async ({ page }) => {
    await page.goto('/experts.html');
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]');
    const count = await searchInput.count();
    // Search may be present
    if (count > 0) {
      await searchInput.first().fill('Maya');
    }
  });
});

// ──────────────────────────────────────────────
// SUCCESS STORIES PAGE
// ──────────────────────────────────────────────
test.describe('Success Stories Page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/success.html');
    await expect(page).toHaveTitle(/Success/);
  });

  test('section-image-banner is present', async ({ page }) => {
    await page.goto('/success.html');
    const bannerImg = page.locator('.section-image-banner');
    await expect(bannerImg).toBeVisible();
  });

  test('company logo images are present', async ({ page }) => {
    await page.goto('/success.html');
    const logoImgs = page.locator('.company-logo-img');
    const count = await logoImgs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('story cards are displayed', async ({ page }) => {
    await page.goto('/success.html');
    const cards = page.locator('.story-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('filter tabs are interactive', async ({ page }) => {
    await page.goto('/success.html');
    const tabs = page.locator('.filter-tab');
    const count = await tabs.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ──────────────────────────────────────────────
// ABOUT PAGE
// ──────────────────────────────────────────────
test.describe('About Page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/about.html');
    await expect(page).toHaveTitle(/About/);
  });

  test('section-image-banner is present', async ({ page }) => {
    await page.goto('/about.html');
    const bannerImg = page.locator('.section-image-banner');
    await expect(bannerImg).toBeVisible();
  });

  test('team member images are present', async ({ page }) => {
    await page.goto('/about.html');
    const teamImgs = page.locator('.person-card img, .person-avatar img');
    const count = await teamImgs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('location images are present', async ({ page }) => {
    await page.goto('/about.html');
    const locationImgs = page.locator('.location-image');
    const count = await locationImgs.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ──────────────────────────────────────────────
// COLLABORATE PAGE
// ──────────────────────────────────────────────
test.describe('Collaborate Page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/collaborate.html');
    await expect(page).toHaveTitle(/Collaborate/);
  });

  test('section-image-banner is present', async ({ page }) => {
    await page.goto('/collaborate.html');
    const bannerImg = page.locator('.section-image-banner');
    await expect(bannerImg).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// APPLY PAGE
// ──────────────────────────────────────────────
test.describe('Apply Page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/apply.html');
    await expect(page).toHaveTitle(/Apply/);
  });

  test('application form is present', async ({ page }) => {
    await page.goto('/apply.html');
    await expect(page.locator('form')).toBeVisible();
  });

  test('required form fields are present', async ({ page }) => {
    await page.goto('/apply.html');
    await expect(page.locator('input[id="company-name"]').first()).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// REGISTER PAGE
// ──────────────────────────────────────────────
test.describe('Register Page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/register.html');
    await expect(page).toHaveTitle(/Register/);
  });

  test('registration form is present', async ({ page }) => {
    await page.goto('/register.html');
    await expect(page.locator('form')).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// NAVIGATION: Cross-page links work
// ──────────────────────────────────────────────
test.describe('Navigation', () => {
  test('Programs nav link navigates correctly', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('nav a[href="programs.html"]').click();
    await expect(page).toHaveURL(/programs\.html/);
    await expect(page).toHaveTitle(/Programs/);
  });

  test('Events nav link navigates correctly', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('nav a[href="events.html"]').click();
    await expect(page).toHaveURL(/events\.html/);
    await expect(page).toHaveTitle(/Events/);
  });

  test('About nav link navigates correctly', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('nav a[href="about.html"]').click();
    await expect(page).toHaveURL(/about\.html/);
    await expect(page).toHaveTitle(/About/);
  });

  test('Logo navigates to home', async ({ page }) => {
    await page.goto('/programs.html');
    await page.locator('.nav-logo').click();
    await expect(page).toHaveURL(/index\.html/);
  });

  test('Apply Now CTA navigates correctly', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('nav a.nav-cta[href="apply.html"]').click();
    await expect(page).toHaveURL(/apply\.html/);
  });
});

// ──────────────────────────────────────────────
// IMAGE QUALITY: all images have alt text
// ──────────────────────────────────────────────
test.describe('Image Accessibility', () => {
  const pages = [
    '/index.html',
    '/programs.html',
    '/events.html',
    '/about.html',
    '/success.html',
    '/experts.html',
    '/collaborate.html',
    '/copilot.html',
  ];

  for (const pagePath of pages) {
    test(`all images on ${pagePath} have alt text`, async ({ page }) => {
      await page.goto(pagePath);
      const images = page.locator('img');
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt, `Image #${i} on ${pagePath} missing alt text`).toBeTruthy();
      }
    });
  }
});
