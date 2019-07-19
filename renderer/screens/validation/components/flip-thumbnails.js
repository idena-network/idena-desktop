import React from 'react'
import PropTypes from 'prop-types'
import {rem, position, rgba} from 'polished'
import {FiCheck, FiZap} from 'react-icons/fi'
import Flex from '../../../shared/components/flex'
import {Fill} from '../../../shared/components'
import theme from '../../../shared/theme'
import FlipImage from '../../flips/components/flip-image'
import {
  AnswerType,
  hasAnswer,
} from '../../../shared/providers/validation-context'
import Spinner from './spinner'

const activeStyle = {
  border: `solid 2px ${theme.colors.primary}`,
}

const style = {
  border: `solid 2px transparent`,
  borderRadius: rem(12),
  padding: rem(4),
  ...position('relative'),
  height: rem(40),
  width: rem(40),
}

function FlipThumbnails({flips, currentIndex, onPick}) {
  return (
    <Flex justify="center" align="center" css={{minHeight: rem(48)}}>
      {flips.map(({hash, pics, answer, ready}, idx) => (
        <Flex
          key={hash}
          justify="center"
          align="center"
          css={currentIndex === idx ? {...style, ...activeStyle} : style}
          onClick={() => onPick(idx)}
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
          {ready ? (
            <FlipImage
              size={32}
              src={URL.createObjectURL(
                new Blob([pics[0]], {type: 'image/jpeg'})
              )}
              style={{
                borderRadius: rem(12),
              }}
            />
          ) : (
            <Spinner size={24} />
          )}
        </Flex>
      ))}
    </Flex>
  )
}

FlipThumbnails.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  flips: PropTypes.arrayOf(PropTypes.object).isRequired,
  onPick: PropTypes.func,
}

export default FlipThumbnails
