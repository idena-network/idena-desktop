import React from 'react'
import PropTypes from 'prop-types'
import {Box} from '../../shared/components'

export const Row = ({justify = 'initial', align = 'initial', children}) => (
  <div>
    {React.Children.map(children, child =>
      React.cloneElement(child, {
        w: child.props.w || 100 / React.Children.count(children),
      })
    )}
    <style jsx>{`
      div {
        display: flex;
        justify-content: ${justify};
        align-items: ${align};
      }
    `}</style>
  </div>
)

Row.propTypes = {
  children: PropTypes.node,
  justify: PropTypes.string,
  align: PropTypes.string,
}

export const Col = ({children, ...boxProps}) => (
  <Box {...boxProps}>{children}</Box>
)

Col.propTypes = {
  children: PropTypes.node,
}
