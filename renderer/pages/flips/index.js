import React from 'react'
import {rem, margin} from 'polished'

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
  const {flips, submitFlip, deleteFlip} = useFlips()
  const {addNotification, addError} = useNotificationDispatch()
  const {syncing, offline, loading} = useChainState()

  const [filter, setFilter] = useLocalStorage(
    'flips/filter',
    FlipType.Published
  )

  const filteredFlips = flips.filter(({type}) =>
    filter === FlipType.Published
      ? [FlipType.Publishing, filter].includes(type)
      : type === filter
  )

  return (
    <Layout syncing={syncing} offline={offline} loading={loading}>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
        <PageTitle>My Flips</PageTitle>
        <FlipToolbar>
          <Flex>
            {Object.values(FlipType)
              // alias Publishing to Published in userland
              .filter(type => type !== FlipType.Publishing)
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
              New flip
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
                      title: 'Can not submit flip',
                      body: 'Keywords are not specified',
                    })
                  }
                  const {result, error} = await submitFlip(flip)

                  if (error) {
                    addError({
                      title: 'Error while uploading flip',
                      body: error.message,
                    })
                  } else {
                    addNotification({
                      title: 'Flip saved',
                      body: result.hash,
                    })
                  }
                } catch (error) {
                  let message = 'Something went wrong'
                  if (error.response && error.response.status === 413) {
                    message = 'Maximum image size exceeded'
                  }
                  addError({
                    title: message,
                  })
                }
              }}
              onDelete={() => {
                deleteFlip(flip)
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
