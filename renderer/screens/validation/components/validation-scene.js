import React from 'react'
import PropTypes from 'prop-types'
import {rem, margin, padding, borderRadius, cover} from 'polished'
import {FiCheck} from 'react-icons/fi'
import {Col, Box, Fill, Button, Heading} from '../../../shared/components'
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
  IRRELEVANT_WORDS_TOGGLED,
} from '../../../shared/providers/validation-context'

export default function ValidationScene({
  flip: {urls, answer, ready, orders, failed, hash, words, irrelevantWords},
  isFirst,
  isLast,
  type,
}) {
  const {stage} = useValidationState()
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
      <Flex align="center">
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
                css={{
                  height: rem(110, theme.fontSizes.base),
                  width: rem(147, theme.fontSizes.base),
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() =>
                  dispatch({type: ANSWER, option: AnswerType.Left})
                }
              >
                {/* eslint-disable-next-line no-use-before-define */}
                <div style={blurStyle(src)} />
                <img
                  alt="currentFlip"
                  height={110}
                  width={147}
                  style={{
                    ...borderRadius('top', idx === 0 ? rem(8) : 'none'),
                    ...borderRadius(
                      'bottom',
                      idx === urls.length - 1 ? rem(8) : 'none'
                    ),
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    textAlign: 'center',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    height: rem(110, theme.fontSizes.base),
                    width: rem(147, theme.fontSizes.base),
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
                css={{
                  height: rem(110, theme.fontSizes.base),
                  width: rem(147, theme.fontSizes.base),
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() =>
                  dispatch({type: ANSWER, option: AnswerType.Right})
                }
              >
                {/* eslint-disable-next-line no-use-before-define */}
                <div style={blurStyle(src)} />
                <img
                  alt="currentFlip"
                  style={{
                    ...borderRadius('top', idx === 0 ? rem(8) : 'none'),
                    ...borderRadius(
                      'bottom',
                      idx === urls.length - 1 ? rem(8) : 'none'
                    ),
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    textAlign: 'center',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    height: rem(110, theme.fontSizes.base),
                    width: rem(147, theme.fontSizes.base),
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
        {type === SessionType.Long &&
          stage === SessionType.Qualification &&
          ready &&
          !failed && <Words key={hash} words={words} />}
      </Flex>
      {shouldAllowNext(isLast, ready, stage, answer, irrelevantWords) && (
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
function Words({words}) {
  const {flips, currentIndex} = useValidationState()
  const dispatch = useValidationDispatch()

  const haveWords = words && words.length
  const {irrelevantWords} = flips[currentIndex]
  const hasQualified = irrelevantWords !== null && irrelevantWords !== undefined

  return (
    <Box
      css={{
        ...margin(0, 0, 0, rem(36, theme.fontSizes.base)),
        width: rem(280),
      }}
    >
      <Heading fontSize={rem(20)} fontWeight={500}>
        Are both keywords relevant to the flip?
      </Heading>
      <Box>
        <Box
          style={{
            background: theme.colors.gray,
            borderRadius: rem(8),
            ...margin(rem(32, theme.fontSizes.base), 0),
            ...padding(
              rem(33, theme.fontSizes.base),
              rem(40, theme.fontSizes.base),
              rem(39, theme.fontSizes.base)
            ),
          }}
        >
          {haveWords ? (
            words.map(({name, desc}, idx) => (
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
            ))
          ) : (
            <>
              <Box
                style={{
                  color: theme.colors.primary2,
                  fontWeight: 500,
                  lineHeight: rem(20, theme.fontSizes.base),
                }}
              >
                Getting keywords...
              </Box>
              {[
                'Loading keywords to moderate the story 📬🏗🔤',
                'Feel free to skip this step.',
              ].map((w, idx) => (
                <Box
                  key={`desc-${idx}`}
                  style={{
                    color: theme.colors.muted,
                    lineHeight: rem(20),
                    ...margin(
                      rem(theme.spacings.small8, theme.fontSizes.base),
                      0,
                      0
                    ),
                  }}
                >
                  {w}
                </Box>
              ))}
            </>
          )}
        </Box>
        <Flex align="center" justify="space-between">
          <Button
            variant={hasQualified && !irrelevantWords ? 'primary' : 'secondary'}
            onClick={() =>
              dispatch({type: IRRELEVANT_WORDS_TOGGLED, irrelevant: false})
            }
          >
            <Flex align="center">
              {hasQualified && !irrelevantWords && (
                <Box style={padding(0, rem(4))}>
                  <FiCheck />
                </Box>
              )}
              <Box style={{whiteSpace: 'nowrap'}}>Both relevant</Box>
            </Flex>
          </Button>
          <Button
            style={
              hasQualified && irrelevantWords
                ? {
                    backgroundColor: theme.colors.danger,
                    color: theme.colors.white,
                  }
                : {
                    backgroundColor: theme.colors.danger02,
                    color: theme.colors.danger,
                  }
            }
            onClick={() =>
              dispatch({type: IRRELEVANT_WORDS_TOGGLED, irrelevant: true})
            }
          >
            <Flex align="center">
              {hasQualified && irrelevantWords && (
                <Box style={padding(0, rem(4))}>
                  <FiCheck />
                </Box>
              )}
              <Box>Irrelevant</Box>
            </Flex>
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

function shouldAllowNext(isLast, ready, stage, answer, irrelevantWords) {
  if (isLast) {
    return false
  }

  if (!ready) {
    return true
  }

  if (stage === SessionType.Qualification) {
    return irrelevantWords !== null && irrelevantWords !== undefined
  }

  return hasAnswer(answer)
}

const defaultStyle = {
  borderRadius: rem(8, theme.fontSizes.base),
  boxShadow: `0 0 1px 0 ${theme.colors.primary2}`,
  ...margin(0, rem(theme.spacings.medium24, theme.fontSizes.base), 0),
  minWidth: rem(147, theme.fontSizes.base),
  position: 'relative',
  ...padding(rem(4, theme.fontSizes.base)),
  height: '100%',
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

const blurStyle = src => ({
  background: `center center / cover no-repeat url(${src})`,
  filter: 'blur(6px)',
  ...cover(),
  zIndex: 1,
})

function style(answer, target) {
  if (!answer || answer === AnswerType.None) {
    return defaultStyle
  }
  return answer === target ? answeredStyle : oppositeAnsweredStyle
}
