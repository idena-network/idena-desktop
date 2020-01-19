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
import {Box, Fill, Heading, Button, Absolute} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import Arrow from './arrow'
import {reorderList} from '../../../shared/utils/arr'
import Spinner from './spinner'
import theme, {rem} from '../../../shared/theme'
import {hasAnswer} from '../../../shared/providers/validation-context'
import {TranslateWords} from '../../../shared/components/translate-button'

export function Scene({bg: background = theme.colors.black, ...props}) {
  return (
    <Flex
      direction="column"
      css={{
        background,
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

export function Title({color = theme.colors.white, ...props}) {
  return (
    <Heading fontSize={rem(28)} fontWeight={500} color={color} {...props} />
  )
}

export function SessionTitle({current, total, color}) {
  return (
    <Title color={color}>
      Select meaningful story: left or right ({current} out of {total})
    </Title>
  )
}

export function CurrentStep(props) {
  return (
    <Flex
      justify="center"
      flex={1}
      css={{...margin(0, 0, rem(theme.spacings.medium24))}}
      {...props}
    />
  )
}

export function FlipChallenge(props) {
  return <Flex justify="center" align="center" {...props} />
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
    <FlipHolder
      css={
        // eslint-disable-next-line no-nested-ternary
        option
          ? option === variant
            ? {
                borderColor: theme.colors.primary,
                boxShadow: `0 0 2px 3px ${transparentize(
                  0.75,
                  theme.colors.primary
                )}`,
                transition: 'opacity 0.3s ease-in',
              }
            : {
                opacity: 0.3,
                transition: 'opacity 0.3s ease-out',
              }
          : null
      }
    >
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
        height: '100%',
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

export function NavButton({left, right, ...props}) {
  return (
    <Absolute top="50%" left={left} right={right}>
      <Box {...props} />
    </Absolute>
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

export function FlipWords({words = [], currentFlip}) {
  const haveWords = words.length
  const {reportWords} = currentFlip
  const hasQualified = reportWords !== null && reportWords !== undefined

  return (
    <Box
      css={{
        ...margin(0, 0, 0, rem(36, theme.fontSizes.base)),
        width: rem(280, theme.fontSizes.base),
      }}
    >
      <Heading fontSize={rem(18, theme.fontSizes.base)} fontWeight={500}>
        Are both keywords relevant to the flip?
      </Heading>
      <Box>
        <Box
          style={{
            background: theme.colors.gray,
            borderRadius: rem(8, theme.fontSizes.base),
            ...margin(rem(32, theme.fontSizes.base), 0),
            ...padding(
              rem(33, theme.fontSizes.base),
              rem(40, theme.fontSizes.base),
              rem(39, theme.fontSizes.base)
            ),
          }}
        >
          {haveWords ? (
            <Box>
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
                      lineHeight: rem(20, theme.fontSizes.base),
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
              <TranslateWords words={words} />
            </Box>
          ) : (
            <>
              <Box
                style={{
                  color: theme.colors.primary2,
                  fontWeight: 500,
                  lineHeight: rem(20, theme.fontSizes.base),
                }}
              >
                Getting flip keywords...
              </Box>
              {[
                'Can not load the flip keywords to moderate the story. Please wait or skip this flip.',
              ].map((w, idx) => (
                <Box
                  key={`desc-${idx}`}
                  style={{
                    color: theme.colors.muted,
                    lineHeight: rem(20, theme.fontSizes.base),
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
            variant={hasQualified && !reportWords ? 'primary' : 'secondary'}
            onClick={() =>
              // dispatch({type: IRRELEVANT_WORDS_TOGGLED, irrelevant: false})
              console.log('sending')
            }
            style={{fontWeight: 500, width: rem(136, theme.fontSizes.base)}}
          >
            <Flex align="center" justify="center">
              {hasQualified && !reportWords && (
                <FiCheck
                  size={16}
                  style={margin(0, rem(4, theme.fontSizes.base), 0, 0)}
                />
              )}
              <Box style={{whiteSpace: 'nowrap'}}>Both relevant</Box>
            </Flex>
          </Button>
          <Button
            style={
              hasQualified && reportWords
                ? {
                    backgroundColor: theme.colors.danger,
                    color: theme.colors.white,
                    fontWeight: 500,
                    width: rem(136, theme.fontSizes.base),
                  }
                : {
                    backgroundColor: theme.colors.danger02,
                    color: theme.colors.danger,
                    fontWeight: 500,
                    width: rem(136, theme.fontSizes.base),
                  }
            }
            onClick={
              () => console.log('report')
              // dispatch({type: IRRELEVANT_WORDS_TOGGLED, irrelevant: true})
            }
          >
            <Flex align="center" justify="center">
              {hasQualified && reportWords && (
                <FiCheck
                  size={16}
                  style={margin(0, rem(4, theme.fontSizes.base), 0, 0)}
                />
              )}
              <Box>Irrelevant</Box>
            </Flex>
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
