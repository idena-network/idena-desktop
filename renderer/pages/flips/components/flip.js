import React from 'react'
import PropTypes from 'prop-types'
import Flex from '../../../shared/components/flex'
import {Box} from '../../../shared/components'
import theme from '../../../shared/theme'

const fromBlob = src =>
  URL.createObjectURL(new Blob([src], {type: 'image/jpeg'}))

function Flip({pics, dir = 'row'}) {
  return (
    <Flex direction={dir} css={{margin: theme.spacings.normal}}>
      {pics.map((src, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Box key={idx}>
          <img width={100} src={fromBlob(src)} alt={src} />
        </Box>
      ))}
    </Flex>
  )
}

Flip.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string).isRequired,
  dir: PropTypes.oneOf(['row', 'column']),
}

export default Flip
