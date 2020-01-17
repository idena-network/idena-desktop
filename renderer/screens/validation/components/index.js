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
import {Box, Fill, Heading} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import Arrow from './arrow'
import {reorderList} from '../../../shared/utils/arr'
import Spinner from './spinner'
import theme, {rem} from '../../../shared/theme'
import {
  hasAnswer,
  SessionType,
} from '../../../shared/providers/validation-context'

export function Scene(props) {
  return (
    <Flex
      direction="column"
      css={{
        background: theme.colors.black,
        height: '100vh',
        ...padding(
          rem(theme.spacings.medium24),
          rem(theme.spacings.large),
          rem(theme.spacings.medium16)
        ),
      }}
      {...props}
    />
  )
}

export function Header(props) {
  return (
    <Flex
      justify="space-between"
      align="center"
      css={{...margin(0, 0, rem(40))}}
      {...props}
    />
  )
}

export function Title(props) {
  return (
    <Heading
      fontSize={rem(28)}
      fontWeight={500}
      color={theme.colors.white}
      {...props}
    />
  )
}

export function SessionTitle({current, total}) {
  return (
    <Title>
      Select meaningful story: left or right ({current} out of {total})
    </Title>
  )
}

export function CurrentStep(props) {
  return (
    <Flex
      justify="center"
      flex={1}
      css={{
        ...margin(0, 0, rem(theme.spacings.medium24)),
        display: 'grid',
        gridTemplate: 1 / 1,
      }}
      {...props}
    />
  )
}

export function FlipChallenge(props) {
  return <Flex justify="center" {...props} />
}

export function Flip({
  images,
  orders,
  loaded,
  failed,
  decoded,
  option,
  variant,
  onChoose,
}) {
  const ready = loaded && decoded

  if (!ready) return <LoadingFlip />
  if (failed) return <FailedFlip />

  return (
    <FlipHolder css={answeredStyle(option, variant)}>
      {reorderList(images, orders[variant - 1]).map((src, idx) => (
        <Box
          key={idx}
          css={{
            height: rem(110),
            width: rem(147),
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={onChoose}
        >
          <FlipBlur src={src} />
          <FlipImage
            src={src}
            alt="current-flip"
            style={{
              ...borderRadius('top', idx === 0 ? rem(8) : 'none'),
              ...borderRadius(
                'bottom',
                idx === images.length - 1 ? rem(8) : 'none'
              ),
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
            }}
          />
        </Box>
      ))}
    </FlipHolder>
  )
}

function FlipHolder({css, ...props}) {
  return (
    <Box
      css={{
        borderRadius: rem(8),
        border: `solid 2px ${transparentize(0.8, theme.colors.primary2)}`,
        boxShadow: `0 0 2px 0 ${transparentize(0.8, theme.colors.primary2)}`,
        ...margin(0, rem(10)),
        ...padding(rem(4)),
        position: 'relative',
        minWidth: rem(147),
        ...css,
      }}
      {...props}
    />
  )
}

function LoadingFlip() {
  return (
    <FlipHolder>
      <Fill>
        <Spinner />
      </Fill>
    </FlipHolder>
  )
}

function FailedFlip() {
  return (
    <FlipHolder>
      {[1, 2, 3, 4].map((_, idx) => (
        <Box key={`left-${idx}`}>
          <FlipImage
            src="https://placehold.it/147x110?text=No+data"
            alt={`failed-flip-${idx}`}
          />
        </Box>
      ))}
    </FlipHolder>
  )
}

function FlipBlur({src}) {
  return (
    <div
      style={{
        background: `center center / cover no-repeat url(${src})`,
        filter: 'blur(6px)',
        ...cover(),
        zIndex: 1,
      }}
    />
  )
}

function FlipImage({
  height = 110,
  width = 147,
  fit = 'contain',
  style,
  ...props
}) {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      style={{
        height: rem(height),
        width: rem(width),
        objectFit: fit,
        objectPosition: 'center',
        textAlign: 'center',
        ...style,
      }}
      {...props}
    />
  )
}

// {type === SessionType.Long &&
//   stage === SessionType.Qualification &&
//   ready &&
//   !failed && <Words key={hash} words={words} />}

export function PrevButton({type, ...props}) {
  return (
    <Box {...props}>
      <Arrow dir="prev" type={type} />
    </Box>
  )
}

// {shouldAllowNext(
//   isLast,
//   loaded,
//   SessionType.Qualification,
//   option,
//   null, // irrelevantWords,
//   null // words
// ) && (
//   <Col onClick={onNext} w={4}>
//     <Arrow dir="next" type={type} />
//   </Col>
// )}
export function NextButton({type, ...props}) {
  return (
    <Box {...props}>
      <Arrow dir="prev" type={type} />
    </Box>
  )
}

export function ActionBar(props) {
  return (
    <Flex
      justify="space-between"
      css={{
        ...margin(0, 0, rem(theme.spacings.medium16)),
      }}
      {...props}
    />
  )
}

export function ActionBarItem(props) {
  return <Flex flex={1} {...props} />
}

const thumbBorderWidth = 2
const thumbMargin = 4
const thumbWidth = 32
const totalThumbWidth = thumbBorderWidth * 2 + thumbMargin * 2 + thumbWidth

export function Thumbnails({currentIndex, ...props}) {
  return (
    <Flex
      align="center"
      css={{
        minHeight: rem(48),
        transform: `translateX(50%) translateX(-${rem(
          totalThumbWidth * (currentIndex + 1 / 2)
        )})`,
        transition: 'transform .3s ease-out',
      }}
      {...props}
    />
  )
}

export function Thumbnail({
  images,
  loaded,
  decoded,
  failed,
  option,
  isCurrent,
  onPick,
  irrelevantWords,
}) {
  const hasQualified = irrelevantWords !== null && irrelevantWords !== undefined
  const hasIrrelevantWords = hasQualified && irrelevantWords

  const ready = loaded && decoded

  return (
    <ThumbnailHolder isCurrent={isCurrent} onClick={onPick}>
      {failed && <FailedThumbnail />}
      {!ready && <LoadingThumbnail />}
      {ready && (
        <>
          {(hasAnswer(option) || hasQualified) && (
            <ThumbnailOverlay
              hasQualified={hasQualified}
              hasIrrelevantWords={hasIrrelevantWords}
              option={option}
            />
          )}
          <FlipImage
            src={images[0]}
            alt={images[0]}
            height={32}
            width={32}
            fit="cover"
            style={{
              borderRadius: rem(12),
            }}
          />
        </>
      )}
    </ThumbnailHolder>
  )
}

function ThumbnailHolder({isCurrent, children, ...props}) {
  return (
    <Flex
      justify="center"
      align="center"
      css={{
        border: `solid ${rem(thumbBorderWidth)} ${
          isCurrent ? theme.colors.primary : 'transparent'
        }`,
        borderRadius: rem(12),
      }}
      {...props}
    >
      <Box
        css={{
          height: rem(thumbWidth),
          width: rem(thumbWidth),
          margin: rem(thumbMargin),
          ...position('relative'),
        }}
      >
        {children}
      </Box>
    </Flex>
  )
}

function LoadingThumbnail() {
  return <Spinner size={24} />
}

function FailedThumbnail() {
  return (
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
  )
}

function ThumbnailOverlay({option, isQualifed, hasIrrelevantWords}) {
  return (
    <Fill
      bg={
        // eslint-disable-next-line no-nested-ternary
        isQualifed
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
      {option && <FiCheck size={rem(20)} color={theme.colors.white} />}
    </Fill>
  )
}

function answeredStyle(answer, target) {
  if (!answer) return null
  return answer === target
    ? {
        borderColor: theme.colors.primary,
        boxShadow: `0 0 2px 3px ${transparentize(0.75, theme.colors.primary)}`,
        transition: 'opacity 0.3s ease-in',
      }
    : {
        opacity: 0.3,
        transition: 'opacity 0.3s ease-out',
      }
}
