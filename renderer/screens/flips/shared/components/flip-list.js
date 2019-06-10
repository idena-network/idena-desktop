import React from 'react'
import {margin} from 'polished'
import Flex from '../../../../shared/components/flex'
import theme from '../../../../shared/theme'

function FlipList(props) {
  return (
    <Flex
      css={{flexWrap: 'wrap', ...margin(`${theme.spacings.normal} 0`)}}
      {...props}
    />
  )
}

export default FlipList
