import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {FiX} from 'react-icons/fi'
import {transparentize, backgrounds, cover} from 'polished'
import {useColorMode} from '@chakra-ui/core'
import theme, {rem} from '../theme'
import useClickOutside from '../hooks/use-click-outside'
import {Absolute} from './position'
import Box from './box'

function Drawer({show, onHide, ...props}) {
  const ref = useRef()
  const {colorMode} = useColorMode()

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
        bg={
          colorMode === 'light' ? theme.colors.white : theme.colors.dark.gray2
        }
        zIndex={1301}
        top={0}
        bottom={0}
        right={0}
        width={rem(360)}
        color={theme.colors[colorMode].text}
        ref={ref}
        {...props}
      />
      <Absolute top="1em" right="1em" zIndex={1301}>
        <FiX
          color={
            colorMode === 'light' ? theme.colors.black : theme.colors.white
          }
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
