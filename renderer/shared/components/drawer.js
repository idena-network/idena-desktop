import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {FiX} from 'react-icons/fi'
import {rem} from 'polished'
import theme from '../theme'
import useClickOutside from '../hooks/use-click-outside'
import {Fill, Absolute} from './position'

function Drawer({show, onHide, ...props}) {
  const ref = useRef()

  useClickOutside(ref, () => {
    onHide()
  })

  return show ? (
    <Fill bg={theme.colors.gray3} zIndex={1}>
      <Absolute
        bg={theme.colors.white}
        zIndex={2}
        top={0}
        bottom={0}
        right={0}
        width={rem(360)}
        ref={ref}
        {...props}
      />
      <Absolute top="1em" right="1em" zIndex={2}>
        <FiX
          color={theme.colors.muted}
          fontSize={theme.fontSizes.large}
          onClick={onHide}
          cursor="pointer"
        />
      </Absolute>
    </Fill>
  ) : null
}

Drawer.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
}

export default Drawer
