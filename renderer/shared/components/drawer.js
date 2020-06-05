import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {FiX} from 'react-icons/fi'
import {rem, transparentize, backgrounds, cover} from 'polished'
import theme from '../theme'
import useClickOutside from '../hooks/use-click-outside'
import {Absolute} from './position'
import Box from './box'

function Drawer({show, onHide, ...props}) {
  const ref = useRef()

  useClickOutside(ref, () => {
    onHide()
  })

  return show ? (
    <Box
      style={{
        ...backgrounds(transparentize(0.2, theme.colors.black)),
        ...cover(),
        position: 'fixed',
        zIndex: 1300,
      }}
    >
      <Absolute
        bg={theme.colors.white}
        zIndex={1301}
        top={0}
        bottom={0}
        right={0}
        width={rem(360)}
        ref={ref}
        {...props}
      />
      <Absolute top="1em" right="1em" zIndex={1301}>
        <FiX
          color={theme.colors.muted}
          fontSize={theme.fontSizes.large}
          onClick={onHide}
          cursor="pointer"
        />
      </Absolute>
    </Box>
  ) : null
}

Drawer.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
}

export default Drawer
