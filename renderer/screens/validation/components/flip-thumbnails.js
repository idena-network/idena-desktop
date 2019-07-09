import React from 'react'
import PropTypes from 'prop-types'
import {rem, backgrounds} from 'polished'
import Flex from '../../../shared/components/flex'
import {Box, Fill} from '../../../shared/components'
import theme from '../../../shared/theme'
import FlipImage from '../../flips/components/flip-image'
import {hasAnswer} from '../utils/reducer'
import {AnswerType} from '../../../shared/providers/validation-context'
import Spinner from './spinner'

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

function FlipThumbnails({flips, currentIndex, onPick}) {
  return (
    <Flex justify="center" align="center" css={{minHeight: rem(48)}}>
      {flips.map(({hash, pics, answer, ready}, idx) => (
        <Box
          key={hash}
          css={currentIndex === idx ? {...style, ...activeStyle} : style}
          onClick={() => onPick(idx)}
        >
          {hasAnswer(answer) && (
            <Fill
              bg={
                answer === AnswerType.Inappropriate
                  ? theme.colors.danger
                  : theme.colors.white05
              }
            />
          )}
          {ready ? (
            <FlipImage
              size={32}
              src={URL.createObjectURL(
                new Blob([pics[0]], {type: 'image/jpeg'})
              )}
              style={{borderRadius: rem(8)}}
            />
          ) : (
            <Fill>
              <Spinner />
            </Fill>
          )}
        </Box>
      ))}
    </Flex>
  )
}

FlipThumbnails.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  flips: PropTypes.arrayOf(PropTypes.array).isRequired,
  onPick: PropTypes.func,
}

export default FlipThumbnails
