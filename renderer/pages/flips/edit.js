import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'next/router'
import {FiX} from 'react-icons/fi'
import {rem, margin} from 'polished'
import {Heading, Box} from '../../shared/components'
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

  return draft ? (
    <Layout>
      <Box px={rem(80)} py={rem(24)}>
        <Flex align="center" justify="space-between">
          <Heading margin={0}>Edit flip</Heading>
          <FiX
            color={theme.colors.muted}
            fontSize={theme.fontSizes.large}
            cursor="pointer"
            onClick={() => {
              addNotification({
                title: 'Flip has been saved to drafts',
              })
              router.push('/flips')
            }}
          />
        </Flex>
        <FlipMaster
          id={draft.id}
          {...draft}
          onAddNotification={addNotification}
        />
      </Box>
    </Layout>
  ) : null
}

EditFlip.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  router: PropTypes.object.isRequired,
}

export default withRouter(EditFlip)
