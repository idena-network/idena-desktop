/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import NextLink from 'next/link'
import theme from '../theme'

// eslint-disable-next-line react/prop-types
function Link({href, color, fontSize, children}) {
  return (
    <NextLink href={href}>
      <a>
        {children}
        <style jsx>{`
          a,
          a:hover,
          a:visited,
          a:active {
            color: ${color};
            font-size: ${fontSize};
            text-decoration: none;
          }
        `}</style>
      </a>
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
