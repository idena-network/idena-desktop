import React from 'react'
import PropTypes from 'prop-types'
import {Box, Button, Text} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import theme from '../../../../../shared/theme'

function SubmitFlip({pics, randomOrder, result, onSubmitFlip}) {
  return (
    <Box>
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
      <Button onClick={onSubmitFlip}>Submit flip</Button>
      <Text color={theme.colors.text}>{result}</Text>
    </Box>
  )
}

SubmitFlip.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  randomOrder: PropTypes.arrayOf(PropTypes.number),
  result: PropTypes.string,
  onSubmitFlip: PropTypes.func.isRequired,
}

export default SubmitFlip
