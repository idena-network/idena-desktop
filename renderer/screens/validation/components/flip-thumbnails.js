import React from 'react'
import PropTypes from 'prop-types'
import {rem, backgrounds} from 'polished'
import Flex from '../../../shared/components/flex'
import {Box, Fill} from '../../../shared/components'
import theme from '../../../shared/theme'
import {inappropriate, appropriate} from '../utils/answers'
import FlipImage from '../../flips/components/flip-image'

const activeStyle = {
  border: `solid 2px ${theme.colors.primary}`,
  boxShadow: '0 0 4px 4px rgba(87, 143, 255, 0.25)',
}

const style = {
  borderRadius: rem(12),
  ...backgrounds(theme.colors.white),
  padding: theme.spacings.xxsmall,
  position: 'relative',
  height: rem(40),
  width: rem(40),
}

function FlipThumbnails({currentIndex, flips, answers, onPick}) {
  return (
    <Flex justify="center" align="center">
      {flips.map((flip, idx) => (
        <Box
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          css={currentIndex === idx ? {...style, ...activeStyle} : style}
          onClick={() => onPick(idx)}
        >
          {appropriate(answers[idx]) && <Fill bg={theme.colors.white05} />}
          {inappropriate(answers[idx]) && <Fill bg={theme.colors.danger} />}
          <FlipImage
            size={32}
            src={URL.createObjectURL(new Blob([flip[0]], {type: 'image/jpeg'}))}
            style={{borderRadius: rem(8)}}
          />
        </Box>
      ))}
    </Flex>
  )
}

FlipThumbnails.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  flips: PropTypes.arrayOf(PropTypes.array).isRequired,
  answers: PropTypes.arrayOf(PropTypes.number).isRequired,
  onPick: PropTypes.func,
}

export default FlipThumbnails
