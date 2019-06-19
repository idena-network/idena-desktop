import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'next/router'
import {rem} from 'polished'
import {Heading, Box, IconClose} from '../../shared/components'
import FlipMaster from '../../screens/flips/screens/create-flip/components/flip-master'
import Layout from '../../components/layout'
import theme from '../../shared/theme'
import {NotificationContext} from '../../shared/providers/notification-provider'
import Flex from '../../shared/components/flex'

function EditFlip({router}) {
  const {getFlip} = global.flipStore || {getFlip: null}

  const {addNotification} = useContext(NotificationContext)

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
    <Layout>
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

EditFlip.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  router: PropTypes.object.isRequired,
}

export default withRouter(EditFlip)
