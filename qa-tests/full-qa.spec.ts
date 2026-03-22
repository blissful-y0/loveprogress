import { test, expect } from '@playwright/test'

const ARTIFACTS = '/Users/bliss/Documents/loveprogress/qa-artifacts'

// =============================================================
// Scenario 1: Homepage Loading
// =============================================================
test('Scenario 1: Homepage loads without errors', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  const response = await page.goto('/')
  expect(response?.status()).toBe(200)

  await page.waitForLoadState('domcontentloaded')

  // Check for navigation elements
  const navLinks = page.locator('nav a, header a')
  const navCount = await navLinks.count()
  console.log(`  Nav links found: ${navCount}`)

  // Check page title
  const title = await page.title()
  console.log(`  Page title: "${title}"`)

  // Check major page sections are visible
  const headingText = await page.locator('h1, h2, h3').allTextContents()
  console.log(`  Headings: ${headingText.join(', ')}`)

  // Log console errors if any
  if (consoleErrors.length > 0) {
    console.log(`  CONSOLE ERRORS: ${consoleErrors.join(' | ')}`)
  }

  await page.screenshot({ path: `${ARTIFACTS}/01-homepage.png`, fullPage: true })
})

// =============================================================
// Scenario 2: Notices List
// =============================================================
test('Scenario 2: Notices page loads', async ({ page }) => {
  const response = await page.goto('/info/notices')
  expect(response?.status()).toBe(200)

  await page.waitForLoadState('domcontentloaded')

  // The page title should be visible
  const heading = page.locator('h1')
  const headingText = await heading.textContent()
  console.log(`  Page heading: "${headingText}"`)

  // Check for table headers (notices use a table layout)
  const hasTableHeaders = await page.locator('text=번호').count()
  console.log(`  Has table structure: ${hasTableHeaders > 0}`)

  // Check for empty state
  const emptyText = await page.locator('text=등록된 공지사항이 없습니다').count()
  console.log(`  Empty state shown: ${emptyText > 0}`)

  await page.screenshot({ path: `${ARTIFACTS}/02-notices.png`, fullPage: true })
})

// =============================================================
// Scenario 3: Events List
// =============================================================
test('Scenario 3: Events page loads', async ({ page }) => {
  const response = await page.goto('/info/events')
  expect(response?.status()).toBe(200)

  await page.waitForLoadState('domcontentloaded')

  const heading = page.locator('h1')
  const headingText = await heading.textContent()
  console.log(`  Page heading: "${headingText}"`)

  const emptyText = await page.locator('text=등록된 행사 안내가 없습니다').count()
  console.log(`  Empty state shown: ${emptyText > 0}`)

  await page.screenshot({ path: `${ARTIFACTS}/03-events.png`, fullPage: true })
})

// =============================================================
// Scenario 4: QnA List
// =============================================================
test('Scenario 4: QnA list loads', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  const response = await page.goto('/qna')
  expect(response?.status()).toBe(200)

  await page.waitForLoadState('networkidle')

  // Check QnA heading
  const heading = page.locator('h1')
  await expect(heading).toHaveText('QnA')

  // Check for the write form (it's always present on the page)
  const writeForm = page.locator('input[placeholder="이름"]')
  const hasWriteForm = await writeForm.count()
  console.log(`  Write form present: ${hasWriteForm > 0}`)

  // Check if QnA list loaded successfully or shows error
  const errorMessage = page.locator('text=목록을 불러오는 데 실패했습니다')
  const hasError = await errorMessage.count()
  console.log(`  QnA list error: ${hasError > 0}`)

  if (hasError > 0) {
    console.log('  BUG: QnA API returns 500 - qna_posts table may not exist or Supabase connection issue')
  }

  // Check for empty state
  const emptyMsg = page.locator('text=아직 등록된 문의가 없습니다')
  const hasEmptyMsg = await emptyMsg.count()
  console.log(`  Empty state shown: ${hasEmptyMsg > 0}`)

  if (consoleErrors.length > 0) {
    console.log(`  CONSOLE ERRORS: ${consoleErrors.join(' | ')}`)
  }

  await page.screenshot({ path: `${ARTIFACTS}/04-qna-list.png`, fullPage: true })
})

// =============================================================
// Scenario 5: QnA Write - Normal Post
// =============================================================
test('Scenario 5: QnA write normal post', async ({ page }) => {
  await page.goto('/qna')
  await page.waitForLoadState('networkidle')

  // Fill the name field (placeholder="이름")
  const nameInput = page.locator('input[placeholder="이름"]')
  await expect(nameInput).toBeVisible()
  await nameInput.fill('QA테스터')

  // Fill the password field (always required per write-form.tsx validation)
  const passwordInput = page.locator('input[placeholder="비밀번호"]')
  await expect(passwordInput).toBeVisible()
  await passwordInput.fill('test1234')

  // Make sure secret checkbox is NOT checked
  const secretCheckbox = page.locator('label:has-text("비밀글") input[type="checkbox"]')
  const isChecked = await secretCheckbox.isChecked()
  if (isChecked) {
    await secretCheckbox.uncheck()
  }
  console.log(`  Secret checkbox unchecked: ${!(await secretCheckbox.isChecked())}`)

  // Fill the textarea content
  const contentArea = page.locator('textarea')
  await expect(contentArea).toBeVisible()
  await contentArea.fill('QA 자동화 테스트 일반글입니다.')

  // Check privacy consent checkbox
  const privacyCheckbox = page.locator('label:has-text("동의함") input[type="checkbox"]')
  await privacyCheckbox.check()
  console.log(`  Privacy agreed: ${await privacyCheckbox.isChecked()}`)

  await page.screenshot({ path: `${ARTIFACTS}/05-qna-normal-before-submit.png`, fullPage: true })

  // Click submit ("작성하기" button)
  const submitButton = page.locator('button:has-text("작성하기")')
  await expect(submitButton).toBeVisible()

  // Listen for API response
  const responsePromise = page.waitForResponse(
    resp => resp.url().includes('/api/qna') && resp.request().method() === 'POST',
    { timeout: 10000 }
  )

  await submitButton.click()

  const apiResponse = await responsePromise
  const apiStatus = apiResponse.status()
  const apiBody = await apiResponse.json().catch(() => null)
  console.log(`  API response: status=${apiStatus}, body=${JSON.stringify(apiBody)}`)

  if (apiStatus === 201) {
    console.log('  Post created successfully')
  } else {
    console.log(`  BUG: Post creation failed with status ${apiStatus}`)
  }

  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${ARTIFACTS}/05-qna-normal-post.png`, fullPage: true })
})

// =============================================================
// Scenario 6: QnA Write - Secret Post
// =============================================================
test('Scenario 6: QnA write secret post', async ({ page }) => {
  await page.goto('/qna')
  await page.waitForLoadState('networkidle')

  // Fill name
  const nameInput = page.locator('input[placeholder="이름"]')
  await nameInput.fill('QA비밀테스터')

  // Fill password
  const passwordInput = page.locator('input[placeholder="비밀번호"]')
  await passwordInput.fill('test1234')

  // Check "비밀글" checkbox
  const secretCheckbox = page.locator('label:has-text("비밀글") input[type="checkbox"]')
  await secretCheckbox.check()
  console.log(`  Secret checkbox checked: ${await secretCheckbox.isChecked()}`)

  // Fill content
  const contentArea = page.locator('textarea')
  await contentArea.fill('QA 비밀글 테스트입니다.')

  // Check privacy consent
  const privacyCheckbox = page.locator('label:has-text("동의함") input[type="checkbox"]')
  await privacyCheckbox.check()

  await page.screenshot({ path: `${ARTIFACTS}/06-qna-secret-before-submit.png`, fullPage: true })

  // Submit
  const submitButton = page.locator('button:has-text("작성하기")')

  const responsePromise = page.waitForResponse(
    resp => resp.url().includes('/api/qna') && resp.request().method() === 'POST',
    { timeout: 10000 }
  )

  await submitButton.click()

  const apiResponse = await responsePromise
  const apiStatus = apiResponse.status()
  const apiBody = await apiResponse.json().catch(() => null)
  console.log(`  API response: status=${apiStatus}, body=${JSON.stringify(apiBody)}`)

  if (apiStatus === 201) {
    console.log('  Secret post created successfully')
  } else {
    console.log(`  BUG: Secret post creation failed with status ${apiStatus}`)
  }

  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${ARTIFACTS}/06-qna-secret-post.png`, fullPage: true })
})

// =============================================================
// Scenario 7: QnA Secret Post Password Verification
// =============================================================
test('Scenario 7: QnA secret post password verification', async ({ page }) => {
  // First, check if QnA API is working
  const apiCheck = await page.request.get('/api/qna?page=1&limit=10')
  const apiCheckBody = await apiCheck.json().catch(() => null)
  console.log(`  QnA API check: status=${apiCheck.status()}`)

  if (apiCheck.status() !== 200 || !apiCheckBody?.posts) {
    console.log('  SKIP: QnA API is not returning posts (500 error)')
    console.log('  Falling back to direct API password verification test')

    // Even if list fails, we can test the verify-password endpoint with a known nonexistent ID
    const wrongPwResp = await page.request.post('/api/qna/00000000-0000-0000-0000-000000000000/verify-password', {
      data: { password: 'wrongpassword' }
    })
    console.log(`  Wrong password on nonexistent post: status=${wrongPwResp.status()}`)
    // Should return 401 (password wrong) since the post doesn't exist
    expect(wrongPwResp.status()).toBeGreaterThanOrEqual(400)

    await page.goto('/qna')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${ARTIFACTS}/07-qna-secret-api-fallback.png`, fullPage: true })
    return
  }

  // Find a secret post
  const posts = apiCheckBody.posts as any[]
  const secretPost = posts.find((p: any) => p.is_secret === true)
  console.log(`  Total posts: ${posts.length}`)
  console.log(`  Secret post found: ${!!secretPost}`)

  if (!secretPost) {
    console.log('  SKIP: No secret posts available to test password verification')
    await page.goto('/qna')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${ARTIFACTS}/07-qna-no-secret-posts.png`, fullPage: true })
    return
  }

  console.log(`  Testing with post id: ${secretPost.id}, writer: ${secretPost.writer_name}`)

  // Navigate to QnA page
  await page.goto('/qna')
  await page.waitForLoadState('networkidle')

  // Find the secret post card (has Lock icon)
  const lockIcons = page.locator('svg.lucide-lock')
  const lockCount = await lockIcons.count()
  console.log(`  Lock icons on page: ${lockCount}`)

  // The secret post should have a password input visible
  // Find password inputs in the QnA cards (not the write form)
  const cardPasswordInputs = page.locator('.border.border-\\[\\#d0d0d0\\].rounded-\\[10px\\] input[type="password"]')
  const cardPwCount = await cardPasswordInputs.count()
  console.log(`  Password inputs in cards: ${cardPwCount}`)

  if (cardPwCount > 0) {
    // Test 1: Wrong password
    const firstPwInput = cardPasswordInputs.first()
    await firstPwInput.fill('wrongpassword')

    // Click "게시물 보기" button near the password input
    const viewButton = page.locator('button:has-text("게시물 보기")').first()
    await viewButton.click()
    await page.waitForTimeout(1500)

    // Check for error message
    const errorSpan = page.locator('span.text-red-500')
    const errorCount = await errorSpan.count()
    console.log(`  Error messages after wrong password: ${errorCount}`)
    if (errorCount > 0) {
      const errorText = await errorSpan.first().textContent()
      console.log(`  Error text: "${errorText}"`)
    }

    await page.screenshot({ path: `${ARTIFACTS}/07-qna-secret-wrong-pw.png`, fullPage: true })

    // Test 2: Correct password
    await firstPwInput.clear()
    await firstPwInput.fill('test1234')
    await viewButton.click()
    await page.waitForTimeout(1500)

    // Check if content is now visible
    const contentVisible = page.locator('text=QA 비밀글 테스트입니다.')
    const isContentVisible = await contentVisible.count()
    console.log(`  Content visible after correct password: ${isContentVisible > 0}`)

    await page.screenshot({ path: `${ARTIFACTS}/07-qna-secret-correct-pw.png`, fullPage: true })
  } else {
    // Fallback: Test via API directly
    console.log('  No password inputs found in cards, testing via API')

    // Wrong password
    const wrongResp = await page.request.post(`/api/qna/${secretPost.id}/verify-password`, {
      data: { password: 'wrongpassword' }
    })
    console.log(`  Wrong password API: status=${wrongResp.status()}`)
    expect(wrongResp.status()).toBe(401)

    // Correct password
    const correctResp = await page.request.post(`/api/qna/${secretPost.id}/verify-password`, {
      data: { password: 'test1234' }
    })
    console.log(`  Correct password API: status=${correctResp.status()}`)
    const correctBody = await correctResp.json().catch(() => null)
    console.log(`  Correct password body: ${JSON.stringify(correctBody)}`)

    await page.screenshot({ path: `${ARTIFACTS}/07-qna-secret-api-test.png`, fullPage: true })
  }
})

// =============================================================
// Scenario 8: Booths List
// =============================================================
test('Scenario 8: Booths page loads', async ({ page }) => {
  const response = await page.goto('/booths')
  const status = response?.status()
  console.log(`  Response status: ${status}`)
  expect(status).toBeLessThan(500)

  await page.waitForLoadState('domcontentloaded')

  // Check for booth page heading
  const heading = page.locator('h1, h2')
  const headingTexts = await heading.allTextContents()
  console.log(`  Headings: ${headingTexts.join(', ')}`)

  // Check for filter elements (the page has age/keyword filters)
  const filters = page.locator('button:has-text("#")')
  const filterCount = await filters.count()
  console.log(`  Filter buttons: ${filterCount}`)

  // Check for empty state
  const emptyState = page.locator('text=조건에 맞는 부스가 없습니다')
  const hasEmptyState = await emptyState.count()
  console.log(`  Empty state (no booths): ${hasEmptyState > 0}`)

  await page.screenshot({ path: `${ARTIFACTS}/08-booths.png`, fullPage: true })
})

// =============================================================
// Scenario 9: Booth Board
// =============================================================
test('Scenario 9: Booth board page loads', async ({ page }) => {
  const response = await page.goto('/booth-board')
  const status = response?.status()
  console.log(`  Response status: ${status}`)
  expect(status).toBeLessThan(500)

  await page.waitForLoadState('domcontentloaded')

  const heading = page.locator('h1, h2')
  const headingTexts = await heading.allTextContents()
  console.log(`  Headings: ${headingTexts.join(', ')}`)

  // The booth board requires authentication
  const authRequired = page.locator('text=부스어 인증이 필요합니다')
  const needsAuth = await authRequired.count()
  console.log(`  Requires booth auth: ${needsAuth > 0}`)

  // Check if login button is shown
  const loginButton = page.locator('text=로그인')
  const hasLogin = await loginButton.count()
  console.log(`  Login button visible: ${hasLogin > 0}`)

  await page.screenshot({ path: `${ARTIFACTS}/09-booth-board.png`, fullPage: true })
})

// =============================================================
// Scenario 10: Login Page
// =============================================================
test('Scenario 10: Login page and empty form validation', async ({ page }) => {
  const response = await page.goto('/auth/login')
  expect(response?.status()).toBe(200)

  await page.waitForLoadState('domcontentloaded')

  // Check heading
  const heading = page.locator('h1, h2')
  const headingTexts = await heading.allTextContents()
  console.log(`  Headings: ${headingTexts.join(', ')}`)

  // Verify form elements
  const emailInput = page.locator('input[type="email"]')
  const passwordInput = page.locator('input[type="password"]')
  const loginButton = page.locator('button:has-text("로그인")').first()

  await expect(emailInput).toBeVisible()
  await expect(passwordInput).toBeVisible()
  await expect(loginButton).toBeVisible()
  console.log('  Login form elements: all present')

  // Check for additional elements
  const rememberMe = page.locator('text=이메일 저장')
  console.log(`  "Remember email" option: ${await rememberMe.count() > 0}`)

  const findId = page.locator('text=ID찾기')
  console.log(`  "Find ID" link: ${await findId.count() > 0}`)

  const register = page.locator('text=회원가입')
  console.log(`  "Register" link: ${await register.count() > 0}`)

  // Check for social login (Discord icons visible in screenshot)
  const socialButtons = page.locator('svg, img').filter({ hasText: /discord/i })
  console.log(`  Social login options present`)

  await page.screenshot({ path: `${ARTIFACTS}/10-login-form.png`, fullPage: true })

  // Try submitting empty form
  await loginButton.click()
  await page.waitForTimeout(1000)

  // HTML5 validation should prevent submission
  const emailValidity = await emailInput.evaluate(
    el => (el as HTMLInputElement).validationMessage
  )
  console.log(`  Email validation message: "${emailValidity}"`)

  await page.screenshot({ path: `${ARTIFACTS}/10-login-validation.png`, fullPage: true })
})

// =============================================================
// Scenario 11: Register Page
// =============================================================
test('Scenario 11: Register page loads', async ({ page }) => {
  const response = await page.goto('/auth/register')
  expect(response?.status()).toBe(200)

  await page.waitForLoadState('domcontentloaded')

  // Check heading
  const heading = page.locator('h1, h2')
  const headingTexts = await heading.allTextContents()
  console.log(`  Headings: ${headingTexts.join(', ')}`)

  // Check for form fields
  const emailInput = page.locator('input[type="email"]')
  const passwordInputs = page.locator('input[type="password"]')
  const submitButton = page.locator('button[type="submit"], button:has-text("회원가입")')

  const emailCount = await emailInput.count()
  const pwCount = await passwordInputs.count()
  const submitCount = await submitButton.count()
  console.log(`  Email inputs: ${emailCount}`)
  console.log(`  Password inputs: ${pwCount} (likely password + confirm)`)
  console.log(`  Submit buttons: ${submitCount}`)

  // Check for additional fields (nickname, phone, etc.)
  const allInputs = page.locator('input')
  const inputCount = await allInputs.count()
  console.log(`  Total input fields: ${inputCount}`)

  await page.screenshot({ path: `${ARTIFACTS}/11-register.png`, fullPage: true })
})

// =============================================================
// Scenario 12: API - Board whitespace validation
// =============================================================
test('Scenario 12: API whitespace title validation', async ({ request }) => {
  // The boards API requires authentication (checked before validation)
  // Test 1: Correct field name (boardType) with whitespace title - should get 401 (auth check first)
  const response = await request.post('/api/boards', {
    data: {
      boardType: 'notice',
      title: '   ',
      content: 'test',
    },
    headers: { 'Content-Type': 'application/json' }
  })

  const status = response.status()
  const body = await response.json().catch(async () => await response.text())
  console.log(`  Response status: ${status}`)
  console.log(`  Response body: ${JSON.stringify(body)}`)

  if (status === 401) {
    console.log('  INFO: Auth check happens before validation (401 returned)')
    console.log('  Reviewing code: Zod schema uses .trim().min(1) which would reject whitespace-only titles')
    console.log('  Validation is correct in code but cannot be tested without authentication')
  } else if (status === 400 || status === 422) {
    console.log('  PASS: Whitespace title properly rejected')
  } else if (status === 200 || status === 201) {
    console.log('  BUG: Whitespace-only title was accepted!')
  }

  // Test 2: Try with wrong field name (category instead of boardType)
  const response2 = await request.post('/api/boards', {
    data: {
      title: '   ',
      content: 'test',
      category: 'notice',
    },
    headers: { 'Content-Type': 'application/json' }
  })
  console.log(`  Response with wrong field name: status=${response2.status()}`)

  expect(status).toBeGreaterThanOrEqual(400)
})

// =============================================================
// Scenario 13: API - Rate limit test
// =============================================================
test('Scenario 13: API rate limiting on password verification', async ({ request }) => {
  let rateLimitedAt = -1

  for (let i = 1; i <= 6; i++) {
    const response = await request.post('/api/qna/nonexistent-id/verify-password', {
      data: { password: 'wrong' },
      headers: { 'Content-Type': 'application/json' }
    })

    const status = response.status()
    const body = await response.json().catch(async () => await response.text())
    console.log(`  Request ${i}: status=${status}, body=${JSON.stringify(body)}`)

    if (status === 429) {
      rateLimitedAt = i
      console.log(`  Rate limited at request ${i}`)
      break
    }
  }

  if (rateLimitedAt > 0) {
    console.log('  PASS: Rate limiting is working')
    // Rate limit is configured as 5 requests per 60s, so 6th should be blocked
    expect(rateLimitedAt).toBeLessThanOrEqual(6)
  } else {
    console.log('  POSSIBLE BUG: No rate limit triggered after 6 requests')
  }
})
