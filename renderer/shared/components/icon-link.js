import React from 'react'
import Link from 'next/link'
import PropTypes from 'prop-types'
import theme from '../theme'

function IconButton({icon, children, first, ...props}) {
  return (
    <button type="button" {...props}>
      {icon}
      <span>{children}</span>
      <style jsx>{`
        button {
          background: none;
          border: none;
          color: ${theme.colors.primary};
          cursor: pointer;
          font-size: 1em;
          display: flex;
          align-items: center;
          padding: 0 1em;
          ${first && `padding-left: 0`};
          text-decoration: none;
          vertical-align: middle;
          position: relative;
        }
        button::after {
          ${!first && `content: ''`};
          background: ${theme.colors.gray2};
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 1px;
        }
        span {
          display: inline-block;
          margin-left: ${theme.spacings.small};
        }
      `}</style>
    </button>
  )
}

IconButton.propTypes = {
  icon: PropTypes.node,
  first: PropTypes.bool,
  children: PropTypes.node,
}

function IconLink({href, ...props}) {
  return href ? (
    <Link href={href}>
      <IconButton {...props} />
    </Link>
  ) : (
    <IconButton {...props} />
  )
}

IconLink.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.node,
  first: PropTypes.bool,
}

export default IconLink
