import React from 'react'
import PropTypes from 'prop-types'
import theme from '../theme'
import {Fill, Absolute, Text} from '.'

export function Drawer({show, onHide, ...props}) {
  return show ? (
    <Fill bg={theme.colors.gray3} zIndex={1}>
      <Absolute
        bg={theme.colors.white}
        zIndex={2}
        top={0}
        bottom={0}
        right={0}
        w="350px"
        {...props}
      />
      <Absolute top="1em" right="1em" zIndex={2}>
        <Text
          color={theme.colors.muted}
          size="1.6em"
          css={{cursor: 'pointer'}}
          onClick={onHide}
        >
          &times;
        </Text>
      </Absolute>
    </Fill>
  ) : null
}

Drawer.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
}

export default Drawer
