import React, {useState} from 'react'
import nanoid from 'nanoid'
import {rem} from 'polished'
import {useRouter} from 'next/router'

import {useTranslation} from 'react-i18next'
import {Heading, Box, IconClose} from '../../shared/components'
import FlipMaster from '../../screens/flips/components/flip-master'
import Layout from '../../shared/components/layout'
import theme from '../../shared/theme'
import Flex from '../../shared/components/flex'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import {useChainState} from '../../shared/providers/chain-context'

function NewFlip() {
  const {t} = useTranslation()

  const {syncing} = useChainState()

  const router = useRouter()
  const {addNotification} = useNotificationDispatch()

  const [id] = useState(nanoid())

  const handleClose = () => {
    addNotification({
      title: t('Flip has been saved to drafts'),
    })
    router.push('/flips')
  }

  return (
    <Layout syncing={syncing}>
      <Box px={rem(theme.spacings.large)} py={rem(theme.spacings.medium24)}>
        <Flex align="center" justify="space-between">
          <Heading margin={0}>{t('New flip')}</Heading>
          <IconClose onClick={handleClose} />
        </Flex>
        <FlipMaster id={id} onClose={handleClose} />
      </Box>
    </Layout>
  )
}

export default NewFlip
