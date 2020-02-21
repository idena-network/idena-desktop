import React from 'react'
import {FaBullhorn} from 'react-icons/fa'
import {useTranslation} from 'react-i18next'
import {margin} from 'polished'
import {
  Page,
  AdTable,
  AdRow,
  Toolbar,
  ToolbarItem,
  ToolbarButton,
  Figure,
  FigureLabel,
  ToolbarGroup,
  FigureNumber,
  AdHeader,
  AdHeaderCell,
  AdTableBody,
  AdCell,
  AdImage,
  TargetCondition,
  AdDetails,
  AdStatus,
} from '../../screens/ads/components'
import {useAds} from '../../screens/ads/machine'
import {useIdentityState} from '../../shared/providers/identity-context'
import {add} from '../../shared/utils/math'
import {IconButton} from '../../shared/components/button'
import theme, {rem} from '../../shared/theme'
import {adStatusColor, AdStatus as AdStatusEnum} from '../../screens/ads/utils'
import Flex from '../../shared/components/flex'

export default function MyAds() {
  const {t} = useTranslation()

  const [ads] = useAds()
  const {balance} = useIdentityState()

  const hasPendingChanges = ads.some(({burnt}) => burnt <= 0)
  const competitors = 10

  return (
    <Page title="My ads">
      <Toolbar>
        <ToolbarGroup>
          <ToolbarItem>
            <Figure>
              <FigureLabel>My balance</FigureLabel>
              <FigureNumber>
                {balance && balance.toLocaleString()} DNA
              </FigureNumber>
            </Figure>
          </ToolbarItem>
          <ToolbarItem>
            <Figure>
              <FigureLabel>Total burnt, 24 hrs</FigureLabel>
              <FigureNumber>
                {ads
                  .map(({burnt}) => burnt)
                  .reduce(add)
                  .toLocaleString()}{' '}
                DNA
              </FigureNumber>
            </Figure>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton>
            <IconButton
              disabled={!hasPendingChanges}
              icon={<FaBullhorn size={rem(18)} />}
            >
              Publish
            </IconButton>
          </ToolbarButton>
          <ToolbarButton>
            <IconButton icon={<i className="icon icon--add_btn" />}>
              New banner
            </IconButton>
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>
      <AdTable>
        <AdHeader>
          <AdHeaderCell>{t('Ad')}</AdHeaderCell>
          <AdHeaderCell>{t('Limit, DNA/h')}</AdHeaderCell>
          <AdHeaderCell>{t('Burnt, 24 hrs')}</AdHeaderCell>
          <AdHeaderCell>{t('Total burnt, DNA')}</AdHeaderCell>
          <AdHeaderCell>{t('Competitors, #')}</AdHeaderCell>
          <AdHeaderCell>{t('Last tx')}</AdHeaderCell>
        </AdHeader>
        <AdTableBody>
          {ads.map(({imageUrl, title, limit, burnt, lastTx, status}) => (
            <>
              <AdRow>
                <AdCell>
                  <Flex align="top">
                    <AdImage
                      src={imageUrl || '//placekitten.com/32/32'}
                      alt={title}
                      size={32}
                      css={{...margin(0, rem(theme.spacings.small12), 0, 0)}}
                    />
                    {title}
                  </Flex>
                </AdCell>
                <AdCell>{limit}</AdCell>
                <AdCell>{burnt}</AdCell>
                <AdCell>{burnt}</AdCell>
                <AdCell>{competitors}</AdCell>
                <AdCell>{lastTx.toString()}</AdCell>
              </AdRow>
              <AdDetails
                css={{borderLeft: `solid 2px ${adStatusColor(status)}`}}
              >
                <AdStatus color={adStatusColor(status)}>{status}</AdStatus>
                <TargetCondition name="Location" value="USA" />
                <TargetCondition name="Language" value="en" />
                <TargetCondition name="Stake" value=">10000" />
                <TargetCondition name="Age" value=">10" />
                <TargetCondition name="OS" value="macOS" />
              </AdDetails>
            </>
          ))}
        </AdTableBody>
      </AdTable>
    </Page>
  )
}
