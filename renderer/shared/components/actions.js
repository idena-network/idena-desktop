/* eslint-disable react/prop-types */
import React from 'react'
import Flex from './flex'
import Divider from './divider'
import theme, {rem} from '../theme'

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
