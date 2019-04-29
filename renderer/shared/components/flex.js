import React from 'react'
import PropTypes from 'prop-types'
import theme from '../theme'

function Flex({direction, justify, align, flex, width, css, children}) {
  return (
    <div style={css}>
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
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

export default Flex
