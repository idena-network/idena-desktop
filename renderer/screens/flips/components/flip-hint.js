import React from 'react'
import PropTypes from 'prop-types'
import {rem, padding, margin} from 'polished'
import theme from '../../../shared/theme'
import {Box, Button, BlockText} from '../../../shared/components'
import Flex from '../../../shared/components/flex'

function FlipHint({hint, onChange}) {
  return (
    <Box>
      <Flex align="center" justify="center">
        {hint.map(({name, desc}) => (
          <Box
            key={name}
            p={theme.spacings.xlarge}
            m={theme.spacings.normal}
            w={rem(268)}
            css={{
              border: `solid 1px ${theme.colors.gray2}`,
              borderRadius: '10px',
              minHeight: rem(120),
              ...padding(rem(12), rem(20)),
            }}
          >
            <BlockText>{name}</BlockText>
            <BlockText color={theme.colors.muted}>{desc}</BlockText>
          </Box>
        ))}
      </Flex>
      <Box css={margin(rem(theme.spacings.medium24), 0, 0)}>
        <Button onClick={onChange}>Change my words</Button>
      </Box>
    </Box>
  )
}

FlipHint.propTypes = {
  hint: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
}

export default FlipHint
