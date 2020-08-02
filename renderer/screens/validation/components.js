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
} from 'react-icons/fi'
import {
  Box as ChakraBox,
  Flex as ChakraFlex,
  Stack,
  Text,
  Heading,
  useColorMode,
} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {useRouter} from 'next/router'
import {State} from 'xstate'
import {Box, Fill, Button, Absolute} from '../../shared/components'
import Flex from '../../shared/components/flex'
import {reorderList} from '../../shared/utils/arr'
import theme, {rem} from '../../shared/theme'
import {RelevanceType, adjustDuration} from './machine'
import {loadValidationState} from './utils'
import {Notification, Snackbar} from '../../shared/components/notifications'
import {NotificationType} from '../../shared/providers/notification-context'
import {EpochPeriod} from '../../shared/types'
import {useTimingState} from '../../shared/providers/timing-context'
import {createTimerMachine} from '../../shared/machines'
import {
  FlipKeywordPanel,
  FlipKeywordTranslationSwitch,
} from '../flips/components'
import {
  Dialog,
  DialogBody,
  DialogFooter,
} from '../../shared/components/components'
import {PrimaryButton} from '../../shared/components/button'

export function ValidationScene(props) {
  return (
    <ChakraFlex
      direction="column"
      h="100vh"
      maxW="full"
      pt={6}
      pb={3}
      pl={10}
      pr={6}
      overflow="hidden"
      {...props}
    />
  )
}

export function Header(props) {
  return (
    <ChakraFlex
      justify="space-between"
      align="center"
      mb={rem(55)}
      {...props}
    />
  )
}

export function Title(props) {
  return (
    <Heading
      fontSize={rem(24)}
      lineHeight="short"
      fontWeight={500}
      {...props}
    />
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
                transform: 'scale(0.98)',
                transition: 'all .3s cubic-bezier(.5, 0, .5, 1)',
                transitionProperty: 'opacity, transform',
                willChange: 'opacity, transform',
              }
          : {}
      }
    >
      {reorderList(images, orders[variant - 1]).map((src, idx) => (
        <Box
          key={idx}
          css={{
            height: 'calc((100vh - 260px) / 4)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={() => onChoose(hash)}
        >
          <FlipBlur src={src} />
          <FlipImage
            src={src}
            alt="current-flip"
            height="100%"
            width="100%"
            style={{
              ...borderRadius('top', idx === 0 ? rem(8) : 'none'),
              ...borderRadius(
                'bottom',
                idx === images.length - 1 ? rem(8) : 'none'
              ),
              position: 'relative',
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
        transitionProperty: 'opacity, transform',
        willChange: 'opacity, transform',
        height: 'calc(100vh - 260px)',
        width: 'calc((100vh - 240px) / 3)',
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
        <ValidationSpinner />
      </Fill>
    </FlipHolder>
  )
}

const defaultOrder = [1, 2, 3, 4]

function FailedFlip() {
  const {t} = useTranslation()
  return (
    <FlipHolder
      css={{
        border: 'none',
        boxShadow: 'none',
        cursor: 'not-allowed',
      }}
    >
      {defaultOrder.map((_, idx) => (
        <Flex
          key={`left-${idx}`}
          justify="center"
          align="center"
          css={{
            background: transparentize(0.16, theme.colors.gray5),
            border: 'solid 1px rgba(210, 212, 217, 0.16)',
            borderBottom:
              idx !== defaultOrder.length - 1
                ? 'none'
                : 'solid 1px rgba(210, 212, 217, 0.16)',
            ...borderRadius('top', idx === 0 ? rem(8) : 'none'),
            ...borderRadius(
              'bottom',
              idx === defaultOrder.length - 1 ? rem(8) : 'none'
            ),
            height: 'calc((100vh - 260px) / 4)',
            overflow: 'hidden',
          }}
        >
          <img
            alt={t('Failed flip')}
            src="/static/body-medium-pic-icn.svg"
            style={{
              height: rem(40),
              width: rem(40),
              opacity: 0.3,
            }}
          />
        </Flex>
      ))}
    </FlipHolder>
  )
}

export function FailedFlipAnnotation(props) {
  return (
    <Box
      style={{
        background: transparentize(0.17, theme.colors.black),
        ...padding(rem(16), rem(42)),
        color: theme.colors.white,
        fontSize: rem(13),
        fontWeight: 500,
        textAlign: 'center',
        position: 'absolute',
        top: '50%',
        left: rem(14),
        right: rem(14),
        transform: 'translateY(-50%)',
        zIndex: 2,
      }}
      {...props}
    ></Box>
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
  const normalize = value =>
    value.toString().endsWith('%') ? value : rem(height)
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      style={{
        height: normalize(height),
        width: normalize(width),
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
  return <ValidationSpinner size={24} />
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

export function FlipWords({
  currentFlip: {words = []},
  translations = {},
  children,
}) {
  const {t, i18n} = useTranslation()

  const wordTranslations = words.map(({id}) => translations[id])
  const hasApprovedTranslation = wordTranslations.reduce(
    (acc, curr) => !!curr && acc,
    true
  )

  const [showTranslation, setShowTranslation] = React.useState()

  const shouldShowTranslation = showTranslation && hasApprovedTranslation

  return (
    <ChakraBox fontSize="md" color="brandGray.500" ml={rem(32)} w={rem(320)}>
      <FlipKeywordPanel w={rem(320)} mb={5}>
        <Heading
          fontSize={rem(16)}
          fontWeight={500}
          style={{...margin(0, 0, rem(24))}}
        >
          {t(`Are both keywords relevant to the flip?`)}
        </Heading>
        {words.length ? (
          <FlipKeywordTranslationSwitch
            keywords={{
              words,
              translations: wordTranslations.map(x => (x ? [x] : [])),
            }}
            showTranslation={shouldShowTranslation}
            locale={i18n.language}
            onSwitchLocale={() => setShowTranslation(!showTranslation)}
            isInline={false}
          />
        ) : (
          <>
            <Box
              style={{
                color: theme.colors.primary2,
                fontWeight: 500,
                lineHeight: rem(20),
              }}
            >
              {t(`Getting flip keywords...`)}
            </Box>
            {[
              t(
                'Can not load the flip keywords to moderate the story. Please wait or skip this flip.'
              ),
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
      </FlipKeywordPanel>
      {children}
    </ChakraBox>
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
        minWidth: rem(156),
        minHeight: rem(32),
        transition: 'none',
        whiteSpace: 'nowrap',
        zIndex: 1,
        ...style,
      }}
      onClick={() => onVote(hash)}
      {...props}
    >
      <Stack isInline spacing={2} align="center" justify="center">
        {React.Children.map(children, child => (
          <ChakraBox>{child}</ChakraBox>
        ))}
      </Stack>
    </Button>
  )
}

export function WelcomeQualificationDialog(props) {
  const {t} = useTranslation()
  return (
    <ValidationDialog
      title={t('Welcome to qualification session')}
      submitText={t('Okay, let’s start')}
      {...props}
    >
      <ValidationDialogBody>
        <Text>
          {t(
            `Your answers for the validation session have been submitted successfully!`
          )}
        </Text>
        <Text>
          {t(`Now solve bunch of flips to check its quality. The flip is qualified
            if the majority, equals more than 2/3 participants, gives the same
            answer.`)}
        </Text>
      </ValidationDialogBody>
    </ValidationDialog>
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

export function WelcomeKeywordsQualificationDialog(props) {
  const {t} = useTranslation()
  return (
    <ValidationDialog
      title={t('Your answers are not yet submitted')}
      submitText={t('Ok, I understand')}
      {...props}
    >
      <ValidationDialogBody>
        <Text>
          {t('Please qualify the keywords relevance and submit the answers.')}
        </Text>
        <Text>
          {t('The flips with irrelevant keywords will be penalized.')}
        </Text>
      </ValidationDialogBody>
    </ValidationDialog>
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
    <Box style={{fontVariantNumeric: 'tabular-nums', minWidth: rem(37)}}>
      <Text color={color} fontSize={rem(13)} fontWeight={500}>
        {state.matches('stopped') && '00:00'}
        {state.matches('running') &&
          [Math.floor(remaining / 60), remaining % 60]
            .map(t => t.toString().padStart(2, 0))
            .join(':')}
      </Text>
    </Box>
  )
}

export function SubmitFailedDialog(props) {
  const {t} = useTranslation()
  return (
    <ValidationDialog
      title={t('Submit failed')}
      submitText={t('Retry')}
      {...props}
    >
      <DialogBody>
        <Text>{t('An error occured while submitting your answers.')}</Text>
      </DialogBody>
    </ValidationDialog>
  )
}

export function ValidationSucceededDialog(props) {
  const {t} = useTranslation()
  return (
    <ValidationDialog
      title={t('Wait for validation results')}
      submitText={t('Go to My Idena')}
      {...props}
    >
      <ValidationDialogBody>
        <Text>
          {t(`Your answers for the qualification session have been submited
          successfully!`)}
        </Text>
        <Text>
          {t(`Please wait for the validation results. It will take some time for
          network to reach consensus about the list of validated accounts. You
          can find the validation end time on the left panel.`)}
        </Text>
      </ValidationDialogBody>
    </ValidationDialog>
  )
}

export function ValidationFailedDialog(props) {
  const {t} = useTranslation()
  return (
    <ValidationDialog
      title={t('Validation failed')}
      submitText={t('Go to My Idena')}
      {...props}
    >
      <ValidationDialogBody>
        <Text>
          {t(`Sorry your answers won’t be submitted since the validation session is
          over.`)}
        </Text>
        <Text>{t('Come back soon!')}</Text>
      </ValidationDialogBody>
    </ValidationDialog>
  )
}

function ValidationDialog({submitText, onSubmit, children, ...props}) {
  return (
    <Dialog closeOnOverlayClick={false} closeOnEsc={false} {...props}>
      {children}
      {onSubmit && (
        <ValidationDialogFooter submitText={submitText} onSubmit={onSubmit} />
      )}
    </Dialog>
  )
}

function ValidationDialogBody(props) {
  return (
    <DialogBody>
      <Stack spacing={2} {...props} />
    </DialogBody>
  )
}

function ValidationDialogFooter({submitText, onSubmit, props}) {
  return (
    <DialogFooter {...props}>
      <PrimaryButton onClick={onSubmit}>{submitText}</PrimaryButton>
    </DialogFooter>
  )
}

export function ValidationToast({epoch: {currentPeriod, nextValidation}}) {
  switch (currentPeriod) {
    case EpochPeriod.FlipLottery:
      return <ValidationSoonToast validationStart={nextValidation} />
    case EpochPeriod.ShortSession:
    case EpochPeriod.LongSession:
      return (
        <ValidationRunningToast
          key={currentPeriod}
          currentPeriod={currentPeriod}
          validationStart={nextValidation}
        />
      )
    case EpochPeriod.AfterLongSession:
      return <AfterLongSessionToast />
    default:
      return null
  }
}

export function ValidationSoonToast({validationStart}) {
  const timerMachine = React.useMemo(
    () => createTimerMachine(dayjs(validationStart).diff(dayjs(), 's')),
    [validationStart]
  )

  const [
    {
      context: {duration},
    },
  ] = useMachine(timerMachine)

  const {t} = useTranslation()

  const {colorMode} = useColorMode()

  return (
    <Snackbar>
      <Notification
        bg={theme.colors[colorMode].danger}
        color={theme.colors.white}
        iconColor={theme.colors.white}
        pinned
        type={NotificationType.Info}
        title={<TimerClock duration={duration} color={theme.colors.white} />}
        body={t('Idena validation will start soon')}
      />
    </Snackbar>
  )
}

export function ValidationRunningToast({currentPeriod, validationStart}) {
  const {shortSession, longSession} = useTimingState()
  const sessionDuration =
    currentPeriod === EpochPeriod.ShortSession
      ? shortSession
      : shortSession + longSession

  const validationStateDefinition = loadValidationState()
  const done = validationStateDefinition
    ? State.create(validationStateDefinition).done
    : false

  const router = useRouter()

  const {t} = useTranslation()

  const timerMachine = React.useMemo(
    () =>
      createTimerMachine(
        dayjs(validationStart)
          .add(sessionDuration, 's')
          .diff(dayjs(), 's')
      ),
    [validationStart, sessionDuration]
  )

  const [
    {
      context: {duration},
    },
  ] = useMachine(timerMachine)

  return (
    <Snackbar>
      <Notification
        bg={done ? theme.colors.success : theme.colors.primary}
        color={theme.colors.white}
        iconColor={theme.colors.white}
        actionColor={theme.colors.white}
        pinned
        type={NotificationType.Info}
        title={<TimerClock duration={duration} color={theme.colors.white} />}
        body={
          done
            ? `Waiting for the end of ${currentPeriod}`
            : `Idena validation is in progress`
        }
        action={done ? null : () => router.push('/validation')}
        actionName={t('Validate')}
      />
    </Snackbar>
  )
}

export function AfterLongSessionToast() {
  const {t} = useTranslation()
  const {colorMode} = useColorMode()
  return (
    <Snackbar>
      <Notification
        bg={theme.colors[colorMode].success}
        color={theme.colors.white}
        iconColor={theme.colors.white}
        pinned
        type={NotificationType.Info}
        title={t(
          'Please wait. The network is reaching consensus about validated identities'
        )}
      />
    </Snackbar>
  )
}

function ValidationSpinner({size = 30}) {
  return (
    <div>
      <style jsx>{`
        @keyframes donut-spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        div {
          display: inline-block;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: ${theme.colors.primary};
          border-radius: 50%;
          width: ${rem(size)};
          height: ${rem(size)};
          animation: donut-spin 1.2s linear infinite;

          left: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
      `}</style>
    </div>
  )
}
