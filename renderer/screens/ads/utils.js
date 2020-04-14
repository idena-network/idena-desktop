import {encode, decode} from 'rlp'
import {rgb} from 'polished'
import dayjs from 'dayjs'
import theme from '../../shared/theme'
import {loadPersistentState} from '../../shared/utils/persist'

export const AdRelevance = {
  Top: 'Top',
  Normal: 'Normal',
  Low: 'Low',
}

export const AdStatus = {
  Disabled: 'Disabled',
  Showing: 'Showing',
  PartiallyShowing: 'Partially showing',
  NotShowing: 'Not showing',
  Idle: 'Idle',
}

export function adStatusColor(status) {
  switch (status) {
    case AdStatus.Showing:
      return theme.colors.success
    case AdStatus.NotShowing:
      return theme.colors.danger
    case AdStatus.PartiallyShowing:
      return rgb(255, 163, 102)
    case AdStatus.Idle:
    case AdStatus.Disabled:
      return theme.colors.muted
    default:
      return theme.colors.text
  }
}

export function linearGradient(color) {
  return `linear-gradient(to top, ${color}, ${color
    .replace('rgb', 'rgba')
    .replace(')', ', 0.16)')})`
}

export function encodeAd(data) {
  const encoded = new TextEncoder().encode(JSON.stringify(data))
  return encode(encoded)
}

export function decodeAd(hex) {
  const decoded = decode(hex)
  return JSON.parse(new TextDecoder().decode(decoded))
}

export function toHex(encoded) {
  return `0x${encoded.toString('hex')}`
}

export function loadAds() {
  try {
    return loadPersistentState('ads') || []
  } catch (e) {
    return [
      {
        key: 1,
        title: 'New ICO is running. DNA is accepted',
        owner: '0xSF12FEJ320DWF3FFa0xaDWF3FFa0',
        limit: 58,
        burnt: 58,
        relevance: AdRelevance.Top,
        score: 28,
        lastTx: dayjs(),
        status: AdStatus.PartiallyShowing,
      },
      {
        key: 2,
        title: 'New iPhone selling',
        owner: '0x5A3abB61A9c5475B8243',
        limit: 46,
        burnt: 46,
        relevance: AdRelevance.Top,
        score: 26,
        lastTx: dayjs(),
        status: AdStatus.Showing,
      },
      {
        key: 3,
        title: 'New Samsung selling',
        owner: 'Oxe67DE87789987998878888',
        limit: 34,
        burnt: 34,
        relevance: AdRelevance.Top,
        score: -2,
        lastTx: dayjs(),
        status: AdStatus.NotShowing,
      },
      {
        key: 4,
        title: 'New Samsung selling',
        owner: 'Oxe67DE87789987998878888',
        limit: 10,
        burnt: 10,
        relevance: AdRelevance.Top,
        score: -2,
        lastTx: dayjs(),
        status: AdStatus.Disabled,
      },
    ]
  }
}

export function toDna(num) {
  return num.toLocaleString(undefined, {
    style: 'decimal',
    minimumFractionDigits: 16,
    maximumFractionDigits: 16,
  })
}

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const imageTypes = [
  'image/apng',
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/svg+xml',
  'image/tiff',
  'image/webp',
  'image/x-icon',
]

export function validImageType(file) {
  return imageTypes.includes(file.type)
}
