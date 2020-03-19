import React from 'react'
import {rem, margin} from 'polished'

import {useTranslation} from 'react-i18next'
import useLocalStorage from '../../shared/hooks/use-local-storage'
import Layout from '../../shared/components/layout'
import {Box, PageTitle} from '../../shared/components'
import theme from '../../shared/theme'
import FlipToolbar, {
  FlipToolbarItem,
} from '../../screens/flips/components/toolbar'
import useFlips, {FlipType} from '../../shared/utils/useFlips'
import Flex from '../../shared/components/flex'
import IconLink from '../../shared/components/icon-link'
import FlipCover from '../../screens/flips/components/flip-cover'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import {useChainState} from '../../shared/providers/chain-context'

function Flips() {
  const {t} = useTranslation('error')
  const {flips, submitFlip, deleteFlip} = useFlips()
  const {addNotification, addError} = useNotificationDispatch()
  const {syncing, offline, loading} = useChainState()

  const [filter, setFilter] = useLocalStorage(
    'flips/filter',
    FlipType.Published
  )

  const filteredFlips = flips.filter(({type}) =>
    filter === FlipType.Published
      ? [FlipType.Publishing, FlipType.Deleting, filter].includes(type)
      : type === filter
  )

  return (
    <Layout syncing={syncing} offline={offline} loading={loading}>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
        <PageTitle>{t('translation:My Flips')}</PageTitle>
        <FlipToolbar>
          <Flex>
            {Object.values(FlipType)
              // alias Publishing and Deleting to Published in userland, hide Deleted
              .filter(
                type =>
                  type !== FlipType.Publishing &&
                  type !== FlipType.Deleting &&
                  type !== FlipType.Deleted
              )
              .map(type => (
                <FlipToolbarItem
                  key={type}
                  onClick={() => setFilter(type)}
                  isCurrent={filter === type}
                >
                  {type}
                </FlipToolbarItem>
              ))}
          </Flex>
          <Flex>
            <IconLink
              href="/flips/new"
              icon={<i className="icon icon--add_btn" />}
            >
              {t('translation:New flip')}
            </IconLink>
          </Flex>
        </FlipToolbar>
      </Box>
      <Box my={rem(theme.spacings.medium32)} px={theme.spacings.xxxlarge}>
        <FlipList>
          {filteredFlips.map(flip => (
            <FlipCover
              key={flip.id}
              {...flip}
              width="25%"
              onSubmit={async () => {
                try {
                  if (!flip.hint) {
                    addError({
                      title: t('error:Can not submit flip'),
                      body: t('error:Keywords are not specified'),
                    })
                  }
                  const {result, error} = await submitFlip(flip)

                  if (error) {
                    addError({
                      title: t('error:Error while uploading flip'),
                      body: error.message,
                    })
                  } else {
                    addNotification({
                      title: t('translation:Flip saved'),
                      body: result.hash,
                    })
                  }
                } catch (error) {
                  let message = t('error:Something went wrong')
                  if (error.response && error.response.status === 413) {
                    message = t('error:Maximum image size exceeded')
                  }
                  addError({
                    title: message,
                  })
                }
              }}
              onDelete={async () => {
                try {
                  const {result, error} = await deleteFlip(flip)
                  if (error) {
                    addError({
                      title: t('error:Error while deleting flip'),
                      body: error.message,
                    })
                  } else if (result) {
                    addNotification({
                      title: t('translation:Flip deleted'),
                      body: result,
                    })
                  }
                } catch (error) {
                  addError({
                    title: t('error:Something went wrong'),
                    body: error,
                  })
                }
              }}
            />
          ))}
        </FlipList>
      </Box>
    </Layout>
  )
}

function FlipList(props) {
  return (
    <Flex
      css={{flexWrap: 'wrap', ...margin(`${theme.spacings.normal} 0`)}}
      {...props}
    />
  )
}

export default Flips
