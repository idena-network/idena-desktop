import React from 'react'
import PropTypes from 'prop-types'
import {Box} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'

function SubmitFlip({pics, order, submitFlipResult}) {
  return (
    <>
      <Box>
        <Flex justify="center">
          <Flex direction="column" justify="center" align="center">
            {pics.map((src, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <Box key={idx}>
                <img alt={`flip-${idx}`} width={100} src={src} />
              </Box>
            ))}
          </Flex>
          <Box w="2em">&nbsp;</Box>
          <Flex direction="column" justify="center" align="center">
            {order.map(idx => (
              <Box key={idx}>
                <img alt={`flip-${idx}`} width={100} src={pics[idx]} />
              </Box>
            ))}
          </Flex>
        </Flex>
      </Box>
      {submitFlipResult && (
        <Box>
          <pre>
            {typeof submitFlipResult === 'object'
              ? JSON.stringify(submitFlipResult)
              : submitFlipResult}
          </pre>
        </Box>
      )}
    </>
  )
}

SubmitFlip.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  order: PropTypes.arrayOf(PropTypes.number),
  submitFlipResult: PropTypes.string,
}

export default SubmitFlip
