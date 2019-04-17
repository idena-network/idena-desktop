import React from 'react'
import PropTypes from 'prop-types'
import {Box} from '.'

export function Row({
  justify = 'initial',
  align = 'initial',
  css,
  children,
  ...props
}) {
  return (
    <div style={css} {...props}>
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
}

Row.propTypes = {
  children: PropTypes.node,
  justify: PropTypes.string,
  align: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

export function Col(props) {
  return <Box {...props} />
}

Col.propTypes = {
  children: PropTypes.node,
}
