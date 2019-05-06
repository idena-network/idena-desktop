import React from 'react'
import PropTypes from 'prop-types'
import {Box, Button, Text} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import theme from '../../../../../shared/theme'

function SubmitFlip({pics, randomOrder, submitFlipResult, onSubmitFlip}) {
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
      <Box bg={theme.colors.gray1} p={theme.spacings.normal}>
        <Text color={theme.colors.text}>
          {typeof submitFlipResult === 'object'
            ? JSON.stringify(submitFlipResult)
            : submitFlipResult}
        </Text>
      </Box>
    </Box>
  )
}

SubmitFlip.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  randomOrder: PropTypes.arrayOf(PropTypes.number),
  submitFlipResult: PropTypes.string,
  onSubmitFlip: PropTypes.func.isRequired,
}

export default SubmitFlip
