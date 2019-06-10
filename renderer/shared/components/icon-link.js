import React from 'react'
import Link from 'next/link'
import PropTypes from 'prop-types'
import theme from '../theme'

function IconButton({icon, children, ...props}) {
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
          text-decoration: none;
          vertical-align: middle;
          position: relative;
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
  children: PropTypes.node,
}

function IconLink({href, icon, ...props}) {
  const iconButton = <IconButton icon={icon} {...props} />
  return href ? <Link href={href}>{iconButton}</Link> : iconButton
}

IconLink.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.node,
}

export default IconLink
