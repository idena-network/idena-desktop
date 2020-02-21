import dayjs from 'dayjs'
import {AdRelevance, AdStatus} from './utils'

export const ads = [
  {
    key: 1,
    title: 'New ICO is running. DNA is accepted',
    owner: 'a0xSF12FEJ320DWF3FFa0xaDWF3FFa0',
    limit: 58,
    burnt: 58,
    relevance: AdRelevance.Top,
    score: 28,
    lastTx: dayjs(),
    status: AdStatus.PartiallyShowing,
  },
  {
    key: 2,
    title: 'New iPhone selling 12345 DNA',
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
    title: 'New Samsung selling 12345 DNA',
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
    title: 'New Samsung selling 12345 DNA',
    owner: 'Oxe67DE87789987998878888',
    limit: 10,
    burnt: 10,
    relevance: AdRelevance.Top,
    score: -2,
    lastTx: dayjs(),
    status: AdStatus.Disabled,
  },
]

export function useAds() {
  return [ads]
}
