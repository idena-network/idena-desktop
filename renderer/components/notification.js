import React from 'react'
import PropTypes from 'prop-types'
import Flex from '../shared/components/flex'
import {Box, Text} from '../shared/components'
import theme from '../shared/theme'

function Notification({title, body}) {
  return (
    <div>
      <Flex width="100%" justify="center">
        <Box
          bg={theme.colors.gray}
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
}

export default Notification
