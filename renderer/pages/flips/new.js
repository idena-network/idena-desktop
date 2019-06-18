import React, {useState} from 'react'
import nanoid from 'nanoid'
import {rem} from 'polished'
import {withRouter} from 'next/router'
import {Heading, Box, IconClose} from '../../shared/components'
import FlipMaster from '../../screens/flips/screens/create-flip/components/flip-master'
import Layout from '../../components/layout'
import theme from '../../shared/theme'
import Flex from '../../shared/components/flex'
import {NotificationContext} from '../../shared/providers/notification-provider'

// eslint-disable-next-line react/prop-types
function NewFlip({router}) {
  const {addNotification} = React.useContext(NotificationContext)

  const [id] = useState(nanoid())

  return (
    <Layout>
      <Box px={rem(theme.spacings.large)} py={rem(theme.spacings.medium24)}>
        <Flex align="center" justify="space-between">
          <Heading margin={0}>New flip</Heading>
          <IconClose
            onClick={() => {
              addNotification({
                title: 'Flip has been saved to drafts',
              })
              router.push('/flips')
            }}
          />
        </Flex>
        <FlipMaster id={id} />
      </Box>
    </Layout>
  )
}

export default withRouter(NewFlip)
