import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {FiX} from 'react-icons/fi'
import {rem} from 'polished'
import theme from '../theme'
import {Box, Fill, Absolute} from '.'
import useClickOutside from '../hooks/use-click-outside'

function Modal({show, onHide, ...props}) {
  const ref = useRef()

  useClickOutside(ref, () => {
    if (onHide) {
      onHide()
    }
  })

  return show ? (
    <Fill bg={theme.colors.gray3} zIndex={1}>
      <div>
        <Box ref={ref} {...props} />
      </div>
      <style jsx>{`
        div {
          position: absolute;
          left: 50%;
          top: 50%;
          width: ${rem(360)};
          padding: ${rem(25)} ${rem(32)};
          border-radius: 6px;
          background-color: ${theme.colors.white};
          transform: translate(-50%, -50%);
        }
      `}</style>
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

Modal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
}

export default Modal
