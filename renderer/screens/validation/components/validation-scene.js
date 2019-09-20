/* eslint-disable no-use-before-define */
/* eslint-disable react/no-array-index-key */
import React from 'react'
import PropTypes from 'prop-types'
import {rem, margin, padding, borderRadius} from 'polished'
import {Col, Box, Fill, Switcher, Label} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import Arrow from './arrow'
import {reorderList} from '../../../shared/utils/arr'
import Spinner from './spinner'
import theme from '../../../shared/theme'
import {
  AnswerType,
  hasAnswer,
  SessionType,
  useValidationDispatch,
  PREV,
  NEXT,
  ANSWER,
  useValidationState,
} from '../../../shared/providers/validation-context'
import vocabulary from '../../flips/utils/words'
import useRpc from '../../../shared/hooks/use-rpc'
import {usePoll} from '../../../shared/hooks/use-interval'

export default function ValidationScene({
  flip: {urls, answer, ready, orders, failed, hash},
  isFirst,
  isLast,
  type,
}) {
  const dispatch = useValidationDispatch()
  return (
    <Flex
      justify="space-between"
      flex={1}
      css={margin(0, rem(theme.spacings.medium24), 0)}
    >
      {!isFirst && (
        <Box onClick={() => dispatch({type: PREV})}>
          <Arrow dir="prev" type={type} />
        </Box>
      )}
      <Flex>
        <Flex
          direction="column"
          justify="center"
          align="center"
          css={style(answer, AnswerType.Left)}
        >
          {ready &&
            !failed &&
            reorderList(urls, orders[0]).map((src, idx) => (
              <Box
                key={orders[0][idx]}
                onClick={() =>
                  dispatch({type: ANSWER, option: AnswerType.Left})
                }
              >
                <img
                  alt="currentFlip"
                  height={110}
                  width={147}
                  style={{
                    background: theme.colors.white,
                    ...borderRadius('top', idx === 0 ? rem(8) : 'none'),
                    ...borderRadius(
                      'bottom',
                      idx === urls.length - 1 ? rem(8) : 'none'
                    ),
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                  src={src}
                />
              </Box>
            ))}
          {!ready && !failed && (
            <Fill>
              <Spinner />
            </Fill>
          )}
          {failed &&
            [1, 2, 3, 4].map((_, idx) => (
              <Box key={`left-${idx}`}>
                <img
                  alt="noImage"
                  height={110}
                  width={147}
                  style={{
                    background: theme.colors.white,
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                  src="https://placehold.it/147x110?text=No+data"
                />
              </Box>
            ))}
        </Flex>
        <Flex
          direction="column"
          justify="center"
          align="center"
          css={style(answer, AnswerType.Right)}
        >
          {ready &&
            !failed &&
            reorderList(urls, orders[1]).map((src, idx) => (
              <Box
                key={orders[1][idx]}
                onClick={() =>
                  dispatch({type: ANSWER, option: AnswerType.Right})
                }
              >
                <img
                  alt="currentFlip"
                  height={110}
                  width={147}
                  style={{
                    background: theme.colors.white,
                    ...borderRadius('top', idx === 0 ? rem(8) : 'none'),
                    ...borderRadius(
                      'bottom',
                      idx === urls.length - 1 ? rem(8) : 'none'
                    ),
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                  src={src}
                />
              </Box>
            ))}
          {!ready && !failed && (
            <Fill>
              <Spinner />
            </Fill>
          )}
          {failed &&
            [1, 2, 3, 4].map((_, idx) => (
              <Box key={`right-${idx}`}>
                <img
                  alt="noImage"
                  height={110}
                  width={147}
                  style={{
                    background: theme.colors.white,
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                  src="https://placehold.it/147x110?text=No+data"
                />
              </Box>
            ))}
        </Flex>
        {type === SessionType.Long && <Words hash={hash} />}
      </Flex>
      {!isLast && (!ready || hasAnswer(answer)) && (
        <Col onClick={() => dispatch({type: NEXT})} w={4}>
          <Arrow dir="next" type={type} />
        </Col>
      )}
    </Flex>
  )
}

ValidationScene.propTypes = {
  flip: PropTypes.shape({
    pics: PropTypes.arrayOf(PropTypes.object),
    ready: PropTypes.bool.isRequired,
    orders: PropTypes.arrayOf(PropTypes.array),
    answer: PropTypes.number,
  }),
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  type: PropTypes.string.isRequired,
}

// eslint-disable-next-line react/prop-types
function Words({hash}) {
  const {flips, currentIndex} = useValidationState()
  const dispatch = useValidationDispatch()

  let words = useWords(hash)

  const haveWords = words && words.length
  words = haveWords
    ? words
    : [
        {
          name: `👀👻➡️`,
          desc:
            'Trying to get flip words for you to moderate the story... Free to skip if no luck.',
        },
      ]

  const {irrelevantWords} = flips[currentIndex]

  return (
    <Flex
      align="center"
      css={{
        ...margin(0, 0, 0, rem(theme.spacings.medium24, theme.fontSizes.base)),
        width: '200px',
      }}
    >
      <Box>
        <Box
          style={{
            ...margin(0, 0, rem(29, theme.fontSizes.base)),
          }}
        >
          {words.map(({name, desc}, idx) => (
            <React.Fragment key={`name-${idx}`}>
              <Box
                style={{
                  color: theme.colors.primary2,
                  fontWeight: 500,
                  lineHeight: rem(20, theme.fontSizes.base),
                  textTransform: 'capitalize',
                }}
              >
                {name}
              </Box>
              <Box
                style={{
                  color: theme.colors.muted,
                  lineHeight: rem(20),
                  ...margin(
                    0,
                    0,
                    rem(theme.spacings.medium24, theme.fontSizes.base)
                  ),
                }}
              >
                {desc}
              </Box>
            </React.Fragment>
          ))}
        </Box>
        <Flex align="center">
          <Box>
            <Switcher
              isChecked={irrelevantWords}
              onChange={() => dispatch({type: 'IRRELEVANT_WORDS_TOGGLED'})}
              disabled={!haveWords}
              bgOn={theme.colors.danger}
            />
          </Box>
          <Label
            htmlFor="switcher"
            style={{
              color: haveWords ? theme.colors.text : theme.colors.muted,
              cursor: haveWords ? 'pointer' : 'not-allowed',
              ...margin(
                0,
                0,
                0,
                rem(theme.spacings.small12, theme.fontSizes.base)
              ),
            }}
            onClick={() => dispatch({type: 'IRRELEVANT_WORDS_TOGGLED'})}
          >
            Report irrelevant words
          </Label>
        </Flex>
      </Box>
    </Flex>
  )
}

function useWords(hash) {
  const [{result, error}] = usePoll(useRpc('flip_words', hash), 1000)

  if (error || !result) {
    return null
  }

  const {words} = result
  return words.map(i => vocabulary[i])
}

const defaultStyle = {
  borderRadius: rem(8),
  boxShadow: `0 0 1px 0 ${theme.colors.primary2}`,
  ...margin(0, rem(theme.spacings.medium24), 0),
  position: 'relative',
  ...padding(rem(4)),
  height: '100%',
  minWidth: rem(147),
  opacity: 1,
}

const answeredStyle = {
  ...defaultStyle,
  border: `solid 2px ${theme.colors.primary}`,
  boxShadow: '0 0 4px 6px rgba(87, 143, 255, 0.25)',
  opacity: 1,
}

const oppositeAnsweredStyle = {
  ...defaultStyle,
  opacity: 0.3,
}

function style(answer, target) {
  if (!answer || answer === AnswerType.None) {
    return defaultStyle
  }
  return answer === target ? answeredStyle : oppositeAnsweredStyle
}
