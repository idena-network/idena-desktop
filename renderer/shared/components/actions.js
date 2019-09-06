import React from 'react'
import {rem} from 'polished'
import Flex from './flex'
import Divider from './divider'
import theme from '../theme'

// eslint-disable-next-line react/prop-types
function Actions({children}) {
  return (
    <Flex align="center">
      {React.Children.map(children, (child, idx) => (
        <>
          {React.cloneElement(child, {
            ...child.props,
            style: {padding: rem(theme.spacings.small12)},
          })}
          {idx < children.length - 1 && <Divider vertical />}
        </>
      ))}
    </Flex>
  )
}

export default Actions
