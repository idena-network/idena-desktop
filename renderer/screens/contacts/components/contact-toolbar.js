import React from 'react'
import {rem, padding, margin} from 'polished'
import {FiSend, FiDollarSign, FiSlash} from 'react-icons/fi'
import theme from '../../../shared/theme'
import {IconButton} from '../../../shared/components/button'
import Divider from '../../../shared/components/divider'
import Flex from '../../../shared/components/flex'

export default () => (
  <Flex
    css={{
      ...padding(rem(theme.spacings.small8), 0),
      ...margin(rem(theme.spacings.medium16), 0),
    }}
  >
    <IconButton icon={<FiSend />} color={theme.colors.primary}>
      Send message
    </IconButton>
    <Divider vertical />
    <IconButton icon={<FiDollarSign />} color={theme.colors.primary}>
      Send coins
    </IconButton>
    <Divider vertical />
    <IconButton icon={<FiSlash />} color={theme.colors.primary}>
      Block user
    </IconButton>
  </Flex>
)
