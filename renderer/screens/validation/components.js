/* eslint-disable react/prop-types */
import React, {useMemo} from 'react'
import {
  margin,
  padding,
  borderRadius,
  cover,
  position,
  transparentize,
  rgba,
} from 'polished'
import {
  FiCheck,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiImage,
} from 'react-icons/fi'
import {useMachine} from '@xstate/react'
import {
  Box,
  Fill,
  Heading,
  Button,
  Absolute,
  Modal,
  SubHeading,
  Text,
} from '../../shared/components'
import Flex from '../../shared/components/flex'
import {reorderList} from '../../shared/utils/arr'
import Spinner from './components/spinner'
import theme, {rem} from '../../shared/theme'
import {TranslateWords} from '../../shared/components/translate-button'
import {RelevanceType, createTimerMachine, adjustDuration} from './machine'

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
        overflow: 'hidden',
        maxWidth: '100%',
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
      css={{...margin(0, 0, rem(32))}}
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
  return <Flex justify="center" align="center" css={{zIndex: 1}} {...props} />
}

export function Flip({
  hash,
  images,
  orders,
  fetched,
  failed,
  decoded,
  option,
  variant,
  onChoose,
  onImageFail,
}) {
  if ((fetched && !decoded) || failed) return <FailedFlip />
  if (!fetched) return <LoadingFlip />

  return (
    <FlipHolder
      css={
        // eslint-disable-next-line no-nested-ternary
        option
          ? option === variant
            ? {
                border: `solid ${rem(2)} ${theme.colors.primary}`,
                boxShadow: `0 0 ${rem(2)} ${rem(3)} ${transparentize(
                  0.75,
                  theme.colors.primary
                )}`,
                transition: 'all .3s cubic-bezier(.5, 0, .5, 1)',
              }
            : {
                opacity: 0.3,
                transform: 'scale(0.97)',
                transition: 'all .3s cubic-bezier(.5, 0, .5, 1)',
              }
          : {}
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
          onClick={() => onChoose(hash)}
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
            onError={onImageFail}
          />
        </Box>
      ))}
    </FlipHolder>
  )
}

function FlipHolder({css, ...props}) {
  return (
    <Flex
      justify="center"
      direction="column"
      css={{
        borderRadius: rem(8),
        border: `solid ${rem(2)} ${transparentize(
          0.95,
          theme.colors.primary2
        )}`,
        boxShadow: `0 0 ${rem(2)} 0 ${transparentize(
          0.95,
          theme.colors.primary2
        )}`,
        ...margin(0, rem(10)),
        ...padding(rem(4)),
        position: 'relative',
        minWidth: rem(147),
        minHeight: '100%',
        transitionProperty: 'opacity, transform',
        willChange: 'opacity, transform',
        ...css,
      }}
      {...props}
    />
  )
}

function LoadingFlip() {
  return (
    <FlipHolder css={{cursor: 'not-allowed'}}>
      <Fill>
        <Spinner />
      </Fill>
    </FlipHolder>
  )
}

const defaultOrder = [1, 2, 3, 4]
function FailedFlip() {
  return (
    <FlipHolder
      css={{
        cursor: 'not-allowed',
      }}
    >
      {defaultOrder.map((_, idx) => (
        <Flex
          key={`left-${idx}`}
          justify="center"
          align="center"
          css={{
            background: theme.colors.gray5,
            borderBottom:
              idx === defaultOrder.length - 1
                ? 'none'
                : 'solid 1px rgba(210, 212, 217, 0.16)',
            ...borderRadius('top', idx === 0 ? rem(8) : 'none'),
            ...borderRadius(
              'bottom',
              idx === defaultOrder.length - 1 ? rem(8) : 'none'
            ),
            height: rem(110),
            width: rem(147),
            overflow: 'hidden',
          }}
        >
          <FiImage size={rem(40)} color={theme.colors.white} opacity={0.3} />
        </Flex>
      ))}
    </FlipHolder>
  )
}

function FlipBlur({src}) {
  return (
    <div
      style={{
        background: `center center / cover no-repeat url(${src})`,
        filter: `blur(${rem(6)})`,
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
  return <Flex flex={1} css={{minHeight: rem(32), zIndex: 1}} {...props} />
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
        willChange: 'transform',
        zIndex: 1,
      }}
      {...props}
    />
  )
}

export function Thumbnail({
  images,
  fetched,
  decoded,
  failed,
  option,
  relevance,
  isCurrent,
  onPick,
}) {
  const isQualified = !!relevance
  const hasIrrelevantWords = relevance === RelevanceType.Irrelevant

  return (
    <ThumbnailHolder
      isCurrent={isCurrent}
      css={{
        border: `solid ${rem(thumbBorderWidth)} ${
          // eslint-disable-next-line no-nested-ternary
          isCurrent
            ? // eslint-disable-next-line no-nested-ternary
              isQualified
              ? hasIrrelevantWords
                ? theme.colors.danger
                : rgba(87, 143, 255, 0.9)
              : theme.colors.primary
            : 'transparent'
        }`,
      }}
      onClick={onPick}
    >
      {((fetched && !decoded) || failed) && <FailedThumbnail />}
      {!fetched && !failed && <LoadingThumbnail />}
      {fetched && decoded && (
        <>
          {(option || isQualified) && (
            <ThumbnailOverlay
              option={option}
              isQualified={isQualified}
              hasIrrelevantWords={hasIrrelevantWords}
            />
          )}
          <FlipImage
            src={images[0]}
            alt={images[0]}
            height={32}
            width={32}
            fit="cover"
            style={{borderRadius: rem(12)}}
          />
        </>
      )}
    </ThumbnailHolder>
  )
}

function ThumbnailHolder({isCurrent, css, children, ...props}) {
  return (
    <Flex
      justify="center"
      align="center"
      css={{
        border: `solid ${rem(thumbBorderWidth)} ${
          isCurrent ? theme.colors.primary : 'transparent'
        }`,
        borderRadius: rem(12),
        ...css,
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

function ThumbnailOverlay({option, isQualified, hasIrrelevantWords}) {
  return (
    <Fill
      bg={
        // eslint-disable-next-line no-nested-ternary
        isQualified
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

export function FlipWords({currentFlip: {words = []}, children}) {
  return (
    <Box
      css={{
        ...margin(0, 0, 0, rem(36)),
        width: rem(280),
      }}
    >
      <Heading fontSize={rem(18)} fontWeight={500}>
        Are both keywords relevant to the flip?
      </Heading>
      <Box>
        <Box
          style={{
            background: theme.colors.gray,
            borderRadius: rem(8),
            ...margin(rem(32), 0),
            ...padding(rem(33), rem(40), rem(39)),
          }}
        >
          {words.length ? (
            <Box>
              {words.map(({name, desc}, idx) => (
                <React.Fragment key={`name-${idx}`}>
                  <Box
                    style={{
                      color: theme.colors.primary2,
                      fontWeight: 500,
                      lineHeight: rem(20),
                      textTransform: 'capitalize',
                    }}
                  >
                    {name}
                  </Box>
                  <Box
                    style={{
                      color: theme.colors.muted,
                      lineHeight: rem(20),
                      ...margin(0, 0, rem(theme.spacings.medium24)),
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
                  lineHeight: rem(20),
                }}
              >
                Getting flip keywords...
              </Box>
              {[
                'Can not load the flip keywords to moderate the story. Please wait or skip this flip.',
              ].map((word, idx) => (
                <Box
                  key={`desc-${idx}`}
                  style={{
                    color: theme.colors.muted,
                    lineHeight: rem(20),
                    ...margin(rem(theme.spacings.small8), 0, 0),
                  }}
                >
                  {word}
                </Box>
              ))}
            </>
          )}
        </Box>
        {children}
      </Box>
    </Box>
  )
}

export function QualificationActions(props) {
  return <Flex align="center" justify="space-between" {...props} />
}

export function QualificationButton({
  flip: {hash, relevance},
  variant,
  children,
  onVote,
  ...props
}) {
  const buttonVariant =
    // eslint-disable-next-line no-nested-ternary
    variant === RelevanceType.Relevant
      ? relevance === variant
        ? 'primary'
        : 'secondary'
      : null
  const style =
    // eslint-disable-next-line no-nested-ternary
    variant === RelevanceType.Irrelevant
      ? relevance === variant
        ? {
            backgroundColor: theme.colors.danger,
            color: theme.colors.white,
          }
        : {
            backgroundColor: theme.colors.danger02,
            color: theme.colors.danger,
          }
      : null
  return (
    <Button
      variant={buttonVariant}
      style={{
        fontWeight: 500,
        width: rem(136),
        minWidth: rem(136),
        transition: 'none',
        whiteSpace: 'nowrap',
        zIndex: 1,
        ...style,
      }}
      onClick={() => onVote(hash)}
      {...props}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        {children}
      </span>
    </Button>
  )
}

export function WelcomeQualificationDialog({isOpen, onSubmit}) {
  return (
    <Modal show={isOpen} showCloseIcon={false}>
      <Box css={{...margin(0, 0, rem(18))}}>
        <SubHeading>Welcome to qualification session</SubHeading>
        <Text css={{...margin(0, 0, rem(10))}}>
          Your answers for the validation session have been submitted
          successfully!
        </Text>
        <Text>
          Now solve bunch of flips to check its quality. The flip is qualified
          if the majority, equals more than 2/3 participants, gives the same
          answer.
        </Text>
      </Box>
      <Flex align="center" justify="flex-end">
        <Button onClick={onSubmit}>Okay, let’s start</Button>
      </Flex>
    </Modal>
  )
}

export function NavButton({type, bg, color, ...props}) {
  const isPrev = type === 'prev'
  const Icon = isPrev ? FiChevronLeft : FiChevronRight
  return (
    <Absolute
      top="50%"
      left={isPrev && 0}
      right={isPrev || 0}
      width={rem(280)}
      zIndex={0}
      css={{
        transform: 'translate(0, -50%)',
        overflow: 'hidden',
        height: rem(600),
      }}
      {...props}
    >
      <div>
        <Icon
          fontSize={rem(20)}
          color={color}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translateX(${
              isPrev ? rem(80) : rem(-80)
            })`,
          }}
        />
        <style jsx>{`
          div {
            border-radius: 50%;
            cursor: pointer;
            height: 100%;
            width: ${rem(560)};
            position: relative;
            transform: translateX(${isPrev ? '-50%' : ''});
            transition: all 0.5s ease-out;
            transition-property: background;
            will-change: background;
          }
          div:hover {
            background: ${bg};
          }
        `}</style>
      </div>
    </Absolute>
  )
}

export function WelcomeKeywordsQualificationDialog({isOpen, onSubmit}) {
  return (
    <Modal show={isOpen} showCloseIcon={false}>
      <Box css={{...margin(0, 0, rem(18))}}>
        <SubHeading css={margin(0, 0, rem(10))}>
          Your answers are not yet submitted
        </SubHeading>
        <Text css={margin(0, 0, rem(10))}>
          Please qualify the keywords relevance and submit the answers.
        </Text>
        <Text>The flips with irrelevant keywords will be penalized.</Text>
      </Box>
      <Flex align="center" justify="flex-end">
        <Box px="4px">
          <Button onClick={onSubmit}>Ok, I understand</Button>
        </Box>
      </Flex>
    </Modal>
  )
}

export function ValidationTimer({validationStart, duration}) {
  const adjustedDuration = useMemo(
    () => adjustDuration(validationStart, duration),
    [duration, validationStart]
  )

  return (
    <Timer>
      <TimerIcon color={theme.colors.danger} />
      <TimerClock duration={adjustedDuration} color={theme.colors.danger} />
    </Timer>
  )
}

export function Timer(props) {
  return <Flex align="center" {...props} />
}

export function TimerIcon({color}) {
  return (
    <FiClock
      size={rem(20)}
      color={color}
      style={{marginRight: rem(theme.spacings.small8)}}
      width={rem(20)}
    />
  )
}

export function TimerClock({duration, color}) {
  const [state, send] = useMachine(
    useMemo(() => createTimerMachine(duration), [duration])
  )

  React.useEffect(() => {
    send('DURATION_UPDATE', {duration})
  }, [duration, send])

  const {elapsed} = state.context
  const remaining = duration - elapsed

  return (
    <Box w={rem(37)} style={{fontVariantNumeric: 'tabular-nums'}}>
      <Text color={color} fontWeight={600}>
        {state.matches('stopped') && '00:00'}
        {state.matches('running') &&
          [Math.floor(remaining / 60), remaining % 60]
            .map(t => t.toString().padStart(2, 0))
            .join(':')}
      </Text>
    </Box>
  )
}

export function SubmitFailedDialog({isOpen, onSubmit}) {
  return (
    <Modal show={isOpen} showCloseIcon={false}>
      <Box css={{...margin(0, 0, rem(18))}}>
        <SubHeading css={margin(0, 0, rem(10))}>Submit failed</SubHeading>
        <Text css={margin(0, 0, rem(10))}>
          An error occured while submitting your answers.
        </Text>
      </Box>
      <Flex align="center" justify="flex-end">
        <Box px="4px">
          <Button onClick={onSubmit}>Retry</Button>
        </Box>
      </Flex>
    </Modal>
  )
}

export function ValidationSucceededDialog({isOpen, onSubmit}) {
  return (
    <Modal show={isOpen} showCloseIcon={false}>
      <Box css={{...margin(0, 0, rem(24))}}>
        <SubHeading css={margin(0, 0, rem(10))}>
          Wait for validation results
        </SubHeading>
        <Text css={margin(0, 0, rem(10))}>
          Your answers for the qualification session have been submited
          successfully!
        </Text>
        <Text>
          Please wait for the validation results. It will take some time for
          network to reach consensus about the list of validated accounts. You
          can find the validation end time on the left panel.
        </Text>
      </Box>
      <Flex align="center" justify="flex-end">
        <Box px="4px">
          <Button onClick={onSubmit}>Go to My Idena</Button>
        </Box>
      </Flex>
    </Modal>
  )
}

export function ValidationFailedDialog({isOpen, onSubmit}) {
  return (
    <Modal show={isOpen} showCloseIcon={false}>
      <Box css={{...margin(0, 0, rem(18))}}>
        <SubHeading css={margin(0, 0, rem(10))}>Validation failed</SubHeading>
        <Text css={margin(0, 0, rem(10))}>
          Sorry your answers won’t be submitted since the validation session is
          over.
        </Text>
        <Text>Come back soon!</Text>
      </Box>
      <Flex align="center" justify="flex-end">
        <Box px="4px">
          <Button onClick={onSubmit}>Go to My Idena</Button>
        </Box>
      </Flex>
    </Modal>
  )
}
