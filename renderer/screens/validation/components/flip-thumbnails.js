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

const activeStyle = {
  border: `solid 2px ${theme.colors.primary}`,
}

const style = {
  border: `solid 2px transparent`,
  borderRadius: rem(12),
}

function FlipThumbnails({flips, currentIndex, onPick}) {
  return (
    <Flex justify="center" align="center" css={{minHeight: rem(48)}}>
      {flips.map(
        ({hash, urls, answer, ready, failed, extra}, idx) =>
          !extra && (
            <Flex
              key={hash}
              justify="center"
              align="center"
              css={currentIndex === idx ? {...style, ...activeStyle} : style}
              onClick={() => onPick(idx)}
            >
              <Box
                css={{
                  height: rem(32),
                  width: rem(32),
                  margin: rem(4),
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
                {failed && (
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
      )}
    </Flex>
  )
}

FlipThumbnails.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  flips: PropTypes.arrayOf(PropTypes.object).isRequired,
  onPick: PropTypes.func,
}

export default FlipThumbnails
