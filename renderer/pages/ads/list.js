import React from 'react'
import Layout from '../../shared/components/layout'
import {Box, PageTitle} from '../../shared/components'
import {margin, padding} from 'polished'
import {rem} from '../../shared/theme'
import {Page, AdList, AdListItem} from '../../screens/ads/components'
import {AdRelevance} from '../../screens/ads/utils'

const ads = [
  {
    key: 1,
    title: 'New ICO is running. DNA is accepted',
    address: 'a0xSF12FEJ320DWF3FFa0xaDWF3FFa0',
    burnt: 58,
    relevance: AdRelevance.Top,
    score: 28,
  },
  {
    key: 2,
    title: 'New iPhone selling 12345 DNA',
    address: '0x5A3abB61A9c5475B8243',
    burnt: 46,
    relevance: AdRelevance.Top,
    score: 26,
  },
  {
    key: 3,
    title: 'New Samsung selling 12345 DNA',
    address: 'Oxe67DE87789987998878888',
    burnt: 34,
    relevance: AdRelevance.Top,
    score: -2,
  },
]

export default function AdListPage() {
  return (
    <Page title="All offers">
      <AdList>
        {ads.map(ad => (
          <AdListItem {...ad} />
        ))}
      </AdList>
    </Page>
  )
}
