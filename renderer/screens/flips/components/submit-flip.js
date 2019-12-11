import React from 'react'
import PropTypes from 'prop-types'
import {rem, position, borderRadius} from 'polished'
import {Box} from '../../../shared/components'
import Flex from '../../../shared/components/flex'

function SubmitFlip({
  pics,
  order,
  nonSensePic,
  nonSenseOrder,
  submitFlipResult,
}) {
  return (
    <>
      <Box>
        <Flex justify="center">
          <Flex direction="column" justify="center" align="center">
            {pics.map((src, idx) => {
              let style = {...position('relative')}

              if (idx === 0) {
                style = {...style, ...borderRadius('top', rem(8))}
              }
              if (idx === pics.length - 1) {
                style = {...style, ...borderRadius('bottom', rem(8))}
              }
              return (
                <Box key={idx}>
                  <img
                    alt={`flip-${idx}`}
                    width={120}
                    src={src}
                    style={style}
                  />
                </Box>
              )
            })}
          </Flex>
          <Box w="2em">&nbsp;</Box>
          <Flex direction="column" justify="center" align="center">
            {order.map((idx, k) => {
              let style = {...position('relative')}

              if (k === 0) {
                style = {...style, ...borderRadius('top', rem(8))}
              }
              if (k === order.length - 1) {
                style = {...style, ...borderRadius('bottom', rem(8))}
              }

              return (
                <Box key={idx}>
                  <img
                    alt={`flip-${idx}`}
                    width={120}
                    src={idx === nonSenseOrder ? nonSensePic : pics[idx]}
                    style={style}
                  />
                </Box>
              )
            })}
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
  nonSensePic: PropTypes.string,
  nonSenseOrder: PropTypes.number,
  submitFlipResult: PropTypes.string,
}

export default SubmitFlip
