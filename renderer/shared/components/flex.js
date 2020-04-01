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
  hoverColor,
  onClick,
  children,
}) {
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div style={css} onKeyPress={onClick} onClick={onClick}>
      {children}
      <style jsx>{`
        div {
          display: flex;
          flex-direction: ${direction};
          justify-content: ${justify};
          align-items: ${align};
          ${flex && `flex: ${flex}`};
          ${width && `width: ${width}`};
        }
        div:hover {
          ${hoverColor ? `color: ${hoverColor} !important` : ''};
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
  flex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.string,
  onClick: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
  hoverColor: PropTypes.string,
}

export default Flex
