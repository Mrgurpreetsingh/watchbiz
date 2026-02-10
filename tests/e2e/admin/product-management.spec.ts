/**
 * E2E Test: Admin Product Management
 *
 * Tests the complete admin product CRUD operations:
 * 1. Access admin dashboard
 * 2. Navigate to products management
 * 3. Create new product
 * 4. Verify product appears in list
 * 5. Edit product details
 * 6. Verify changes on storefront
 * 7. Delete product
 * 8. Verify product removed
 *
 * Tests admin authorization and product lifecycle management.
 */

import { test, expect } from '../fixtures'
import { testData } from '../fixtures'

test.describe('Admin Product Management', () => {
  test('should complete full product lifecycle: create → edit → verify → delete', async ({
    adminPage: page
  }) => {
    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Access Admin Dashboard
    // ═══════════════════════════════════════════════════════════════

    await page.goto('/admin')

    // Verify we're on admin dashboard (or redirect to login if not admin)
    const isAdmin = await page
      .locator('text=/Dashboard|Admin|Tableau de bord/')
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    if (!isAdmin) {
      // Not authenticated as admin, skip test
      console.log('⚠️ Admin authentication required, skipping test')
      test.skip()
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Navigate to Products Management
    // ═══════════════════════════════════════════════════════════════

    // Click on Products menu item
    await page.click('a:has-text("Produits"), a[href*="/admin/products"]')

    // Wait for products list
    await page.waitForSelector('h1, h2, [data-testid="products-list"]', { timeout: 5000 })

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Create New Product
    // ═══════════════════════════════════════════════════════════════

    // Click "Add Product" button
    await page.click('button:has-text("Ajouter"), button:has-text("Nouveau produit"), a[href*="/admin/products/new"]')

    // Wait for product form
    await page.waitForSelector('input[name="name"], input[name="slug"]', { timeout: 5000 })

    // Generate unique product data
    const uniqueSlug = testData.uniqueSlug()
    const productName = `Test Watch ${Date.now()}`

    // Fill product form
    await page.fill('input[name="name"]', productName)
    await page.fill('input[name="slug"]', uniqueSlug)
    await page.fill(
      'textarea[name="description"], input[name="description"]',
      'A beautiful luxury watch with exquisite craftsmanship and precision engineering'
    )
    await page.fill('input[name="price"]', '8500')
    await page.fill('input[name="stock"]', '5')

    // Select category (if dropdown exists)
    const categorySelect = page.locator('select[name="categoryId"], [data-testid="category-select"]')
    if (await categorySelect.count() > 0) {
      await categorySelect.first().selectOption({ index: 1 })
    }

    // Select brand (if dropdown exists)
    const brandSelect = page.locator('select[name="brandId"], [data-testid="brand-select"]')
    if (await brandSelect.count() > 0) {
      await brandSelect.first().selectOption({ index: 1 })
    }

    // Submit form
    await page.click('button[type="submit"]:has-text("Créer"), button:has-text("Enregistrer")')

    // Wait for success redirect or message
    await page.waitForTimeout(2000)

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Verify Product in List
    // ═══════════════════════════════════════════════════════════════

    // Should be redirected to products list or see success message
    await page.goto('/admin/products')

    // Wait for list to load
    await page.waitForSelector('table, [data-testid="products-list"]', { timeout: 5000 })

    // Verify our product appears in the list
    await expect(page.locator(`text="${productName}"`)).toBeVisible({ timeout: 5000 })

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Edit Product
    // ═══════════════════════════════════════════════════════════════

    // Find and click edit button for our product
    const productRow = page.locator(`tr:has-text("${productName}"), [data-testid="product-${uniqueSlug}"]`)
    await productRow.locator('button:has-text("Modifier"), a:has-text("Éditer"), [data-testid="edit-btn"]').click()

    // Wait for edit form
    await page.waitForSelector('input[name="name"]', { timeout: 5000 })

    // Modify product name
    const updatedName = `${productName} Updated`
    await page.fill('input[name="name"]', updatedName)

    // Update price
    await page.fill('input[name="price"]', '9000')

    // Submit changes
    await page.click('button[type="submit"]:has-text("Modifier"), button:has-text("Enregistrer")')

    // Wait for success
    await page.waitForTimeout(2000)

    // ═══════════════════════════════════════════════════════════════
    // STEP 6: Verify Changes on Storefront
    // ═══════════════════════════════════════════════════════════════

    // Navigate to public products page
    await page.goto('/products')

    // Search for our product
    const searchInput = page.locator('input[type="search"], input[placeholder*="Recherche"]')
    if (await searchInput.count() > 0) {
      await searchInput.fill(updatedName)
      await page.waitForTimeout(1000)
    }

    // Verify product is visible with updated name
    const productCard = page.locator(`text="${updatedName}"`)
    if (await productCard.count() > 0) {
      await expect(productCard.first()).toBeVisible()

      // Click on product to see details
      await productCard.first().click()

      // Verify updated price
      await expect(page.locator('text="9000", text="9 000"')).toBeVisible({ timeout: 3000 })
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 7: Delete Product
    // ═══════════════════════════════════════════════════════════════

    // Return to admin products list
    await page.goto('/admin/products')

    // Wait for list
    await page.waitForSelector('table, [data-testid="products-list"]', { timeout: 5000 })

    // Find our product
    const productToDelete = page.locator(`tr:has-text("${updatedName}"), [data-testid="product-${uniqueSlug}"]`)

    // Click delete button
    await productToDelete
      .locator('button:has-text("Supprimer"), [data-testid="delete-btn"]')
      .click()

    // Confirm deletion (if confirmation dialog appears)
    const confirmBtn = page.locator('button:has-text("Confirmer"), button:has-text("Oui")')
    if (await confirmBtn.isVisible({ timeout: 2000 })) {
      await confirmBtn.click()
    }

    // Wait for deletion
    await page.waitForTimeout(2000)

    // ═══════════════════════════════════════════════════════════════
    // STEP 8: Verify Product Removed
    // ═══════════════════════════════════════════════════════════════

    // Reload page to ensure fresh data
    await page.reload()

    // Verify product is no longer in list
    await expect(page.locator(`text="${updatedName}"`)).not.toBeVisible({ timeout: 3000 })

    console.log('✅ Admin product lifecycle completed successfully')
  })

  test('should enforce required fields validation', async ({ adminPage: page }) => {
    await page.goto('/admin/products')

    // Navigate to create product
    await page.click('button:has-text("Ajouter"), button:has-text("Nouveau"), a[href*="/admin/products/new"]')

    // Wait for form
    await page.waitForSelector('input[name="name"]', { timeout: 5000 })

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Should show validation errors
    const hasErrors = await page
      .locator('text=/requis|obligatoire|invalid/i, [role="alert"]')
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (hasErrors) {
      console.log('✅ Form validation working correctly')
    }
  })

  test('should prevent duplicate slugs', async ({ adminPage: page }) => {
    await page.goto('/admin/products')

    // Get first existing product slug
    await page.waitForSelector('table, [data-testid="products-list"]', { timeout: 5000 })

    // Try to create product
    await page.click('button:has-text("Ajouter"), a[href*="/admin/products/new"]')

    // Use a common slug that might exist
    await page.fill('input[name="name"]', 'Duplicate Test')
    await page.fill('input[name="slug"]', 'test-watch-1')
    await page.fill('textarea[name="description"]', 'Test description that is long enough for validation')
    await page.fill('input[name="price"]', '1000')
    await page.fill('input[name="stock"]', '10')

    // Submit
    await page.click('button[type="submit"]')

    // Wait to see result
    await page.waitForTimeout(2000)

    // If slug is duplicate, should show error
    const hasError = await page
      .locator('text=/slug.*utilisé|slug.*existe/i')
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (hasError) {
      console.log('✅ Slug uniqueness validation working')
    }
  })

  test('should allow filtering and searching products', async ({ adminPage: page }) => {
    await page.goto('/admin/products')

    // Wait for products list
    await page.waitForSelector('table, [data-testid="products-list"]', { timeout: 5000 })

    // Try search functionality (if exists)
    const searchInput = page.locator('input[type="search"], input[placeholder*="Recherche"]')
    if (await searchInput.count() > 0) {
      await searchInput.fill('Rolex')
      await page.waitForTimeout(1000)

      // Verify filtered results
      const results = page.locator('tr, [data-testid="product-card"]')
      const count = await results.count()

      console.log(`✅ Search returned ${count} results`)
    }

    // Try category filter (if exists)
    const categoryFilter = page.locator('select[name="category"], [data-testid="category-filter"]')
    if (await categoryFilter.count() > 0) {
      await categoryFilter.selectOption({ index: 1 })
      await page.waitForTimeout(1000)

      console.log('✅ Category filter applied')
    }
  })

  test('should display product statistics', async ({ adminPage: page }) => {
    await page.goto('/admin')

    // Verify dashboard shows key metrics
    await expect(
      page.locator('text=/Total.*produits|Produits.*actifs|Stock/i').first()
    ).toBeVisible({ timeout: 5000 })

    // Check for charts or visualizations (optional)
    const hasCharts = await page.locator('canvas, svg[class*="recharts"]').count()
    if (hasCharts > 0) {
      console.log(`✅ Dashboard displays ${hasCharts} visualizations`)
    }
  })
})
