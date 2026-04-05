import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const SCREENSHOTS_DIR = './screenshots'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  })
  const page = await context.newPage()

  // 1. Intent capture
  await page.goto(BASE)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-intent-capture.png` })
  console.log('📸 Intent Capture')

  // 2. Type a goal and submit
  await page.fill('input[type="text"]', 'creative writing')
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-intent-filled.png` })
  console.log('📸 Intent Filled')

  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-suggestion.png` })
  console.log('📸 Suggestion')

  // 3. Click "Let's go" to enter focused state
  const letsGoBtn = page.locator('button', { hasText: 'go' })
  await letsGoBtn.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-focused.png` })
  console.log('📸 Focused')

  // 4. Click "I'm done" to enter completion state
  const doneBtn = page.locator('button', { hasText: 'done' })
  await doneBtn.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-completion.png` })
  console.log('📸 Completion')

  // 5. Add a reflection and save
  await page.fill('textarea', 'This was a great exercise. I noticed I default to visual imagery.')
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-completion-with-reflection.png` })
  console.log('📸 Completion with reflection')

  const saveBtn = page.locator('button', { hasText: 'continue' })
  await saveBtn.click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/07-next-suggestion.png` })
  console.log('📸 Next suggestion (or done for today)')

  console.log('\n✅ All screenshots saved to ./screenshots/')
  await browser.close()
}

main().catch(console.error)
