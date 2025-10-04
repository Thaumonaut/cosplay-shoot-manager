import { test, expect } from '@playwright/test'

// Mock authentication by setting up cookies/localStorage as needed
test.beforeEach(async ({ page }) => {
  // Set up mock authentication - adjust based on your auth implementation
  await page.goto('/')
  
  // Mock JWT token in localStorage or cookies
  await page.evaluate(() => {
    localStorage.setItem('auth-token', 'mock-jwt-token')
  })
  
  // Mock user profile API response
  await page.route('/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      })
    })
  })

  // Mock teams API response
  await page.route('/api/user/teams', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'team-123',
          name: 'Test Photography Team',
          isActive: true
        }
      ])
    })
  })
})

test.describe('Authentication & Navigation Flow', () => {
  test('should load dashboard when authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Verify we're on the dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Verify sidebar navigation is present
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
  })

  test('should navigate between sections using sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test navigation to different sections
    const navItems = [
      { selector: 'a[href="/shoots"]', url: '/shoots', heading: 'Shoots' },
      { selector: 'a[href="/equipment"]', url: '/equipment', heading: 'Equipment' },
      { selector: 'a[href="/personnel"]', url: '/personnel', heading: 'Personnel' },
      { selector: 'a[href="/costumes"]', url: '/costumes', heading: 'Costumes' },
    ]

    for (const item of navItems) {
      await page.click(item.selector)
      await expect(page).toHaveURL(item.url)
      await expect(page.locator('h1')).toContainText(item.heading)
    }
  })

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/shoots')
    
    // Check that shoots nav item is active
    const shootsNav = page.locator('a[href="/shoots"]')
    await expect(shootsNav).toHaveClass(/active|current|bg-/)
  })
})

test.describe('Shoot Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock shoots API responses
    await page.route('/api/shoots', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'shoot-123',
              title: 'Test Cosplay Shoot',
              date: '2025-11-01',
              location: 'Test Studio',
              status: 'planned'
            }
          ])
        })
      } else if (route.request().method() === 'POST') {
        const requestBody = await route.request().postDataJSON()
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'shoot-new',
            ...requestBody,
            createdAt: new Date().toISOString()
          })
        })
      }
    })
  })

  test('should display existing shoots', async ({ page }) => {
    await page.goto('/shoots')
    
    // Verify shoots page loads
    await expect(page.locator('h1')).toContainText('Shoots')
    
    // Verify shoot appears in list
    await expect(page.locator('text=Test Cosplay Shoot')).toBeVisible()
  })

  test('should navigate to create shoot page', async ({ page }) => {
    await page.goto('/shoots')
    
    // Click create shoot button
    await page.click('text=Create Shoot')
    
    // Verify navigation to create page
    await expect(page).toHaveURL('/shoots/new')
    await expect(page.locator('h1')).toContainText('Create New Shoot')
  })

  test('should create a new shoot successfully', async ({ page }) => {
    await page.goto('/shoots/new')
    
    // Fill out the shoot creation form
    await page.fill('input[name="title"]', 'New Test Shoot')
    await page.fill('input[name="date"]', '2025-12-01')
    await page.fill('textarea[name="description"]', 'A test shoot for E2E testing')
    
    // Submit the form
    await page.click('button[type="submit"]')
    
    // Verify success (could be redirect or success message)
    await expect(page.locator('text=successfully')).toBeVisible({timeout: 10000})
  })
})

test.describe('Resource Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock equipment API
    await page.route('/api/equipment', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'eq-123',
              name: 'Canon 5D Mark IV',
              type: 'Camera',
              status: 'available'
            }
          ])
        })
      }
    })
  })

  test('should display equipment inventory', async ({ page }) => {
    await page.goto('/equipment')
    
    await expect(page.locator('h1')).toContainText('Equipment')
    await expect(page.locator('text=Canon 5D Mark IV')).toBeVisible()
  })

  test('should open equipment creation dialog', async ({ page }) => {
    await page.goto('/equipment')
    
    await page.click('text=Add Equipment')
    
    // Verify dialog/form opens
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })
})

test.describe('Team Management Flow', () => {
  test('should display team switcher', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Look for team switcher component
    await expect(page.locator('[data-testid="team-switcher"]')).toBeVisible()
    await expect(page.locator('text=Test Photography Team')).toBeVisible()
  })

  test('should handle team switching', async ({ page }) => {
    // Mock multiple teams
    await page.route('/api/user/teams', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'team-1', name: 'Team Alpha', isActive: true },
          { id: 'team-2', name: 'Team Beta', isActive: false }
        ])
      })
    })

    // Mock team switching endpoint
    await page.route('/api/user/active-team', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    await page.goto('/dashboard')
    
    // Open team switcher
    await page.click('[data-testid="team-switcher"]')
    
    // Select different team
    await page.click('text=Team Beta')
    
    // Verify team switching feedback
    await expect(page.locator('text=Team switched')).toBeVisible()
  })
})

test.describe('Error Handling Flow', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('/api/shoots', async route => {
      await route.abort('failed')
    })

    await page.goto('/shoots')
    
    // Verify error state is shown
    await expect(page.locator('text=error')).toBeVisible()
  })

  test('should handle authentication errors', async ({ page }) => {
    // Mock 401 response
    await page.route('/api/auth/me', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      })
    })

    await page.goto('/dashboard')
    
    // Should redirect to login or show auth error
    await expect(page).toHaveURL('/auth')
  })
})

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/dashboard')
    
    // Verify mobile navigation works
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
    
    // Test mobile-friendly interactions
    await page.click('a[href="/shoots"]')
    await expect(page).toHaveURL('/shoots')
  })
})

test.describe('Data Consistency', () => {
  test('should maintain data consistency across page navigation', async ({ page }) => {
    await page.goto('/shoots')
    
    // Verify initial data
    await expect(page.locator('text=Test Cosplay Shoot')).toBeVisible()
    
    // Navigate away and back
    await page.click('a[href="/dashboard"]')
    await page.click('a[href="/shoots"]')
    
    // Verify data is still there (not lost)
    await expect(page.locator('text=Test Cosplay Shoot')).toBeVisible()
  })
})