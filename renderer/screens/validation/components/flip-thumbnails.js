import React from 'react'
import PropTypes from 'prop-types'
import {rem, position, rgba} from 'polished'
import {FiCheck, FiZap, FiXCircle} from 'react-icons/fi'
import Flex from '../../../shared/components/flex'
import {Fill, Box} from '../../../shared/components'
import theme from '../../../shared/theme'
import FlipImage from '../../flips/components/flip-image'
import {
  AnswerType,
  hasAnswer,
} from '../../../shared/providers/validation-context'
import Spinner from './spinner'

const borderWidth = 2
const margin = 4
const width = 32
const totalWidth = borderWidth * 2 + margin * 2 + width

const activeStyle = {
  border: `solid ${rem(borderWidth)} ${theme.colors.primary}`,
}

const style = {
  border: `solid ${rem(borderWidth)} transparent`,
  borderRadius: rem(12),
}

function FlipThumbnails({flips, currentIndex, onPick}) {
  return (
    <Flex
      align="center"
      css={{
        minHeight: rem(48),
        marginLeft: `calc(50% - ${rem(totalWidth * (currentIndex + 1 / 2))})`,
      }}
    >
      {flips.map(
        (flip, idx) =>
          !flip.hidden && (
            <Thumb
              {...flip}
              isCurrent={currentIndex === idx}
              onClick={() => onPick(idx)}
            />
          )
      )}
    </Flex>
  )
}

FlipThumbnails.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  flips: PropTypes.arrayOf(PropTypes.object).isRequired,
  onPick: PropTypes.func,
}

function Thumb({hash, urls, answer, ready, failed, isCurrent, onClick}) {
  return (
    <Flex
      key={hash}
      justify="center"
      align="center"
      css={isCurrent ? {...style, ...activeStyle} : style}
      onClick={onClick}
    >
      <Box
        css={{
          height: rem(width),
          width: rem(width),
          margin: rem(margin),
          ...position('relative'),
        }}
      >
        {hasAnswer(answer) && (
          <Fill
            bg={rgba(89, 89, 89, 0.95)}
            css={{
              borderRadius: rem(12),
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {answer === AnswerType.Inappropriate ? (
              <FiZap size={rem(20)} color={theme.colors.white} />
            ) : (
              <FiCheck size={rem(20)} color={theme.colors.white} />
            )}
          </Fill>
        )}
        {failed && !hasAnswer(answer) && (
          <Fill
            bg={rgba(89, 89, 89, 0.95)}
            css={{
              borderRadius: rem(12),
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <FiXCircle size={rem(20)} color={theme.colors.white} />
          </Fill>
        )}
        {ready ? (
          <FlipImage
            size={32}
            src={urls[0]}
            style={{
              borderRadius: rem(12),
            }}
          />
        ) : (
          <Spinner size={24} />
        )}
      </Box>
    </Flex>
  )
}

Thumb.propTypes = {
  hash: PropTypes.string,
  urls: PropTypes.arrayOf(PropTypes.string),
  answer: PropTypes.number,
  ready: PropTypes.bool,
  failed: PropTypes.bool,
  isCurrent: PropTypes.bool,
  onClick: PropTypes.func,
}

export default FlipThumbnails
