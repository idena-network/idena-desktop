import React from 'react'
import PropTypes from 'prop-types'
import NextLink from 'next/link'
import theme from '../../theme'

// eslint-disable-next-line react/prop-types
function Link({href, color, children}) {
  return (
    <NextLink href={href}>
      <>
        <a href={href}>{children}</a>
        <style jsx>{`
          a,
          a:hover,
          a:visited,
          a:active {
            color: ${color};
            text-decoration: none;
          }
        `}</style>
      </>
    </NextLink>
  )
}

Link.defaultProps = {
  ...theme.Link,
}

Link.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node,
}

export default Link
