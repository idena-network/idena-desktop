import React from 'react'
import {useRouter} from 'next/router'
import {rem} from 'polished'

import {Heading, Box, IconClose} from '../../shared/components'
import FlipMaster from '../../screens/flips/components/flip-master'
import Layout from '../../shared/components/layout'
import theme from '../../shared/theme'
import Flex from '../../shared/components/flex'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import {useChainState} from '../../shared/providers/chain-context'

function EditFlip() {
  const {getFlip} = global.flipStore || {getFlip: null}

  const {syncing} = useChainState()

  const router = useRouter()
  const {addNotification} = useNotificationDispatch()

  if (!getFlip) {
    return null
  }

  const draft = getFlip(router.query.id)

  const handleClose = () => {
    addNotification({
      title: 'Flip has been saved to drafts',
    })
    router.push('/flips')
  }

  return draft ? (
    <Layout syncing={syncing}>
      <Box px={rem(theme.spacings.large)} py={rem(theme.spacings.medium24)}>
        <Flex align="center" justify="space-between">
          <Heading margin={0}>Edit flip</Heading>
          <IconClose onClick={handleClose} />
        </Flex>
        <FlipMaster id={draft.id} {...draft} onClose={handleClose} />
      </Box>
    </Layout>
  ) : null
}

export default EditFlip
