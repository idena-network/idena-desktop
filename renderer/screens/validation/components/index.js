/* eslint-disable react/prop-types */
import React from 'react'
import {
  margin,
  padding,
  borderRadius,
  cover,
  position,
  transparentize,
  rgba,
} from 'polished'
import {FiCheck, FiXCircle} from 'react-icons/fi'
import {Col, Box, Fill, Button} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import Arrow from './arrow'
import {reorderList} from '../../../shared/utils/arr'
import Spinner from './spinner'
import theme, {rem} from '../../../shared/theme'
import {
  AnswerType,
  hasAnswer,
  SessionType,
} from '../../../shared/providers/validation-context'

export function ValidationScene({
  flip: {images, option, orders, loaded, failed},
  isFirst,
  isLast,
  type,
  onAnswer,
  onNext,
  onPrev,
}) {
  const leftImages = reorderList(images, orders[0])
  const rightImages = reorderList(images, orders[1])
  return (
    <Flex
      // justify="space-between"
      // flex={1}
      css={{
        ...margin(0, rem(theme.spacings.medium24), 0),
      }}
    >
      <Box onClick={onPrev} hidden={isFirst}>
        <Arrow dir="prev" type={type} />
      </Box>
      <Flex align="center">
        <Flex
          direction="column"
          justify="center"
          align="center"
          css={style(option, AnswerType.Left)}
        >
          {loaded &&
            leftImages.map((src, idx) => (
              <Box
                key={orders[0][idx]}
                css={{
                  height: rem(110),
                  width: rem(147),
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => onAnswer(AnswerType.Left)}
              >
                {/* eslint-disable-next-line no-use-before-define */}
                <div style={blurStyle(src)} />
                <img
                  src={src}
                  alt="currentFlip"
                  height={110}
                  width={147}
                  style={{
                    ...borderRadius(
                      'top',
                      idx === 0 ? rem(8, theme.fontSizes.base) : 'none'
                    ),
                    ...borderRadius(
                      'bottom',
                      idx === images.length - 1
                        ? rem(8, theme.fontSizes.base)
                        : 'none'
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
                />
              </Box>
            ))}
          {!loaded && (
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
          css={style(option, AnswerType.Right)}
        >
          {loaded &&
            rightImages.map((src, idx) => (
              <Box
                key={orders[1][idx]}
                css={{
                  height: rem(110, theme.fontSizes.base),
                  width: rem(147, theme.fontSizes.base),
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => onAnswer(AnswerType.Right)}
              >
                {/* eslint-disable-next-line no-use-before-define */}
                <div style={blurStyle(src)} />
                <img
                  alt="currentFlip"
                  style={{
                    ...borderRadius(
                      'top',
                      idx === 0 ? rem(8, theme.fontSizes.base) : 'none'
                    ),
                    ...borderRadius(
                      'bottom',
                      idx === images.length - 1
                        ? rem(8, theme.fontSizes.base)
                        : 'none'
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
          {!loaded && (
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
        {/* {type === SessionType.Long &&
          stage === SessionType.Qualification &&
          ready &&
          !failed && <Words key={hash} words={words} />} */}
      </Flex>
      {(true ||
        shouldAllowNext(
          isLast,
          loaded,
          SessionType.Qualification,
          option,
          null, // irrelevantWords,
          null // words
        )) && (
        <Col onClick={onNext} w={4}>
          <Arrow dir="next" type={type} />
        </Col>
      )}
    </Flex>
  )
}

function shouldAllowNext(isLast, ready, stage, answer, irrelevantWords, words) {
  if (isLast) {
    return false
  }

  if (!ready) {
    return true
  }

  if (stage === SessionType.Qualification) {
    return !words || (irrelevantWords !== null && irrelevantWords !== undefined)
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

export function ValidationActions({onSubmitAnswers, canSubmit, countdown}) {
  return (
    <Flex
      justify="space-between"
      css={{
        ...margin(rem(29), 0, theme.spacings.medium16),
      }}
    >
      <Flex justify="flex-start" css={{flex: 1}}>
        &nbsp;
      </Flex>
      <Flex justify="center" css={{width: '33%'}}>
        {countdown}
      </Flex>
      <Flex justify="flex-end" css={{flex: 1}}>
        <Button onClick={onSubmitAnswers} disabled={!canSubmit}>
          Submit answers
        </Button>
      </Flex>
    </Flex>
  )
}

const thumbBorderWidth = 2
const thumbMargin = 4
const thumbWidth = 32
const totalThumbWidth = thumbBorderWidth * 2 + thumbMargin * 2 + thumbWidth

const activeThumbStyle = {
  border: `solid ${rem(thumbBorderWidth)} ${theme.colors.primary}`,
}

const thumbStyle = {
  border: `solid ${rem(thumbBorderWidth)} transparent`,
  borderRadius: rem(12),
}

export function FlipThumbnails({flips, currentIndex, onPick}) {
  return (
    <Flex
      align="center"
      css={{
        minHeight: rem(48),
        marginLeft: `calc(50% - ${rem(
          totalThumbWidth * (currentIndex + 1 / 2)
        )})`,
      }}
    >
      {flips.map(
        (flip, idx) =>
          !flip.extra && (
            <Thumb
              key={flip.hash}
              {...flip}
              isCurrent={currentIndex === idx}
              onPick={() => onPick(idx)}
            />
          )
      )}
    </Flex>
  )
}

function Thumb({
  hash,
  images,
  option,
  loaded,
  failed,
  isCurrent,
  onPick,
  irrelevantWords,
}) {
  const hasQualified = irrelevantWords !== null && irrelevantWords !== undefined
  const hasIrrelevantWords = hasQualified && irrelevantWords
  return (
    <Flex
      key={hash}
      justify="center"
      align="center"
      css={isCurrent ? {...thumbStyle, ...activeThumbStyle} : thumbStyle}
      onClick={onPick}
    >
      <Box
        css={{
          height: rem(thumbWidth),
          width: rem(thumbWidth),
          margin: rem(margin),
          ...position('relative'),
        }}
      >
        {(hasAnswer(option) || hasQualified) && (
          <Fill
            bg={
              // eslint-disable-next-line no-nested-ternary
              hasQualified
                ? hasIrrelevantWords
                  ? transparentize(0.1, theme.colors.danger)
                  : rgba(87, 143, 255, 0.9)
                : rgba(89, 89, 89, 0.95)
            }
            css={{
              borderRadius: rem(12),
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {hasAnswer(option) && (
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
        {loaded ? (
          <img
            src={images[0]}
            alt={images[0]}
            style={{
              height: rem(32),
              width: rem(32),
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
