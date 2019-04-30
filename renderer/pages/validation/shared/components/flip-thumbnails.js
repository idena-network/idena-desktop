import React from 'react'
import PropTypes from 'prop-types'
import Flex from '../../../../shared/components/flex'
import {Box} from '../../../../shared/components'

function FlipThumbnails({currentIndex, flips}) {
  return (
    <Flex justify="center" align="center" css={{minHeight: '80px'}}>
      {flips.map((flip, idx) => (
        <Box css={currentIndex === idx ? {border: 'solid 2px red'} : null}>
          <img
            // eslint-disable-next-line react/no-array-index-key
            key={`flip-${idx}`}
            alt={`flip-${idx}`}
            width={50}
            src={URL.createObjectURL(new Blob([flip[0]], {type: 'image/jpeg'}))}
          />
        </Box>
      ))}
    </Flex>
  )
}

FlipThumbnails.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  flips: PropTypes.arrayOf(PropTypes.array).isRequired,
}

export default FlipThumbnails
