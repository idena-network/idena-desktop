/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import NextLink from 'next/link'
import theme from '../theme'

function Link({href, color, fontSize, children, width, height}) {
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
            display: inline-block;
            width: ${width};
            height: ${height};
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
  color: PropTypes.string,
  fontSize: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  children: PropTypes.node,
}

export default Link
