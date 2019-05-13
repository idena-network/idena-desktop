import React from 'react'
import PropTypes from 'prop-types'
import theme from '../theme'

function Flex({
  direction,
  justify,
  align,
  flex,
  width,
  css,
  onClick,
  children,
}) {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      style={css}
      onKeyPress={onClick}
      role="button"
      tabIndex="0"
      onClick={onClick}
    >
      {children}
      <style jsx>{`
        div {
          display: flex;
          flex-direction: ${direction};
          justify-content: ${justify};
          align-items: ${align};
          ${flex && `flex: ${flex}`};
          ${width && `flex: ${width}`};
        }
      `}</style>
    </div>
  )
}

Flex.defaultProps = {
  ...theme.Flex,
}

Flex.propTypes = {
  children: PropTypes.node,
  direction: PropTypes.string,
  justify: PropTypes.string,
  align: PropTypes.string,
  flex: PropTypes.string,
  width: PropTypes.string,
  onClick: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

export default Flex
