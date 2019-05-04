import React from 'react'
import PropTypes from 'prop-types'
import Flex from '../../../../../shared/components/flex'
import {Box, Button} from '../../../../../shared/components'
import {shuffle} from '../../../../../shared/utils/arr'

function FlipShuffle({pics, randomOrder, onShuffleFlip}) {
  return (
    <>
      <Flex justify="center">
        <Flex direction="column" justify="center" align="center">
          {pics.map((src, idx) => (
            <Box key={idx}>
              <img alt={`flip-${idx}`} width={100} src={src} />
            </Box>
          ))}
        </Flex>
        <Box w="2em">&nbsp;</Box>
        <Flex direction="column" justify="center" align="center">
          {randomOrder.map(idx => (
            <Box key={idx}>
              <img alt={`flip-${idx}`} width={100} src={pics[idx]} />
            </Box>
          ))}
        </Flex>
      </Flex>
      <Flex justify="center">
        <Button
          onClick={() => {
            const nextOrder = [...shuffle(randomOrder)]
            onShuffleFlip(nextOrder)
          }}
        >
          Shuffle
        </Button>
      </Flex>
    </>
  )
}

FlipShuffle.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  randomOrder: PropTypes.arrayOf(PropTypes.number),
  onShuffleFlip: PropTypes.func.isRequired,
}

export default FlipShuffle
