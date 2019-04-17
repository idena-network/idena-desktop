import React from 'react'
import NextLink from 'next/link'

// eslint-disable-next-line react/prop-types
export default function Link({href, children}) {
  return (
    <NextLink href={href}>
      <a href={href}>{children}</a>
    </NextLink>
  )
}
