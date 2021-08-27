/* eslint-disable react/prop-types */
import React, {useMemo} from 'react'
import {
  Box,
  Flex,
  Stack,
  Text,
  Heading,
  Icon,
  Alert,
  AlertIcon,
  Button,
  useTheme,
  Modal,
  ModalOverlay,
  ModalContent,
  Image,
  List,
  ListItem,
  AspectRatioBox,
  PseudoBox,
  Spinner,
} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import {Trans, useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {useRouter} from 'next/router'
import {State} from 'xstate'
import {reorderList} from '../../shared/utils/arr'
import {rem} from '../../shared/theme'
import {RelevanceType, adjustDuration} from './machine'
import {loadValidationStateDefinition} from './utils'
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
  Snackbar,
  Toast,
} from '../../shared/components/components'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {useInterval} from '../../shared/hooks/use-interval'
import {FillCenter} from '../oracles/components'

export function ValidationScene(props) {
  return (
    <Flex
      direction="column"
      h="100vh"
      w="full"
      pt={6}
      pb={3}
      pl={10}
      pr={6}
      overflow="hidden"
      position="relative"
      {...props}
    />
  )
}

export function Header(props) {
  return <Flex justify="space-between" align="center" mb={rem(55)} {...props} />
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
  return <Flex justify="center" flex={1} mb={6} {...props} />
}

export function FlipChallenge(props) {
  return <Flex justify="center" align="center" zIndex={1} {...props} />
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
  const {colors} = useTheme()

  if ((fetched && !decoded) || failed) return <FailedFlip />
  if (!fetched) return <LoadingFlip />

  return (
    <FlipHolder
      // eslint-disable-next-line no-nested-ternary
      {...(option
        ? option === variant
          ? {
              border: `solid 2px ${colors.blue[500]}`,
              boxShadow: `0 0 2px ${rem(3)} ${colors.blue['025']}`,
              transition: 'all .3s cubic-bezier(.5, 0, .5, 1)',
            }
          : {
              opacity: 0.3,
              transform: 'scale(0.98)',
              transition: 'all .3s cubic-bezier(.5, 0, .5, 1)',
              transitionProperty: 'opacity, transform',
              willChange: 'opacity, transform',
            }
        : {})}
    >
      {reorderList(images, orders[variant - 1]).map((src, idx) => (
        <Box
          key={idx}
          height="calc((100vh - 260px) / 4)"
          position="relative"
          overflow="hidden"
          onClick={() => onChoose(hash)}
        >
          <FlipBlur src={src} />
          <FlipImage
            src={src}
            objectFit="contain"
            height="full"
            width="full"
            position="relative"
            zIndex={1}
            onError={onImageFail}
          />
        </Box>
      ))}
    </FlipHolder>
  )
}

function FlipHolder(props) {
  const {colors} = useTheme()
  return (
    <Flex
      justify="center"
      direction="column"
      borderRadius="lg"
      borderWidth={2}
      borderColor="brandGray.005"
      boxShadow={`0 0 2px 0 ${colors['005']}`}
      mx="10px"
      p={1}
      position="relative"
      transitionProperty="opacity, transform"
      willChange="opacity, transform"
      height="calc(100vh - 260px)"
      width="calc((100vh - 240px) / 3)"
      {...props}
    />
  )
}

function LoadingFlip() {
  return (
    <FlipHolder cursor="not-allowed">
      <FillCenter>
        <Spinner size="lg" thickness={4} color="blue.500" />
      </FillCenter>
    </FlipHolder>
  )
}

const defaultOrder = [1, 2, 3, 4]

function FailedFlip() {
  const {t} = useTranslation()
  return (
    <FlipHolder border="none" boxShadow="none" cursor="not-allowed">
      {defaultOrder.map((_, idx) => (
        <Flex
          key={`left-${idx}`}
          justify="center"
          align="center"
          background="rgb(64 64 64 / 0.84)"
          border="solid 1px rgba(210, 212, 217, 0.16)"
          borderBottom={
            idx !== defaultOrder.length - 1
              ? 'none'
              : 'solid 1px rgba(210, 212, 217, 0.16)'
          }
          borderTopLeftRadius={idx === 0 ? 'lg' : 'none'}
          borderTopRightRadius={idx === 0 ? 'lg' : 'none'}
          borderBottomLeftRadius={
            idx === defaultOrder.length - 1 ? 'lg' : 'none'
          }
          borderBottomRightRadius={
            idx === defaultOrder.length - 1 ? 'lg' : 'none'
          }
          height="calc((100vh - 260px) / 4)"
          overflow="hidden"
        >
          <Image
            alt={t('Failed flip')}
            src="/static/body-medium-pic-icn.svg"
            ignoreFallback
            h={10}
            w={10}
            opacity={0.3}
          />
        </Flex>
      ))}
    </FlipHolder>
  )
}

export function FailedFlipAnnotation(props) {
  return (
    <Box
      background="rgb(17 17 17 / 0.17)"
      px="42px"
      py={4}
      color="white"
      fontSize="md"
      fontWeight={500}
      textAlign="center"
      position="absolute"
      top="50%"
      left={14}
      right={14}
      transform="translateY(-50%)"
      zIndex={2}
      {...props}
    />
  )
}

function FlipBlur({src}) {
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      background={`center center / cover no-repeat url(${src})`}
      zIndex={1}
      style={{
        filter: 'blur(6px)',
      }}
    />
  )
}

function FlipImage(props) {
  return <Image ignoreFallback {...props} />
}

export function ActionBar(props) {
  return <Flex justify="space-between" mb={4} {...props} />
}

export function ActionBarItem(props) {
  return <Flex flex={1} minH={8} zIndex={1} {...props} />
}

const thumbBorderWidth = 2
const thumbMargin = 4
const thumbWidth = 32
const totalThumbWidth = thumbBorderWidth * 2 + thumbMargin * 2 + thumbWidth

export function ThumbnailList({currentIndex, ...props}) {
  return (
    <Flex
      align="center"
      minH={12}
      position="relative"
      zIndex={1}
      transform={`translateX(50%) translateX(-${totalThumbWidth *
        (currentIndex + 1 / 2)}px)`}
      transition="transform .3s ease-out"
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
      borderColor={
        // eslint-disable-next-line no-nested-ternary
        isCurrent
          ? // eslint-disable-next-line no-nested-ternary
            isQualified
            ? hasIrrelevantWords
              ? 'red.500'
              : 'rgb(87 143 255 / 0.9)'
            : 'blue.500'
          : 'transparent'
      }
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
            objectFit="cover"
            border={isCurrent ? 'transparent' : 'solid 1px rgb(83 86 92 /0.16)'}
            borderRadius="xl"
            height={8}
            width={8}
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
      borderWidth={thumbBorderWidth}
      borderColor={isCurrent ? 'blue.500' : 'transparent'}
      borderRadius="xl"
      {...props}
    >
      <Flex
        justify="center"
        align="center"
        h={8}
        w={8}
        m={1}
        position="relative"
      >
        {children}
      </Flex>
    </Flex>
  )
}

function LoadingThumbnail() {
  return <Spinner color="blue.500" thickness={4} />
}

function FailedThumbnail() {
  return (
    <Flex
      justify="center"
      align="center"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgb(89 89 89 / 0.95)"
      borderRadius="xl"
    >
      <Icon name="delete" size={5} color="white" />
    </Flex>
  )
}

function ThumbnailOverlay({option, isQualified, hasIrrelevantWords}) {
  return (
    <Flex
      justify="center"
      align="center"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={1}
      bg={
        // eslint-disable-next-line no-nested-ternary
        isQualified
          ? hasIrrelevantWords
            ? 'red.090'
            : 'blue.090'
          : 'rgb(150 153 158 / 0.8)'
      }
      borderRadius="xl"
    >
      {option && <Icon name="tick" size={5} color="white" />}
    </Flex>
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
    <Box fontSize="md" color="brandGray.500" ml={rem(32)} w={rem(320)}>
      <FlipKeywordPanel w={rem(320)} mb={8}>
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
            <Box color="brandGray.500" fontWeight={500}>
              {t(`Getting flip keywords...`)}
            </Box>
            <Box color="muted" mt={2}>
              {t(
                'Can not load the flip keywords to moderate the story. Please wait or skip this flip.'
              )}
            </Box>
          </>
        )}
      </FlipKeywordPanel>
      {children}
    </Box>
  )
}

export function QualificationActions(props) {
  return <Stack isInline spacing={2} align="center" {...props} />
}

// eslint-disable-next-line react/display-name
export const QualificationButton = React.forwardRef(
  ({isSelected, children, ...props}, ref) => {
    const ButtonVariant = isSelected ? PrimaryButton : SecondaryButton
    return (
      <ButtonVariant ref={ref} flex={1} maxW={40} overflow="hidden" {...props}>
        <Stack isInline spacing={2} align="center" justify="center">
          {isSelected && <Icon name="tick" size={5} />}
          <Text>{children}</Text>
        </Stack>
      </ButtonVariant>
    )
  }
)

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
  return (
    <Box
      position="absolute"
      top="50%"
      left={isPrev && 0}
      right={isPrev || 0}
      h={600}
      w={280}
      zIndex={0}
      transform="translate(0, -50%)"
      overflow="hidden"
      {...props}
    >
      <PseudoBox
        borderRadius="full"
        cursor="pointer"
        h="full"
        w={560}
        position="relative"
        transform={`translateX(${isPrev ? '-50%' : ''})`}
        transition="all 0.5s ease-out"
        _hover={{bg}}
      >
        <Icon
          name="chevron-down"
          size={5}
          color={color}
          position="absolute"
          top="50%"
          left="50%"
          transform={`translate(-50%, -50%) translateX(${
            isPrev ? '80px' : '-80px'
          }) rotate(${isPrev ? '' : '-'}90deg)`}
        />
      </PseudoBox>
    </Box>
  )
}

export function WelcomeKeywordsQualificationDialog(props) {
  const {t} = useTranslation()
  return (
    <ValidationDialog
      title={t('Check flip quality')}
      submitText={t('Ok, I understand')}
      {...props}
    >
      <ValidationDialogBody spacing={3}>
        <Stack spacing={1}>
          <Text>
            {t('Please report the flip in the following cases:', {
              nsSeparator: '!!',
            })}
          </Text>
          <List styleType="unordered">
            <ListItem>{t('You can not find a keyword in the story')}</ListItem>
            <ListItem>
              {t('You need to read the text in the flip to solve it')}
            </ListItem>
            <ListItem>{t('You see inappropriate content')}</ListItem>
            <ListItem>
              {t(
                'You see numbers or letters or other labels on top of the images showing their order'
              )}
            </ListItem>
          </List>
        </Stack>
        <Text>
          {t(
            `You'll get rewards for reported flips if this flip are also reported by other participants.`
          )}
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
      <TimerIcon color="red.500" />
      <TimerClock duration={adjustedDuration} color="red.500" />
    </Timer>
  )
}

export function Timer(props) {
  return (
    <Stack
      isInline
      align="center"
      bg="red.024"
      borderRadius={16}
      px={2}
      pr={3}
      py="3/2"
      {...props}
    />
  )
}

export function TimerIcon({color, ...props}) {
  return <Icon name="clock" size={5} color={color} {...props} />
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
    <Box style={{fontVariantNumeric: 'tabular-nums', minWidth: 37}}>
      <Text color={color} fontSize="md" fontWeight={600}>
        {state.matches('stopped') && '00:00'}
        {state.matches('running') &&
          [Math.floor(remaining / 60), remaining % 60]
            .map(t => t.toString().padStart(2, 0))
            .join(':')}
      </Text>
    </Box>
  )
}

export function SubmitFailedDialog({onSubmit, ...props}) {
  const {t} = useTranslation()

  const [sec, setSec] = React.useState(5)

  React.useEffect(() => {
    if (sec === 0) {
      onSubmit()
    }
  }, [onSubmit, sec])

  useInterval(() => setSec(sec - 1), sec ? 1000 : null)

  return (
    <ValidationDialog
      title={t('Submit failed')}
      submitText={`${t('Retry')} (${sec})`}
      onSubmit={onSubmit}
      {...props}
    >
      <DialogBody>
        <Text>{t('An error occured while submitting your answers.')}</Text>
      </DialogBody>
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
          {t(
            `You haven't submitted your answers in time. This validation session is over.`
          )}
        </Text>
        <Text>
          {t('Come back again to participate in the next validation session.')}
        </Text>
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

  return (
    <Snackbar>
      <Toast
        bg="red.500"
        color="white"
        title={<TimerClock duration={duration} color="white" />}
        description={t('Idena validation will start soon')}
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

  const validationStateDefinition = loadValidationStateDefinition()
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
      <Toast
        bg={done ? 'green.500' : 'blue.500'}
        color="white"
        actionColor="white"
        title={<TimerClock duration={duration} color="white" />}
        description={
          done
            ? t('Waiting for the end of {{currentPeriod}}', {currentPeriod})
            : t('Idena validation is in progress')
        }
        onAction={() => router.push('/validation')}
        actionName={done ? null : t('Validate')}
      />
    </Snackbar>
  )
}

export function AfterLongSessionToast() {
  const {t} = useTranslation()
  return (
    <Snackbar>
      <Toast
        bg="green.500"
        color="white"
        title={t(
          'Please wait. The network is reaching consensus on validated identities'
        )}
      />
    </Snackbar>
  )
}

export function ReviewValidationDialog({
  flips,
  reportedFlipsCount,
  availableReportsCount,
  isSubmitting,
  onSubmit,
  onMisingAnswers,
  onMisingReports,
  onCancel,
  ...props
}) {
  const {t} = useTranslation()

  const answeredFlipsCount = flips.filter(({option}) => option > 0).length

  const areFlipsUnanswered = answeredFlipsCount < flips.length
  const areReportsMissing = reportedFlipsCount < availableReportsCount

  return (
    <Dialog title={t('Submit the answers')} onClose={onCancel} {...props}>
      <ValidationDialogBody>
        <Stack spacing={6}>
          <Stack spacing={4}>
            <Stack spacing={2}>
              <ReviewValidationDialog.Stat
                label={t('Answered')}
                value={t('{{answeredFlips}} out of {{totalFlips}}', {
                  answeredFlips: answeredFlipsCount,
                  totalFlips: flips.length,
                })}
              />
              <ReviewValidationDialog.Stat
                label={t('Flips reported')}
                value={t(
                  '{{reportedFlipsCount}} out of {{availableReportsCount}}',
                  {
                    reportedFlipsCount,
                    availableReportsCount,
                  }
                )}
              />
            </Stack>
            {(areFlipsUnanswered || areReportsMissing) && (
              <Text color="muted">
                {areFlipsUnanswered && (
                  <Trans i18nKey="reviewMissingFlips" t={t}>
                    You need to answer{' '}
                    <ReviewValidationDialog.LinkButton
                      onClick={onMisingAnswers}
                    >
                      all flips
                    </ReviewValidationDialog.LinkButton>{' '}
                    otherwise you may fail the validation.
                  </Trans>
                )}{' '}
                {areReportsMissing && (
                  <Trans i18nKey="reviewMissingReports" t={t}>
                    In order to get maximum rewards use{' '}
                    <ReviewValidationDialog.LinkButton
                      variant="link"
                      onClick={onMisingReports}
                    >
                      all available reports
                    </ReviewValidationDialog.LinkButton>
                    for the worst flips.
                  </Trans>
                )}
              </Text>
            )}
          </Stack>
          {areReportsMissing && (
            <Alert
              status="error"
              bg="red.010"
              borderWidth="1px"
              borderColor="red.050"
              fontWeight={500}
              rounded="md"
              px={3}
              py={2}
            >
              <AlertIcon name="info" color="red.500" size={5} mr={3} />
              {t('You may lose rewards. Are you sure?')}
            </Alert>
          )}
        </Stack>
      </ValidationDialogBody>
      <DialogFooter {...props}>
        <SecondaryButton onClick={onCancel}>{t('Cancel')}</SecondaryButton>
        <PrimaryButton
          isLoading={isSubmitting}
          loadingText={t('Submitting answers...')}
          onClick={onSubmit}
        >
          {t('Submit answers')}
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
}

function ReviewValidationDialogStat({label, value, ...props}) {
  return (
    <Flex justify="space-between" {...props}>
      <Text color="muted">{label}</Text>
      <Text>{value}</Text>
    </Flex>
  )
}
ReviewValidationDialog.Stat = ReviewValidationDialogStat

function ReviewValidationDialogLinkButton(props) {
  const {colors} = useTheme()
  return (
    <Button
      variant="link"
      color="muted"
      fontWeight="normal"
      verticalAlign="baseline"
      borderColor="red.500"
      textDecoration={`underline ${colors.muted}`}
      _hover={{
        color: 'brandGray.500',
      }}
      _focus={null}
      {...props}
    />
  )
}
ReviewValidationDialog.LinkButton = ReviewValidationDialogLinkButton

export function EncourageReportDialog({...props}) {
  const {t} = useTranslation()
  return (
    <ValidationDialog
      title={t('The flip is reported')}
      submitText={t('Ok, I understand')}
      // eslint-disable-next-line react/destructuring-assignment
      onSubmit={props.onClose}
      {...props}
    >
      <DialogBody>
        {t(
          `You'll get a reward if the flip is also reported by other participants (more than 50% of the qualification committee is required).`
        )}
      </DialogBody>
    </ValidationDialog>
  )
}

export function BadFlipDialog({title, subtitle, isOpen, onClose, ...props}) {
  const {t} = useTranslation()

  const [flipCase, setFlipCase] = React.useState(0)

  const dirs = [
    '1-keywords-vase-coffee',
    '2-numbers',
    '3-labels',
    '4-text',
    '5-inappropriate-content',
  ]
  // eslint-disable-next-line no-shadow
  const flipUrl = (flipCase, idx) =>
    `/static/flips/${dirs[flipCase]}/${idx}.jpg`

  React.useEffect(() => {
    if (!isOpen) setFlipCase(0)
  }, [isOpen])

  const nextButtonRef = React.useRef()

  return (
    <Modal
      isOpen={isOpen}
      isCentered
      size={664}
      onClose={onClose}
      initialFocusRef={nextButtonRef}
      {...props}
    >
      <ModalOverlay bg="xblack.080" />
      <ModalContent
        bg="transparent"
        color="brandGray.500"
        fontSize="md"
        rounded="lg"
      >
        <Stack isInline spacing={28}>
          <Stack
            spacing={0}
            borderColor="brandGray.016"
            borderWidth={1}
            minW={120}
            position="relative"
          >
            <BadFlipPartFrame flipCase={flipCase} />
            <BadFlipImage src={flipUrl(flipCase, 1)} roundedTop="md" />
            <BadFlipImage src={flipUrl(flipCase, 2)} />
            <BadFlipImage src={flipUrl(flipCase, 3)} />
            <BadFlipImage src={flipUrl(flipCase, 4)} roundedBottom="md" />
          </Stack>
          <Flex
            direction="column"
            justify="space-between"
            spacing={7}
            bg="white"
            borderRadius="lg"
            p={8}
            w={440}
          >
            <Stack spacing={4}>
              <Box>
                <Heading fontSize="lg" fontWeight={500} lineHeight="32px">
                  {title}
                </Heading>
                <Text color="muted">{subtitle}</Text>
              </Box>
              <List as="ul">
                <BadFlipListItem
                  flipCase={0}
                  description={
                    <Trans t={t} i18nKey="badFlipKeywordsVaseCoffee">
                      Vase /{' '}
                      <Text as="span" color="red.500">
                        Coffee
                      </Text>
                      . 'Coffee' keyword can not be found on the images
                    </Trans>
                  }
                  isActive={flipCase === 0}
                  onClick={() => {
                    setFlipCase(0)
                  }}
                >
                  {t('One of the keywords is not clearly visible in the story')}
                </BadFlipListItem>
                <BadFlipListItem
                  flipCase={1}
                  isActive={flipCase === 1}
                  onClick={() => {
                    setFlipCase(1)
                  }}
                >
                  {t('There are numbers or letters indicating the order')}
                </BadFlipListItem>
                <BadFlipListItem
                  flipCase={2}
                  isActive={flipCase === 2}
                  onClick={() => {
                    setFlipCase(2)
                  }}
                >
                  {t('There are labels indicating the right order')}
                </BadFlipListItem>
                <BadFlipListItem
                  flipCase={3}
                  description={t(
                    'Some of the Idena users can not not read the text in your local language'
                  )}
                  isActive={flipCase === 3}
                  onClick={() => {
                    setFlipCase(3)
                  }}
                >
                  {t(
                    'There is text that is necessary to read to solve the flip'
                  )}
                </BadFlipListItem>
                <BadFlipListItem
                  flipCase={4}
                  isActive={flipCase === 4}
                  onClick={() => {
                    setFlipCase(4)
                  }}
                >
                  {t('There is inappropriate content')}
                </BadFlipListItem>
              </List>
            </Stack>
            <Stack isInline justify="flex-end">
              <SecondaryButton onClick={onClose}>{t('Skip')}</SecondaryButton>
              <PrimaryButton
                ref={nextButtonRef}
                onClick={() => {
                  if (flipCase === dirs.length - 1) onClose()
                  else setFlipCase(flipCase + 1)
                }}
              >
                {flipCase === dirs.length - 1
                  ? t('Ok, I understand')
                  : t('Next')}
              </PrimaryButton>
            </Stack>
          </Flex>
        </Stack>
      </ModalContent>
    </Modal>
  )
}

function BadFlipImage(props) {
  return (
    <AspectRatioBox ratio={4 / 3} w={132}>
      <Image {...props} />
    </AspectRatioBox>
  )
}

function BadFlipListItem({
  flipCase,
  description,
  isActive,
  children,
  ...props
}) {
  return (
    <ListItem py={2} cursor="pointer" {...props}>
      <Stack isInline>
        <BadFlipListItemCircle
          bg={isActive ? 'red.500' : 'red.012'}
          color={isActive ? 'white' : 'red.500'}
        >
          {flipCase + 1}
        </BadFlipListItemCircle>
        <Stack spacing={1}>
          <Text>{children}</Text>
          {isActive && description && (
            <Text color="muted" fontSize={12}>
              {description}
            </Text>
          )}
        </Stack>
      </Stack>
    </ListItem>
  )
}

function BadFlipListItemCircle(props) {
  return (
    <Flex
      align="center"
      justify="center"
      rounded="full"
      fontSize={10}
      fontWeight={500}
      minW={18}
      w={18}
      h={18}
      {...props}
    />
  )
}

function BadFlipPartFrame({flipCase, ...props}) {
  const framePosition = [
    {},
    {},
    {top: 100 * 3 - 4, bottom: -4},
    {top: 100 * 1 - 4, bottom: 100 * 2 - 4},
    {top: 100 * 1 - 4, bottom: 100 * 2 - 4},
  ]
  return (
    <Box
      position="absolute"
      borderWidth={2}
      borderColor="red.500"
      borderRadius="md"
      boxShadow="0 0 0 4px rgba(255, 102, 102, 0.25)"
      top={-4}
      left={-4}
      right={-4}
      bottom={-4}
      {...framePosition[flipCase]}
      transition="all 0.2s ease-out"
      zIndex={1}
      {...props}
    >
      <Flex
        align="center"
        justify="center"
        bg="red.500"
        borderRadius="full"
        size={8}
        position="absolute"
        right={-20}
        bottom={-20}
      >
        <Icon name="block" size={5} />
      </Flex>
    </Box>
  )
}

export function ReviewShortSessionDialog({
  flips,
  onSubmit,
  onCancel,
  ...props
}) {
  const {t} = useTranslation()

  const answeredFlipsCount = flips.filter(({option}) => option > 0).length

  const areFlipsUnanswered = answeredFlipsCount < flips.length

  return (
    <Dialog title={t('Submit the answers')} onClose={onCancel} {...props}>
      <ValidationDialogBody>
        <Stack spacing={6}>
          <Stack spacing={4}>
            <Stack spacing={2}>
              <ReviewValidationDialogStat
                label={t('Answered')}
                value={t('{{answeredFlips}} out of {{totalFlips}}', {
                  answeredFlips: answeredFlipsCount,
                  totalFlips: flips.length,
                })}
              />
            </Stack>
            {areFlipsUnanswered && (
              <Text color="muted">
                {areFlipsUnanswered && (
                  <Trans i18nKey="reviewMissingFlips" t={t}>
                    You need to answer{' '}
                    <ReviewValidationDialogLinkButton onClick={onCancel}>
                      all flips
                    </ReviewValidationDialogLinkButton>{' '}
                    otherwise you may fail the validation.
                  </Trans>
                )}
              </Text>
            )}
          </Stack>
        </Stack>
      </ValidationDialogBody>
      <DialogFooter {...props}>
        <SecondaryButton onClick={onCancel}>{t('Cancel')}</SecondaryButton>
        <PrimaryButton onClick={onSubmit}>{t('Submit answers')}</PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
}
