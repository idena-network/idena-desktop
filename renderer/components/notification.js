import React from 'react'
import PropTypes from 'prop-types'
import Flex from '../shared/components/flex'
import {Box, Text} from '../shared/components'
import theme from '../shared/theme'

function Notification({title, body, type = 'notification'}) {
  const {danger, gray} = theme.colors
  const regular = type === 'notification'
  return (
    <div>
      <Flex width="100%" justify="center">
        <Box
          bg={regular ? gray : danger}
          p={theme.spacings.normal}
          css={{borderRadius: '10px'}}
        >
          <Text>{title}</Text>
          <br />
          {body && <Text>{body}</Text>}
        </Box>
      </Flex>
    </div>
  )
}

Notification.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string,
  type: PropTypes.oneOf(['notification', 'alert']),
}

export default Notification
