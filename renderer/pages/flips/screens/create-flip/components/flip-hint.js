import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../../../../shared/theme'
import {Box, Button} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'

function FlipHint({hint, onChange}) {
  return (
    <Flex direction="column" align="center">
      {hint.map((word, idx) => (
        <Box
          p={theme.spacings.xlarge}
          m={theme.spacings.normal}
          w="300px"
          css={{
            border: `solid 1px ${theme.colors.gray3}`,
            borderRadius: '10px',
            marginTop: idx === 0 ? theme.spacings.normal : 0,
          }}
        >
          {word}
        </Box>
      ))}
      <Button onClick={onChange}>Change my words</Button>
    </Flex>
  )
}

FlipHint.propTypes = {
  hint: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
}

export default FlipHint
