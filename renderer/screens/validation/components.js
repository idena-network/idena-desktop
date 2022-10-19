/* eslint-disable react/prop-types */
import React, {useEffect, useRef, useState} from 'react'
import {
  Box,
  Flex,
  Stack,
  Text,
  Heading,
  Alert,
  Button,
  useTheme,
  Modal,
  ModalOverlay,
  ModalContent,
  Image,
  List,
  ListItem,
  AspectRatio,
  Spinner,
  useDisclosure,
  Tooltip,
  ModalBody,
} from '@chakra-ui/react'
import {Trans, useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration'
import useHover from '@react-hook/hover'
import mousetrap from 'mousetrap'
import {reorderList} from '../../shared/utils/arr'
import {rem} from '../../shared/theme'
import {RelevanceType} from '../../shared/types'
import {
  EmptyFlipImage,
  FlipKeywordPanel,
  FlipKeywordTranslationSwitch,
} from '../flips/components'
import {
  Dialog,
  DialogBody,
  DialogFooter,
} from '../../shared/components/components'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {useInterval} from '../../shared/hooks/use-interval'
import {FillCenter} from '../oracles/components'
import {
  BlockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CrossSmallIcon,
  DeleteIcon,
  InfoIcon,
  NewStarIcon,
  TickIcon,
  ZoomFlipIcon,
} from '../../shared/components/icons'
import {adjustDurationInSeconds} from './machine'
import {useTimer} from '../../shared/hooks/use-timer'

dayjs.extend(durationPlugin)

const Scroll = require('react-scroll')

const {ScrollElement} = Scroll
const {scroller} = Scroll
const ElementFlipImage = ScrollElement(AspectRatio)

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
  timerDetails,
}) {
  const {colors} = useTheme()

  const refContainer = useRef(null)
  const refFlipHover = useRef(null)
  const refZoomIconHover = useRef(null)
  const isFlipHovered = useHover(refFlipHover.current)
  const isZoomIconHovered = useHover(refZoomIconHover.current)
  const initialRef = useRef(null)

  const {
    isOpen: isOpenFlipZoom,
    onOpen: onOpenFlipZoom,
    onClose: onCloseFlipZoom,
  } = useDisclosure()

  useEffect(() => {
    mousetrap.bind(
      'esc',
      () => {
        if (isOpenFlipZoom) onCloseFlipZoom()
      },
      'keyup'
    )

    return () => mousetrap.unbind('esc', 'keyup')
  }, [isOpenFlipZoom, onCloseFlipZoom])

  const scrollToZoomedFlip = flipId => {
    scroller.scrollTo(`flipId-${flipId}`, {
      container: refContainer.current?.firstChild,
      horizontal: false,
      offset: -120,
    })
  }

  if ((fetched && !decoded) || failed) return <FailedFlip />
  if (!fetched) return <LoadingFlip />

  return (
    <Box ref={refFlipHover}>
      <FlipHolder
        isZoomHovered={isZoomIconHovered}
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
            onClick={e => {
              if (e.ctrlKey || e.metaKey) {
                onOpenFlipZoom()
                setTimeout(() => scrollToZoomedFlip(idx), 100)
              } else {
                onChoose(hash)
              }
            }}
          >
            {idx === 0 && (
              <div ref={refZoomIconHover}>
                <Flex
                  display={isFlipHovered ? 'flex' : 'none'}
                  align="center"
                  justify="center"
                  borderRadius="8px"
                  backgroundColor="rgba(17, 17, 17, 0.5)"
                  position="absolute"
                  top={1}
                  right={1}
                  h={8}
                  w={8}
                  opacity={0.5}
                  _hover={{opacity: 1}}
                  zIndex={2}
                  onClick={e => {
                    e.stopPropagation()
                    onOpenFlipZoom()
                  }}
                >
                  <ZoomFlipIcon boxSize="5" />
                </Flex>
              </div>
            )}
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
        <Modal
          initialFocusRef={initialRef}
          size="xl"
          isOpen={isOpenFlipZoom}
          onClose={onCloseFlipZoom}
        >
          <ModalOverlay />
          <Flex
            ref={initialRef}
            zIndex={1401}
            position="fixed"
            top={0}
            left={0}
            right={0}
            h={20}
            justify="center"
            align="center"
            backgroundColor="gray.980"
          >
            <Box />
            <Flex zIndex={2} justify="center">
              <ValidationTimer
                validationStart={timerDetails.validationStart}
                duration={
                  timerDetails.shortSessionDuration -
                  10 +
                  (timerDetails.isShortSession
                    ? 0
                    : timerDetails.longSessionDuration)
                }
                color="white"
              />
            </Flex>
            <CrossSmallIcon
              position="absolute"
              right={6}
              top={6}
              color="white"
              boxSize={8}
              onClick={onCloseFlipZoom}
            />
          </Flex>
          <Box marginTop="80px" ref={refContainer}>
            <ModalContent bg="transparent" border="none" boxShadow="none">
              <ModalBody py={6}>
                <Flex h="100%" w="100%" direction="column" align="center">
                  <Box w="100%">
                    {reorderList(images, orders[variant - 1]).map(
                      (src, idx) => (
                        <ElementFlipImage
                          name={`flipId-${idx}`}
                          ratio={4 / 3}
                          bg="gray.50"
                        >
                          {src ? (
                            <Box position="relative">
                              <Box
                                style={{
                                  background: `center center / cover no-repeat url(${src})`,
                                  filter: `blur(${rem(24)})`,
                                  zIndex: 1,
                                }}
                              />
                              <FlipImage
                                src={src}
                                alt="current-flip"
                                height="100%"
                                width="100%"
                                style={{
                                  position: 'relative',
                                  zIndex: 1,
                                }}
                                onError={onImageFail}
                              />
                            </Box>
                          ) : (
                            <EmptyFlipImage />
                          )}
                        </ElementFlipImage>
                      )
                    )}
                  </Box>
                </Flex>
              </ModalBody>
            </ModalContent>
          </Box>
        </Modal>
      </FlipHolder>
    </Box>
  )
}

function FlipHolder({isZoomHovered = false, ...props}) {
  const {colors} = useTheme()
  return (
    <Tooltip
      isOpen={isZoomHovered}
      label="Ctrl+Click to zoom"
      placement="top"
      zIndex="tooltip"
      bg="graphite.500"
      hasArrow
      py="3/2"
      borderRadius="md"
    >
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
    </Tooltip>
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
  isBest,
  onPick,
}) {
  const isQualified = !!relevance
  const hasIrrelevantWords = relevance === RelevanceType.Irrelevant

  const [bestRewardTooltipShowed, setBestRewardTooltipShowed] = useState(false)
  const [bestRewardTooltipOpen, setBestRewardTooltipOpen] = useState(false)
  useEffect(() => {
    if (isBest && isCurrent && !bestRewardTooltipShowed) {
      setBestRewardTooltipOpen(true)
      setBestRewardTooltipShowed(true)
    }
  }, [isBest, isCurrent])
  useEffect(() => {
    if (!isCurrent) {
      setBestRewardTooltipOpen(false)
    }
    if (bestRewardTooltipOpen) {
      setTimeout(() => {
        setBestRewardTooltipOpen(false)
      }, 5000)
    }
  }, [bestRewardTooltipOpen, isCurrent])

  return (
    <ThumbnailHolder
      isCurrent={isCurrent}
      isBest={isBest}
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
          <Flex
            justify="center"
            align={['flex-end', 'flex-start']}
            w="100%"
            h="100%"
            position="absolute"
          >
            <Box>
              <Tooltip
                isOpen={bestRewardTooltipOpen}
                label="This flip will be rewarded with an 8x reward if other members also mark it as the best"
                fontSize="mdx"
                fontWeight={400}
                mb={2}
                px={3}
                py="10px"
                placement="top-start"
                openDelay={100}
                hasArrow
              >
                {' '}
              </Tooltip>
            </Box>
          </Flex>
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

function ThumbnailHolder({isCurrent, isBest, children, ...props}) {
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
        {isBest && (
          <Flex
            position="absolute"
            top="-8px"
            right="-8px"
            w={5}
            h={5}
            align="center"
            justify="center"
            borderRadius="50%"
            backgroundColor="white"
            zIndex={2}
          >
            <NewStarIcon w={2} h={2} color="white" />
          </Flex>
        )}
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
      <DeleteIcon boxSize="5" color="white" />
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
      {option && <TickIcon boxSize="5" color="white" />}
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
          {isSelected && <TickIcon boxSize="5" />}
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
      <Box
        borderRadius="full"
        cursor="pointer"
        h="full"
        w={560}
        position="relative"
        transform={`translateX(${isPrev ? '-50%' : ''})`}
        transition="all 0.5s ease-out"
        _hover={{bg}}
      >
        {isPrev ? (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%) translateX(80px)"
          >
            <ChevronLeftIcon boxSize="5" color={color} />
          </Box>
        ) : (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%) translateX(-80px)"
          >
            <ChevronRightIcon boxSize="5" color={color} />
          </Box>
        )}
      </Box>
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

export function ValidationTimer({validationStart, duration, color}) {
  const adjustedDuration = React.useMemo(
    () => adjustDurationInSeconds(validationStart, duration) * 1000,
    [duration, validationStart]
  )

  return (
    <Timer>
      <TimerIcon color="red.500" />
      <TimerClock duration={adjustedDuration} color={color} />
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

export function TimerIcon(props) {
  return <ClockIcon boxSize={5} {...props} />
}

export function TimerClock({duration, color}) {
  const [{remaining, isStopped, isRunning}, {reset}] = useTimer(duration)

  React.useEffect(() => {
    reset(duration)
  }, [duration, reset])

  return (
    <Box style={{fontVariantNumeric: 'tabular-nums', minWidth: 37}}>
      <Text color={color ?? 'red.500'} fontSize="md" fontWeight={600}>
        {isStopped && '00:00'}
        {isRunning && dayjs.duration(remaining).format('mm:ss')}
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

  const approvedCount = flips.filter(
    flip => flip.relevance === RelevanceType.Relevant
  ).length

  const abstainedCount = flips.filter(
    flip =>
      (flip.relevance ?? RelevanceType.Abstained) === RelevanceType.Abstained
  ).length

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
                label={t('Approved')}
                value={approvedCount}
              />
              <ReviewValidationDialog.Stat
                label={t('Reported')}
                value={reportedFlipsCount}
              />
              {availableReportsCount - reportedFlipsCount > 0 ? (
                <ReviewValidationDialog.Stat
                  label={t('Unused reports')}
                  value={availableReportsCount - reportedFlipsCount}
                />
              ) : (
                <ReviewValidationDialog.Stat
                  label={t('Abstained')}
                  value={abstainedCount}
                />
              )}
            </Stack>
            {(areFlipsUnanswered || areReportsMissing) && (
              <Stack>
                {areFlipsUnanswered && (
                  <Text color="muted">
                    <Trans i18nKey="reviewMissingFlips" t={t}>
                      You need to answer{' '}
                      <ReviewValidationDialog.LinkButton
                        onClick={onMisingAnswers}
                      >
                        all flips
                      </ReviewValidationDialog.LinkButton>{' '}
                      otherwise you may fail the validation.
                    </Trans>
                  </Text>
                )}
                {areReportsMissing && (
                  <Text color="muted">
                    <Trans i18nKey="reviewMissingReports" t={t}>
                      Use{' '}
                      <ReviewValidationDialog.LinkButton
                        variant="link"
                        onClick={onMisingReports}
                      >
                        all available reports
                      </ReviewValidationDialog.LinkButton>
                      to get maximum rewards.
                    </Trans>
                  </Text>
                )}
              </Stack>
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
              <InfoIcon color="red.500" boxSize={5} mr={3} />
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
    '3-enums',
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
      size="664"
      onClose={onClose}
      initialFocusRef={nextButtonRef}
      {...props}
    >
      <ModalOverlay />
      <ModalContent
        bg="transparent"
        color="gray.500"
        fontSize="md"
        rounded="lg"
      >
        <Stack isInline spacing="9">
          <Stack
            spacing={0}
            borderColor="gray.016"
            borderWidth={1}
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
            p="8"
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
                  {t('There is a sequence of enumerated objects')}
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
    <AspectRatio ratio={4 / 3} w="132px">
      <Image {...props} />
    </AspectRatio>
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
    {},
    {top: `${100 * 1 - 4}px`, bottom: `${100 * 2 - 4}px`},
    {top: `${100 * 1 - 4}px`, bottom: `${100 * 2 - 4}px`},
  ]
  return (
    <Box
      position="absolute"
      borderWidth={2}
      borderColor="red.500"
      borderRadius="md"
      boxShadow="0 0 0 4px rgba(255, 102, 102, 0.25)"
      top="-1"
      left="-1"
      right="-1"
      bottom="-1"
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
        color="white"
        boxSize={8}
        position="absolute"
        right="-5"
        bottom="-5"
      >
        <BlockIcon boxSize="5" />
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

export function SynchronizingValidationAlert({children, ...props}) {
  return (
    <NotSyncedAlert
      status="warning"
      boxShadow="0 3px 12px 0 rgb(255 163 102 /0.1), 0 2px 3px 0 rgb(255 163 102 /0.2)"
      {...props}
    >
      <Stack isInline align="center">
        <Spinner boxSize={4} />
        <Text>{children}</Text>
      </Stack>
    </NotSyncedAlert>
  )
}

export function OfflineValidationAlert(props) {
  return (
    <NotSyncedAlert
      status="error"
      boxShadow="0 3px 12px 0 rgb(255 102 102 /0.1), 0 2px 3px 0 rgb(255 102 102 /0.2)"
      {...props}
    />
  )
}

function NotSyncedAlert(props) {
  return (
    <Alert
      variant="solid"
      justifyContent="center"
      color="white"
      fontWeight={500}
      fontSize="md"
      rounded="md"
      p={3}
      position="absolute"
      top={2}
      left={2}
      right={2}
      {...props}
    />
  )
}
