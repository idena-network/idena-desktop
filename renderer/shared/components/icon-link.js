import React from 'react'
import Link from 'next/link'
import PropTypes from 'prop-types'
import {IconButton} from './button'

function IconLink({href, icon, ...props}) {
  const iconButton = <IconButton icon={icon} {...props} />
  return href ? <Link href={href}>{iconButton}</Link> : iconButton
}

IconLink.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.node,
}

export default IconLink
