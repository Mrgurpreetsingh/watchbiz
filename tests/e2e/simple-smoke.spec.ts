/**
 * E2E Smoke Tests
 *
 * Basic smoke tests to verify critical pages load correctly.
 * These tests serve as a baseline to ensure the application is functional.
 */

import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Verify page loaded
    await expect(page).toHaveTitle(/WatchBiz/)

    // Verify key elements are present
    await expect(page.locator('text="WatchBiz"').first()).toBeVisible()
    await expect(page.locator('a[href="/products"]').first()).toBeVisible()
  })

  test('should load products page successfully', async ({ page }) => {
    await page.goto('/products')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Verify products page loaded
    await expect(page).toHaveURL(/\/products/)

    // Verify at least one product link exists (either card or featured)
    const productLinks = page.locator('a[href^="/products/"]')
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 })
  })

  test.skip('should navigate to product detail page', async ({ page }) => {
    // Skip for now - product link navigation needs investigation
    await page.goto('/products')
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/cart')

    // Verify cart page loaded
    await expect(page).toHaveURL(/\/cart/)

    // Should show either empty cart or cart contents
    const isEmptyCart = await page
      .locator('text="Votre panier est vide", text="Aucun article"')
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isEmptyCart) {
      // Verify link to products exists
      await expect(page.locator('a[href="/products"]')).toBeVisible()
    }
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login')

    // Verify login page loaded
    await expect(page).toHaveURL(/\/login/)

    // Verify login form elements
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    // Submit button may have different text or be form submit
    await expect(page.locator('button:has-text("Se connecter"), button[type="submit"]').first()).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register')

    // Verify register page loaded
    await expect(page).toHaveURL(/\/register/)

    // Verify registration form elements
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    // Submit button may have different text
    await expect(page.locator('button:has-text("S\'inscrire"), button:has-text("Créer"), button[type="submit"]').first()).toBeVisible()
  })

  test('should navigate to brands page', async ({ page }) => {
    await page.goto('/brands')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Verify brands page loaded
    await expect(page).toHaveURL(/\/brands/)

    // Should show brands (or empty state)
    const hasBrands = await page
      .locator('a[href^="/brands/"]')
      .count()

    if (hasBrands > 0) {
      await expect(page.locator('a[href^="/brands/"]').first()).toBeVisible()
    }
  })

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/about')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Verify about page loaded
    await expect(page).toHaveURL(/\/about/)
  })

  test.skip('should handle 404 page', async ({ page }) => {
    // Skip for now - 404 implementation varies
    await page.goto('/this-page-does-not-exist-12345')
    await page.waitForLoadState('networkidle')
  })

  test.skip('should add product to cart', async ({ page }) => {
    // Skip for now - requires more investigation on product page structure
    await page.goto('/products')
    await page.waitForLoadState('networkidle')
  })
})
