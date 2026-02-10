/**
 * Playwright Authentication Setup
 *
 * This setup script runs before all tests to:
 * 1. Register test users (if not exist)
 * 2. Login and save authentication state
 * 3. Reuse auth state across tests (faster execution)
 */

import { test as setup, expect } from '@playwright/test'
import { testData } from './fixtures'
import fs from 'fs'
import path from 'path'

const userAuthFile = 'tests/e2e/.auth/user.json'
const adminAuthFile = 'tests/e2e/.auth/admin.json'

/**
 * Setup: Authenticate Regular User
 */
setup('authenticate regular user', async ({ page, context }) => {
  // Ensure .auth directory exists
  const authDir = path.dirname(userAuthFile)
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  // Navigate to login page
  await page.goto('/login')

  // Try to register first (will fail if user exists, that's OK)
  await page.goto('/register')
  await page.fill('input[name="name"]', testData.validUser.name)
  await page.fill('input[name="email"]', testData.validUser.email)
  await page.fill('input[name="password"]', testData.validUser.password)
  await page.click('button[type="submit"]')

  // Wait for redirect (either to login or home)
  await page.waitForTimeout(2000)

  // If we're not logged in, go to login page
  const currentUrl = page.url()
  if (!currentUrl.includes('/products') && !currentUrl.includes('/profile')) {
    await page.goto('/login')
    await page.fill('input[name="email"]', testData.validUser.email)
    await page.fill('input[name="password"]', testData.validUser.password)
    await page.click('button[type="submit"]')

    // Wait for successful login redirect
    await page.waitForURL(/\/(products|profile)/, { timeout: 10000 })
  }

  // Verify we're authenticated by checking for user menu or profile link
  await expect(page.locator('text="Profil", text="Mon compte", text="Déconnexion"').first()).toBeVisible({ timeout: 5000 })

  // Save authentication state
  await context.storageState({ path: userAuthFile })

  console.log('✅ Regular user authenticated and state saved')
})

/**
 * Setup: Authenticate Admin User
 */
setup('authenticate admin user', async ({ page, context }) => {
  // Ensure .auth directory exists
  const authDir = path.dirname(adminAuthFile)
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  // Navigate to login page
  await page.goto('/login')

  // For admin, we need to use credentials from seed data
  // In production tests, admin accounts are pre-created via seed
  // Use admin@watchbiz.com / Admin123! (from prisma/seed.ts)
  await page.fill('input[name="email"]', 'admin@watchbiz.com')
  await page.fill('input[name="password"]', 'Admin123!')
  await page.click('button[type="submit"]')

  // Wait for successful login redirect
  await page.waitForURL(/\/(admin|products|profile)/, { timeout: 10000 })

  // Verify we're authenticated
  await expect(page.locator('text="Admin", text="Dashboard", text="Déconnexion"').first()).toBeVisible({ timeout: 5000 })

  // Save authentication state
  await context.storageState({ path: adminAuthFile })

  console.log('✅ Admin user authenticated and state saved')
})
