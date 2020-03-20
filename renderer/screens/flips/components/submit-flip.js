import React from 'react'
import PropTypes from 'prop-types'
import {rem, position, borderRadius} from 'polished'
import {FaImage} from 'react-icons/fa'
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
                style = {
                  ...style,
                  ...borderRadius('bottom', rem(8)),
                  borderBottom: 'solid 1px rgba(83, 86, 92, 0.16)',
                }
              }
              style = {
                ...style,
                borderTop: 'solid 1px rgba(83, 86, 92, 0.16)',
                borderRight: 'solid 1px rgba(83, 86, 92, 0.16)',
                borderLeft: 'solid 1px rgba(83, 86, 92, 0.16)',
              }

              return (
                <Image
                  key={idx}
                  alt={`flip-${idx}`}
                  src={src}
                  style={style}
                ></Image>
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
                style = {
                  ...style,
                  ...borderRadius('bottom', rem(8)),
                  borderBottom: 'solid 1px rgba(83, 86, 92, 0.16)',
                }
              }
              style = {
                ...style,
                borderTop: 'solid 1px rgba(83, 86, 92, 0.16)',
                borderRight: 'solid 1px rgba(83, 86, 92, 0.16)',
                borderLeft: 'solid 1px rgba(83, 86, 92, 0.16)',
              }

              return (
                <Image
                  key={idx}
                  alt={`flip-${idx}`}
                  src={idx === nonSenseOrder ? nonSensePic : pics[idx]}
                  style={style}
                ></Image>
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

// eslint-disable-next-line react/prop-types
function Image({src, style, children}) {
  if (src) {
    const imgBoxStyle = {
      ...{
        position: 'relative',
        width: rem(149),
        height: rem(112),
        paddingLeft: '1px',
        paddingTop: '1px',
      },
    }
    const imgStyle = {...style, ...{width: rem(147), height: rem(110)}}
    return (
      <Box style={imgBoxStyle}>
        <img alt="flip" src={src} style={imgStyle} />
        {children}
      </Box>
    )
  }

  const boxStyle = {
    ...style,
    ...{
      backgroundColor: '#f5f6f7',
      width: rem(149),
      height: rem(112),
    },
  }
  return (
    <Box style={boxStyle}>
      <FaImage
        style={{
          fontSize: rem(40),
          color: '#d2d4d9',
          marginTop: rem(35),
          marginLeft: rem(55),
        }}
      ></FaImage>
      {children}
    </Box>
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
