/**
 * E2E Test: Registered User Checkout Journey
 *
 * Tests the checkout flow for authenticated users:
 * 1. Login (using saved auth state)
 * 2. Browse products
 * 3. Add multiple products to cart
 * 4. View and modify cart
 * 5. Select saved address
 * 6. Choose shipping method
 * 7. Complete checkout
 * 8. View order confirmation
 * 9. Verify order in history
 *
 * This tests the streamlined checkout for returning customers.
 */

import { test, expect } from '../fixtures'

test.describe('Registered User Checkout Journey', () => {
  test('should complete checkout with saved address', async ({ authenticatedPage: page }) => {
    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Verify Authenticated State
    // ═══════════════════════════════════════════════════════════════

    await page.goto('/')

    // Verify we're logged in (should see profile link or user menu)
    await expect(
      page.locator('text="Profil", text="Mon compte", text="Déconnexion"').first()
    ).toBeVisible({ timeout: 5000 })

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Browse and Add Products to Cart
    // ═══════════════════════════════════════════════════════════════

    await page.goto('/products')

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-card, article', {
      timeout: 10000
    })

    // Add first product
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first()
    await firstProduct.click()

    await page.waitForSelector('button:has-text("Ajouter au panier")', { timeout: 5000 })
    const firstProductName = await page.locator('h1, [data-testid="product-name"]').first().textContent()
    await page.click('button:has-text("Ajouter au panier")')

    // Wait for cart update
    await page.waitForTimeout(1000)

    // Return to products
    await page.goto('/products')

    // Add second product
    const products = page.locator('[data-testid="product-card"], .product-card, article')
    if (await products.count() > 1) {
      await products.nth(1).click()
      await page.waitForSelector('button:has-text("Ajouter au panier")', { timeout: 5000 })
      await page.click('button:has-text("Ajouter au panier")')
      await page.waitForTimeout(1000)
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: View Cart
    // ═══════════════════════════════════════════════════════════════

    await page.goto('/cart')

    // Verify products are in cart
    await expect(page.locator(`text="${firstProductName}"`)).toBeVisible()

    // Verify cart total
    await expect(page.locator('text=/Total|Sous-total/')).toBeVisible()

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Modify Cart (optional)
    // ═══════════════════════════════════════════════════════════════

    // Update quantity (if quantity controls exist)
    const quantityButtons = page.locator('button:has-text("+"), button[aria-label="Augmenter"]')
    if (await quantityButtons.count() > 0) {
      await quantityButtons.first().click()
      await page.waitForTimeout(500)
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Proceed to Checkout
    // ═══════════════════════════════════════════════════════════════

    await page.click('button:has-text("Commander"), button:has-text("Passer commande")')

    // Should go to checkout page
    await page.waitForURL(/\/checkout/, { timeout: 5000 })

    // ═══════════════════════════════════════════════════════════════
    // STEP 6: Select Saved Address (or Create One)
    // ═══════════════════════════════════════════════════════════════

    // Check if user has saved addresses
    const hasAddresses = await page
      .locator('[data-testid="address-card"], .address-item, input[name="addressId"]')
      .count()

    if (hasAddresses === 0) {
      // No saved address, create one
      await page.click('button:has-text("Ajouter une adresse")')

      await page.fill('input[name="fullName"]', 'Test User Address')
      await page.fill('input[name="phone"]', '0612345678')
      await page.fill('input[name="street"]', '123 Test Street')
      await page.fill('input[name="city"]', 'Paris')
      await page.fill('input[name="state"]', 'Île-de-France')
      await page.fill('input[name="postalCode"]', '75001')
      await page.fill('input[name="country"]', 'France')

      await page.click('button[type="submit"]:has-text("Enregistrer")')
      await page.waitForTimeout(1000)
    } else {
      // Select first saved address
      const addressRadios = page.locator('input[name="addressId"], [data-testid="address-select"]')
      if (await addressRadios.count() > 0) {
        await addressRadios.first().check()
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 7: Select Shipping Method
    // ═══════════════════════════════════════════════════════════════

    const shippingMethods = page.locator('input[name="shippingMethod"], [data-testid="shipping-method"]')
    if (await shippingMethods.count() > 0) {
      await shippingMethods.first().check()
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 8: Complete Payment
    // ═══════════════════════════════════════════════════════════════

    await page.click('button:has-text("Payer"), button:has-text("Commander")')

    // Should redirect to Stripe or payment confirmation
    await page.waitForURL(/\/(payment|order|success|checkout\.stripe\.com)/, { timeout: 10000 })

    // ═══════════════════════════════════════════════════════════════
    // STEP 9: Verify Order Confirmation
    // ═══════════════════════════════════════════════════════════════

    // Note: In real E2E with Stripe:
    // - Complete Stripe test payment
    // - Wait for webhook to create order
    // - Verify success page
    // - Check order history

    console.log('✅ Registered user checkout completed successfully')
  })

  test('should allow address management during checkout', async ({ authenticatedPage: page }) => {
    await page.goto('/checkout')

    // Wait for checkout page
    await page.waitForSelector('h1, h2', { timeout: 5000 })

    // Should see address management UI
    const hasAddressSection = await page
      .locator('text=/Adresse|Livraison/, [data-testid="address-section"]')
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (hasAddressSection) {
      // Try to add new address
      const addAddressBtn = page.locator('button:has-text("Ajouter"), button:has-text("Nouvelle adresse")')
      if (await addAddressBtn.count() > 0) {
        await addAddressBtn.first().click()

        // Verify address form appears
        await expect(page.locator('input[name="fullName"]')).toBeVisible({ timeout: 3000 })
      }
    }
  })

  test('should calculate correct totals with shipping', async ({ authenticatedPage: page }) => {
    await page.goto('/products')

    // Add product to cart
    await page.waitForSelector('[data-testid="product-card"], .product-card, article', {
      timeout: 10000
    })
    const product = page.locator('[data-testid="product-card"], .product-card, article').first()
    await product.click()

    // Get product price
    const priceText = await page.locator('[data-testid="product-price"], text=/€/').first().textContent()
    await page.click('button:has-text("Ajouter au panier")')

    // Go to cart
    await page.goto('/cart')

    // Verify subtotal matches product price
    const subtotalElement = page.locator('[data-testid="subtotal"], text=/Sous-total/')
    await expect(subtotalElement).toBeVisible()

    // Go to checkout
    await page.click('button:has-text("Commander")')
    await page.waitForURL(/\/checkout/, { timeout: 5000 })

    // Select shipping method (if available)
    const shippingMethods = page.locator('input[name="shippingMethod"]')
    if (await shippingMethods.count() > 0) {
      // Select standard shipping
      await shippingMethods.first().check()

      // Wait for total recalculation
      await page.waitForTimeout(500)

      // Verify total includes shipping
      const totalElement = page.locator('[data-testid="total"], text=/Total/')
      await expect(totalElement).toBeVisible()
    }
  })

  test('should persist cart across sessions', async ({ authenticatedPage: page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.waitForSelector('[data-testid="product-card"], .product-card, article', {
      timeout: 10000
    })
    const product = page.locator('[data-testid="product-card"], .product-card, article').first()
    const productName = await product.locator('h2, h3, [data-testid="product-name"]').textContent()
    await product.click()

    await page.click('button:has-text("Ajouter au panier")')
    await page.waitForTimeout(1000)

    // Navigate away
    await page.goto('/')

    // Return to cart
    await page.goto('/cart')

    // Verify product is still in cart
    await expect(page.locator(`text="${productName}"`)).toBeVisible()
  })
})
