import React from 'react'
import PropTypes from 'prop-types'
import Flip from './flip'
import Flex from '../../../shared/components/flex'
import {Link, Box} from '../../../shared/components'
import theme from '../../../shared/theme'

// eslint-disable-next-line react/prop-types
const FlipLink = ({id, ...flipProps}) => (
  <Box m={`${theme.spacings.normal} 0`} w="25%">
    <Link href={`/flips/edit?id=${id}`} css>
      <Flip id={id} {...flipProps} />
    </Link>
  </Box>
)

function FlipList({flips}) {
  return (
    <Flex css={{flexWrap: 'wrap'}}>
      {flips.map(flip =>
        flip.id ? (
          <FlipLink key={flip.id} {...flip} />
        ) : (
          <Flip key={flip.hash} {...flip} />
        )
      )}
    </Flex>
  )
}

FlipList.propTypes = {
  flips: PropTypes.arrayOf(PropTypes.object),
}

export default FlipList
