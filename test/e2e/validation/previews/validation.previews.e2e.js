const {waitForReact, ReactSelector} = require('testcafe-react-selectors')
const dayjs = require('dayjs')
const {delay} = require('../../utils')
const node = require('./node')

fixture`ValidationPagePreviews`
  .page('http://localhost:8000/dashboard')
  .beforeEach(async () => {
    await waitForReact()
  })
  .before(async () => {
    node.sessionStartDate = dayjs().add(100, 'm')
    node.currentPeriod = 'None'
    await node.start()
  })

test('check preview states changing', async t => {
  await t.setPageLoadTimeout(20000)

  await delay(10000)

  node.sessionStartDate = dayjs()
  node.currentPeriod = 'ShortSession'

  await delay(2000)

  const thumbnails = ReactSelector('Thumbnails Thumbnail')
  await t.expect(thumbnails.count).eql(3)

  const thumb1 = thumbnails.nth(0)
  const thumb2 = thumbnails.nth(1)
  const thumb3 = thumbnails.nth(2)

  // three previews, states: shown, loading, loading
  await t.expect(thumb1.findReact('FlipImage').exists).ok()
  await t.expect(thumb2.findReact('FlipImage').exists).notOk()
  await t.expect(thumb3.findReact('FlipImage').exists).notOk()
  await t.expect(thumb2.findReact('LoadingThumbnail').exists).ok()
  await t.expect(thumb3.findReact('LoadingThumbnail').exists).ok()

  // extra flip bumps, states: shown, shown, loading
  await delay(8000)
  await t.expect(thumb1.findReact('FlipImage').exists).ok()
  await t.expect(thumb2.findReact('FlipImage').exists).ok()
  await t.expect(thumb2.findReact('LoadingThumbnail').exists).notOk()
  await t.expect(thumb3.findReact('LoadingThumbnail').exists).ok()

  // flip failed, states: shown, shown, failed
  await delay(10000)
  await t.expect(thumb1.findReact('FlipImage').exists).ok()
  await t.expect(thumb2.findReact('FlipImage').exists).ok()
  await t.expect(thumb3.findReact('FailedThumbnail').exists).ok()
  await t.expect(thumb3.findReact('LoadingThumbnail').exists).notOk()

  // submit empty answers
  await t.click(thumb3)
  await t.click(ReactSelector('ActionBarItem Button'))

  // close welcome modal
  const modal = ReactSelector('WelcomeQualificationDialog')
  await t.expect(modal.exists).ok()
  await t.click(modal.findReact('Button'))
  await t.expect(modal.exists).notOk()

  // only ready flip should be shown
  const longThumbnails = ReactSelector('Thumbnails Thumbnail')
  await t.expect(longThumbnails.count).eql(7)

  for (let i = 0; i < 7; i += 1) {
    const thumb = longThumbnails.nth(i)
    await t.expect(thumb.findReact('FlipImage').exists).ok()
  }
})
