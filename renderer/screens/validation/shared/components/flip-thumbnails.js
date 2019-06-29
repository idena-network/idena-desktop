import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import Flex from '../../../../shared/components/flex'
import {Box, Fill} from '../../../../shared/components'
import theme from '../../../../shared/theme'
import {inappropriate, appropriate} from '../utils/answers'

const activeStyle = {
  border: `solid 2px ${theme.colors.primary}`,
  boxShadow: '0 0 4px 4px rgba(87, 143, 255, 0.25)',
}

const style = {
  borderRadius: rem(12),
  padding: theme.spacings.xxsmall,
  position: 'relative',
}

function FlipThumbnails({currentIndex, flips, answers, onPick}) {
  return (
    <Flex justify="center" align="center" css={{minHeight: rem(48)}}>
      {flips.map((flip, idx) => (
        <Box
          css={currentIndex === idx ? {...style, ...activeStyle} : style}
          onClick={() => onPick(idx)}
        >
          {appropriate(answers[idx]) && <Fill bg={theme.colors.white05} />}
          {inappropriate(answers[idx]) && <Fill bg={theme.colors.danger} />}
          <img
            alt={`flip-${idx}`}
            width={rem(40)}
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
  answers: PropTypes.arrayOf(PropTypes.number).isRequired,
  onPick: PropTypes.func,
}

export default FlipThumbnails
