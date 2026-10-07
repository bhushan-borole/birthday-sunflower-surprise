import { expect, test } from '@playwright/test'

const preview = '/?preview=birthday'
const story = (page) => page.locator('.birthday-story')
const storyScenes = ['intro', 'message', 'meaning', 'photos', 'photos', 'garden']

async function expectScene(page, scene) {
  await expect(story(page)).toHaveAttribute('data-scene', scene)
  await expect(story(page)).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('#story-title')).toHaveCount(1)
  await expect(page.locator('#story-title')).toBeVisible()
  await expect.poll(() => page.locator('#story-title').evaluate((element) => {
    let opacity = 1
    for (let node = element; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity)
    return opacity
  })).toBe(1)
}

async function openStory(page) {
  await page.goto(preview)
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 })
  await page.getByRole('button', { name: 'Step inside', exact: true }).click()
  await expectScene(page, 'intro')
}

async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
}

async function expectPhoto(page, index) {
  await expectScene(page, 'photos')
  await expect(story(page)).toHaveAttribute('data-photo-index', String(index))
  const image = page.locator('.story-photo img')
  await expect(image).toHaveCount(1)
  await expect(image).toBeVisible()
  await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBeTruthy()
  const filename = index === 0 ? 'Image (4).jpg' : 'Image (5).jpg'
  expect(await image.evaluate((element) => decodeURIComponent(new URL(element.currentSrc).pathname))).toContain(filename)
  await expect(image).toHaveCSS('object-fit', 'contain')
  await expect(image).toHaveCSS('filter', 'none')
  return image
}

async function enterPhotoChapter(page) {
  await openStory(page)
  await page.getByRole('button', { name: 'Begin', exact: true }).click()
  await expectScene(page, 'message')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expectScene(page, 'meaning')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expectScene(page, 'photos')
}

test('birthday greeting has no slash or strikethrough', async ({ page }) => {
  await openStory(page)
  await page.getByRole('button', { name: 'Begin', exact: true }).click()
  await expectScene(page, 'message')
  const greeting = page.locator('.unsent-message')
  await expect(greeting).toHaveText('Happy birthday!')
  await expect(greeting).toHaveCSS('text-decoration-line', 'none')
  for (const preference of ['no-preference', 'reduce']) {
    await page.emulateMedia({ reducedMotion: preference })
    expect(await greeting.evaluate((element) => (
      getComputedStyle(element, '::after').content
    ))).toBe('none')
  }
})

test('normal URL remains locked and preview cannot persist a bypass', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-04T18:00:00Z'))
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Your birthday surprise')
  await expect(page.locator('.time-unit')).toHaveCount(4)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await openStory(page)
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('is waiting for you.')
  await expect(story(page)).toHaveCount(0)
})

test('midnight plays the full romantic reveal before the portrait popup', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-07T22:59:56Z') })
  await page.clock.pauseAt(new Date('2026-10-07T22:59:58Z'))
  await page.goto('/')
  await expect(page.locator('.time-value').last()).toHaveText('02')
  await page.clock.runFor(1000)
  await expect(page.locator('.time-value').last()).toHaveText('01')
  await page.clock.runFor(1000)
  await expect(page.locator('.birthday-reveal')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(story(page)).toHaveCount(0)
  await page.clock.runFor(3599)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.clock.runFor(1)
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.birthday-reveal')).toHaveCount(0)
  await expect(story(page)).toHaveCount(0)
  await expect(page.locator('.bloom-garden')).toHaveCount(0)
  const image = page.locator('.welcome-portrait img')
  await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth)).toBe(768)
  await page.getByRole('button', { name: 'Close birthday welcome' }).click()
  await expectScene(page, 'intro')
})

test('portrait popup traps focus and Escape opens the experience', async ({ page }) => {
  await page.goto(preview)
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 })
  await expect(page.getByRole('button', { name: 'Step inside', exact: true })).toBeFocused()
  for (let count = 0; count < 5; count += 1) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => Boolean(document.activeElement.closest('dialog')))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.birthday-reveal')).toHaveCount(0)
  await expectScene(page, 'intro')
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
})

test('all story scenes, back navigation, skip and replay work without old widgets', async ({ page }) => {
  const errors = []
  const missing = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => { if (response.status() >= 400) missing.push(response.url()) })
  await openStory(page)
  await expect(page.locator('.cake-stage, #gift-scene, .memory-wall, .envelope, canvas, audio')).toHaveCount(0)
  await page.getByRole('button', { name: 'Begin', exact: true }).click()
  await expectScene(page, 'message')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expectScene(page, 'meaning')
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expectScene(page, 'message')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expectScene(page, 'meaning')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  for (let index = 0; index < 2; index += 1) {
    await expectPhoto(page, index)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
  }
  await expectScene(page, 'garden')
  await expect(page.locator('.flower')).toHaveCount(3)
  await expect(page.locator('#story-title')).toContainText('Happy birthday,')
  await page.getByRole('button', { name: 'Replay', exact: true }).click()
  await expectScene(page, 'intro')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.birthday-reveal')).toHaveCount(0)
  await page.getByRole('button', { name: 'Skip to flowers', exact: true }).click()
  await expectScene(page, 'garden')
  expect(errors).toEqual([])
  expect(missing).toEqual([])
})

test('rapid input advances one scene, not several', async ({ page }) => {
  await openStory(page)
  await page.getByRole('button', { name: 'Begin', exact: true }).evaluate((button) => {
    button.click()
    button.click()
    button.click()
  })
  await expectScene(page, 'message')
})

test('flowers grow, settle and restart on replay', async ({ page }) => {
  await openStory(page)
  await page.getByRole('button', { name: 'Skip to flowers' }).click()
  await expectScene(page, 'garden')
  await expect(page.locator('.bloom-garden')).toHaveAttribute('data-state', 'growing')
  const stem = page.locator('.flower--1 > .flower__line')
  const initialHeight = await stem.evaluate((element) => element.getBoundingClientRect().height)
  await expect(page.locator('.bloom-garden')).toHaveAttribute('data-state', 'bloomed', { timeout: 10_000 })
  const grownHeight = await stem.evaluate((element) => element.getBoundingClientRect().height)
  expect(grownHeight).toBeGreaterThan(200)
  expect(grownHeight).toBeGreaterThan(initialHeight + 80)
  await page.screenshot({ path: 'test-results/story-garden-grown.png' })
  await page.getByRole('button', { name: 'Replay' }).click()
  await expectScene(page, 'intro')
  await page.getByRole('button', { name: 'Skip to flowers' }).click()
  await expectScene(page, 'garden')
  await expect(page.locator('.bloom-garden')).toHaveAttribute('data-state', 'growing')
})

test('live OS preference changes show still flowers and resume automatically', async ({ page }) => {
  await openStory(page)
  await page.getByRole('button', { name: 'Skip to flowers' }).click()
  await expectScene(page, 'garden')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.bloom-garden')).toHaveAttribute('data-state', 'still')
  const stemHeight = await page.locator('.flower--1 > .flower__line').evaluate((element) => element.getBoundingClientRect().height)
  expect(stemHeight).toBeGreaterThan(200)
  expect(await page.locator('.bloom-garden').evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0)
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  // Identical GPU-composited still frames can differ by a few one-level pixels.
  // Check actual geometry/styles and absence of animation rather than PNG encoding.
  const stillState = () => page.locator('.bloom-garden').evaluate((garden) => (
    [garden, ...garden.querySelectorAll('*')].map((element) => {
      const style = getComputedStyle(element)
      return {
        bounds: element.getBoundingClientRect().toJSON(),
        transform: style.transform,
        opacity: style.opacity,
        filter: style.filter,
      }
    })
  ))
  const frame = await stillState()
  await page.waitForTimeout(180)
  expect(await stillState()).toEqual(frame)
  expect(await page.locator('.bloom-garden').evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full')
  expect(await page.locator('.bloom-garden').evaluate((element) => element.getAnimations({ subtree: true }).length)).toBeGreaterThan(0)
})

test('system reduced motion stays still with keyboard navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openStory(page)
  await expect(page.getByRole('button', { name: /motion/i })).toHaveCount(0)
  const begin = page.getByRole('button', { name: 'Begin', exact: true })
  await begin.focus()
  await page.keyboard.press('Enter')
  await expectScene(page, 'message')
  await page.getByRole('button', { name: 'Skip to flowers' }).focus()
  await page.keyboard.press('Space')
  await expectScene(page, 'garden')
  await expect(page.locator('.bloom-garden')).toHaveAttribute('data-state', 'still')
  await expect(page.locator('.sunflower-head').first()).toBeVisible()
  expect(await page.locator('.bloom-garden').evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0)
})

for (const [width, height] of [[320, 740], [390, 844], [768, 960], [1440, 900], [844, 390]]) {
  test(`popup, story and garden fit ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(preview)
    await expect(page.getByRole('dialog')).toBeVisible()
    const photo = page.locator('.welcome-portrait img')
    await expect.poll(() => photo.evaluate((element) => element.complete && element.naturalWidth > 0)).toBeTruthy()
    await noOverflow(page)
    await page.screenshot({ path: `test-results/welcome-${width}.png` })
    await page.getByRole('button', { name: 'Step inside' }).click()
    await expectScene(page, 'intro')
    await noOverflow(page)
    await page.screenshot({ path: `test-results/story-intro-${width}.png`, fullPage: true })
    await page.getByRole('button', { name: 'Skip to flowers' }).click()
    await expectScene(page, 'garden')
    await noOverflow(page)
    const stage = await page.locator('.bloom-garden').boundingBox()
    const heading = await page.locator('#story-title').boundingBox()
    expect(stage.y).toBeGreaterThan(heading.y + heading.height)
    expect(stage.width).toBeGreaterThan(width * 0.7)
    for (const bloom of await page.locator('.sunflower-head').all()) {
      const petals = await bloom.boundingBox()
      expect(petals.y).toBeGreaterThanOrEqual(stage.y - 5)
      expect(petals.x).toBeGreaterThanOrEqual(0)
      expect(petals.x + petals.width).toBeLessThanOrEqual(width)
    }
    await page.screenshot({ path: `test-results/story-garden-${width}.png`, fullPage: true })
  })
}

test('portrait failure is visible and does not block entry', async ({ page }) => {
  await page.route('**/popup.jpg*', (route) => (
    route.request().resourceType() === 'image' ? route.abort() : route.continue()
  ))
  await page.goto(preview)
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 })
  await expect(page.getByRole('status')).toContainText('The portrait could not be loaded.')
  await page.getByRole('button', { name: 'Step inside' }).click()
  await expectScene(page, 'intro')
})

test('mobile countdown header does not overlap the message', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.clock.setFixedTime(new Date('2026-10-04T18:00:00Z'))
  await page.goto('/')
  const header = await page.locator('.story-header').boundingBox()
  const shell = await page.locator('.countdown-shell').boundingBox()
  expect(shell.y).toBeGreaterThanOrEqual(header.y + header.height)
  await noOverflow(page)
  await page.screenshot({ path: 'test-results/countdown-new.png', fullPage: true })
})

for (const width of [320, 390, 768, 1440]) {
  test(`botanical countdown fits ${width}px without revealing the birthday`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.clock.setFixedTime(new Date('2026-10-04T18:00:00Z'))
    await page.goto('/')
    await expect(page.locator('.locked-experience')).toHaveCSS('background-color', 'rgb(36, 16, 24)')
    await expect(page.locator('.time-value').first()).toHaveCSS('color', 'rgb(243, 191, 210)')
    await expect(page.locator('.countdown-garden .bloom-garden')).toHaveAttribute('data-state', 'still')
    await expect(page.locator('.countdown-garden .flower')).toHaveCount(3)
    await expect(page.locator('.time-value')).toHaveText(['03', '05', '00', '00'])
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(story(page)).toHaveCount(0)
    await noOverflow(page)
    const heading = await page.locator('#countdown-title').boundingBox()
    const counter = await page.locator('.countdown').boundingBox()
    expect(counter.y).toBeGreaterThan(heading.y + heading.height)
    for (const value of await page.locator('.time-value').all()) {
      const bounds = await value.boundingBox()
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    }
    await page.screenshot({ path: `test-results/countdown-botanical-${width}.png`, fullPage: true })
  })
}

test('OS reduced-motion preference does not stop the actual timer', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-04T18:00:00Z') })
  await page.clock.pauseAt(new Date('2026-10-04T18:00:02Z'))
  await page.goto('/')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.countdown-garden .bloom-garden')).toHaveAttribute('data-state', 'still')
  const seconds = await page.locator('.time-value').last().textContent()
  await page.clock.runFor(1000)
  expect(await page.locator('.time-value').last().textContent()).not.toBe(seconds)
  expect(await page.locator('.countdown-garden').evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full')
})

test('no motion control appears on the countdown, popup or any story scene', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-04T18:00:00Z'))
  const noMotionControl = async () => {
    await expect(page.getByRole('button', { name: /motion/i })).toHaveCount(0)
    await expect(page.locator('.motion-control')).toHaveCount(0)
  }
  await page.goto('/')
  await noMotionControl()
  await page.goto(preview)
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 })
  await noMotionControl()
  await page.getByRole('button', { name: 'Step inside' }).click()
  for (const [index, scene] of storyScenes.entries()) {
    await expectScene(page, scene)
    if (scene === 'photos') await expectPhoto(page, index - 3)
    await noMotionControl()
    if (scene !== 'garden') {
      await page.getByRole('button', { name: scene === 'intro' ? 'Begin' : 'Continue', exact: true }).click()
    }
  }
})

test('sunflower buds unfold into layered golden petals and spiral seed centres', async ({ page }) => {
  await openStory(page)
  await page.getByRole('button', { name: 'Skip to flowers' }).click()
  await expectScene(page, 'garden')
  await expect(page.locator('.sunflower-head')).toHaveCount(3)
  const first = page.locator('.sunflower-head').first()
  await expect(first.locator('.sunflower-petal')).toHaveCount(36)
  await expect(first.locator('.sunflower-seed')).toHaveCount(144)
  await expect(page.locator('.flower__white-circle, .flower__leaf')).toHaveCount(0)
  const bud = first.locator('.sunflower-bud')
  const petal = first.locator('.sunflower-petal').first()
  await expect(bud).toHaveCSS('opacity', '1')
  await expect(petal).toHaveCSS('opacity', '0')
  await expect(petal).toHaveCSS('opacity', '1', { timeout: 7000 })
  await expect(bud).toHaveCSS('opacity', '0')
  await expect(page.locator('.bloom-garden')).toHaveAttribute('data-state', 'bloomed', { timeout: 10_000 })
  const paints = await page.locator('.sunflower-head').evaluateAll((heads) => (
    heads.every((head) => [...head.querySelectorAll('[fill^="url("]')].every((element) => {
      const id = element.getAttribute('fill').slice(5, -1)
      return Boolean(head.querySelectorAll('[id]').length && document.getElementById(id))
    }))
  ))
  expect(paints).toBe(true)
  await page.screenshot({ path: 'test-results/sunflowers-bloomed.png', fullPage: true })
})

test('sunflowers remain fully open with reduced motion on countdown and finale', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.clock.setFixedTime(new Date('2026-10-04T18:00:00Z'))
  await page.goto('/')
  const verifyOpen = async () => {
    await expect(page.locator('.sunflower-head')).toHaveCount(3)
    await expect(page.locator('.sunflower-bud').first()).toHaveCSS('opacity', '0')
    await expect(page.locator('.sunflower-petal').first()).toHaveCSS('opacity', '1')
    expect(await page.locator('.bloom-garden').evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0)
    await expect(page.getByRole('button', { name: /motion/i })).toHaveCount(0)
  }
  await verifyOpen()
  await openStory(page)
  await page.getByRole('button', { name: 'Skip to flowers' }).click()
  await expectScene(page, 'garden')
  await verifyOpen()
})

test('preview includes the reveal and its skip goes only to the portrait', async ({ page }) => {
  await page.goto(preview)
  await expect(page.locator('.birthday-reveal')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.reveal-petal')).toHaveCount(18)
  await page.getByRole('button', { name: 'Open my surprise', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.birthday-reveal')).toHaveCount(0)
  await expect(story(page)).toHaveCount(0)
})

test('reduced-motion reveal is still and hands off after 800 milliseconds', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.clock.install({ time: new Date('2026-10-04T18:00:00Z') })
  await page.clock.pauseAt(new Date('2026-10-04T18:00:01Z'))
  await page.goto(preview)
  await expect(page.locator('.birthday-reveal')).toHaveAttribute('data-reduced', 'true')
  expect(await page.locator('.birthday-reveal').evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0)
  await page.clock.runFor(799)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.clock.runFor(1)
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.birthday-reveal')).toHaveCount(0)
})

test('all message screens and the portrait stay dark even with a light OS theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
  await page.goto(preview)
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
  await expect(page.getByRole('dialog')).toHaveCSS('background-color', 'rgb(36, 16, 24)')
  await page.getByRole('button', { name: 'Step inside', exact: true }).click()
  for (const [index, scene] of storyScenes.entries()) {
    await expectScene(page, scene)
    if (scene === 'photos') await expectPhoto(page, index - 3)
    await expect(story(page)).toHaveCSS('background-color', 'rgb(36, 16, 24)')
    await expect(page.locator('#story-title')).toHaveCSS('color', 'rgb(255, 240, 235)')
    await expect(page.getByRole('button', { name: /motion/i })).toHaveCount(0)
    if (scene === 'message') await page.screenshot({ path: 'test-results/dark-message.png', fullPage: true })
    if (scene !== 'garden') {
      await page.getByRole('button', { name: scene === 'intro' ? 'Begin' : 'Continue', exact: true }).click()
    }
  }
})

for (const [width, height] of [[390, 844], [1440, 900], [844, 390]]) {
  test(`romantic reveal stays visible and contained at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.clock.install({ time: new Date('2026-10-04T18:00:00Z') })
    await page.clock.pauseAt(new Date('2026-10-04T18:00:01Z'))
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    await page.goto(preview)
    await expect(page.locator('.birthday-reveal')).toBeVisible()
    await page.clock.runFor(1400)
    await page.locator('.birthday-reveal').evaluate((element) => {
      for (const animation of element.getAnimations({ subtree: true })) {
        animation.pause()
        animation.currentTime = 1400
      }
    })
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.locator('.reveal-content')).toHaveCSS('opacity', '1')
    await noOverflow(page)
    const heading = await page.locator('#reveal-title').boundingBox()
    const skip = await page.getByRole('button', { name: 'Open my surprise' }).boundingBox()
    expect(heading.y).toBeGreaterThanOrEqual(0)
    expect(heading.y + heading.height).toBeLessThan(skip.y)
    await page.screenshot({ path: `test-results/romantic-reveal-${width}.png` })
    await page.clock.runFor(2200)
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 })
    expect(errors).toEqual([])
  })
}

for (const [width, height] of [[320, 740], [390, 844], [768, 960], [1440, 900], [844, 390]]) {
  test(`real couple photographs remain uncropped and readable at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' })
    await enterPhotoChapter(page)
    for (let index = 0; index < 2; index += 1) {
      const image = await expectPhoto(page, index)
      await noOverflow(page)
      await expect(story(page)).toHaveCSS('background-color', 'rgb(36, 16, 24)')
      const bounds = await image.boundingBox()
      const dimensions = await image.evaluate((element) => ({
        width: element.naturalWidth, height: element.naturalHeight,
      }))
      expect(bounds.width / bounds.height).toBeCloseTo(dimensions.width / dimensions.height, 2)
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      const heading = await page.locator('#story-title').boundingBox()
      if (width <= 700) expect(bounds.y).toBeGreaterThan(heading.y + heading.height)
      const navigation = await page.locator('.story-controls').boundingBox()
      expect(navigation.y).toBeGreaterThanOrEqual(bounds.y + bounds.height)
      await page.screenshot({ path: `test-results/couple-photo-${index + 1}-${width}.png`, fullPage: true })
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
    }
    await expectScene(page, 'garden')
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await expectPhoto(page, 1)
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await expectPhoto(page, 0)
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await expectScene(page, 'meaning')
  })
}

test('a failed couple photograph reports the error and the next photograph still opens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/Image*', (route) => {
    const request = route.request()
    if (request.resourceType() === 'image' && decodeURIComponent(request.url()).includes('Image (4).jpg')) {
      return route.abort()
    }
    return route.continue()
  })
  await enterPhotoChapter(page)
  await expect(page.locator('.photo-error')).toContainText('This photograph could not be opened.')
  await expect(page.locator('.story-photo img')).toHaveCount(0)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expectPhoto(page, 1)
  await expect(page.locator('.photo-error')).toHaveCount(0)
  await page.getByRole('button', { name: 'Skip to flowers', exact: true }).click()
  await expectScene(page, 'garden')
})
