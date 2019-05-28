import React from 'react'
import Link from 'next/link'
import {Box, SubHeading, Text} from '../../../../shared/components'
import theme from '../../../../shared/theme'

// eslint-disable-next-line react/prop-types
function FlipPlaceholder({idx}) {
  return (
    <Link href="/flips/new">
      <Box
        bg={theme.colors.gray}
        margin={`0 ${theme.spacings.normal} 0 0`}
        padding={theme.spacings.normal}
        w="220px"
        css={{borderRadius: '10px', cursor: 'pointer'}}
      >
        <img
          src="https://cdn1.iconfinder.com/data/icons/apple-watch-bold-line-2/70/99-512.png"
          alt="empty-flip"
          width="200"
        />
        <SubHeading>Flip#{idx + 1}</SubHeading>
        <Text>Click to create</Text>
        <style jsx>{`
          img {
            background-size: cover;
            border-radius: 10px;
          }
        `}</style>
      </Box>
    </Link>
  )
}

export default FlipPlaceholder
