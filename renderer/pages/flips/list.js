/* eslint-disable react/prop-types */
import React from 'react'
import {useMachine} from '@xstate/react'
import {
  Flex,
  Box,
  Alert,
  AlertIcon,
  Image,
  useDisclosure,
  useTheme,
  PopoverTrigger,
  Text,
  Stack,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {
  FlipCardTitle,
  FlipCardSubtitle,
  FlipFilter,
  FlipFilterOption,
  RequiredFlipPlaceholder,
  OptionalFlipPlaceholder,
  FlipCardList,
  EmptyFlipBox,
  FlipCard,
  DeleteFlipDrawer,
  FlipCardMenu,
  FlipCardMenuItem,
  FlipCardMenuItemIcon,
  FlipOverlay,
  FlipOverlayStatus,
  FlipOverlayIcon,
  FlipOverlayText,
} from '../../screens/flips/components'
import {formatKeywords} from '../../screens/flips/utils'
import {
  IconLink,
  FloatDebug,
  Page,
  PageTitle,
} from '../../shared/components/components'
import {
  FlipType,
  IdentityStatus,
  FlipFilter as FlipFilterType,
  OnboardingStep,
} from '../../shared/types'
import {flipsMachine} from '../../screens/flips/machines'
import {useIdentityState} from '../../shared/providers/identity-context'
import {loadPersistentState} from '../../shared/utils/persist'
import {useChainState} from '../../shared/providers/chain-context'
import Layout from '../../shared/components/layout'
import {useOnboarding} from '../../shared/providers/onboarding-context'
import {
  OnboardingPopover,
  OnboardingPopoverContent,
  OnboardingPopoverContentIconRow,
} from '../../shared/components/onboarding'
import {onboardingShowingStep} from '../../shared/utils/onboarding'
import {eitherState} from '../../shared/utils/utils'
import {useFailToast} from '../../shared/hooks/use-toast'

export default function FlipListPage() {
  const {t} = useTranslation()

  const {
    isOpen: isOpenDeleteForm,
    onOpen: openDeleteForm,
    onClose: onCloseDeleteForm,
  } = useDisclosure()

  const {colors} = useTheme()

  const {syncing, offline, loading} = useChainState()
  const {
    flips: knownFlips,
    requiredFlips: requiredFlipsNumber,
    availableFlips: availableFlipsNumber,
    flipKeyWordPairs: availableKeywords,
    state: status,
  } = useIdentityState()

  const [selectedFlip, setSelectedFlip] = React.useState()

  const canSubmitFlips = [
    IdentityStatus.Verified,
    IdentityStatus.Human,
    IdentityStatus.Newbie,
  ].includes(status)

  const failToast = useFailToast()

  const [current, send] = useMachine(flipsMachine, {
    context: {
      knownFlips: knownFlips || [],
      availableKeywords: availableKeywords || [],
      filter: loadPersistentState('flipFilter') || FlipFilterType.Active,
      canSubmitFlips,
    },
    actions: {
      onError: (_, {error}) => failToast(error),
    },
  })

  const {flips, missingFlips, filter} = current.context

  const filterFlips = () => {
    switch (filter) {
      case FlipFilterType.Active:
        return flips.filter(({type}) =>
          [
            FlipType.Publishing,
            FlipType.Published,
            FlipType.Deleting,
            FlipType.Invalid,
          ].includes(type)
        )
      case FlipType.Draft:
        return flips
          .filter(({type}) => type === FlipType.Draft)
          .slice()
          .sort((d1, d2) =>
            dayjs(d2.modifiedAt ?? d2.createdAt).isAfter(
              d1.modifiedAt ?? d1.createdAt
            )
              ? 1
              : -1
          )
      case FlipType.Archived:
        return flips.filter(({type}) =>
          [FlipType.Archived, FlipType.Deleted].includes(type)
        )
      default:
        return []
    }
  }

  const madeFlipsNumber = (knownFlips || []).length

  const remainingRequiredFlips = requiredFlipsNumber - madeFlipsNumber
  const remainingOptionalFlips =
    availableFlipsNumber - Math.max(requiredFlipsNumber, madeFlipsNumber)

  const [currentOnboarding, {dismissCurrentTask}] = useOnboarding()

  const eitherOnboardingState = (...states) =>
    eitherState(currentOnboarding, ...states)

  return (
    <Layout syncing={syncing} offline={offline} loading={loading}>
      <Page>
        <PageTitle>{t('My Flips')}</PageTitle>
        <Flex justify="space-between" align="center" alignSelf="stretch" mb={8}>
          <FlipFilter
            value={filter}
            onChange={value => send('FILTER', {filter: value})}
          >
            <FlipFilterOption value={FlipFilterType.Active}>
              {t('Active')}
            </FlipFilterOption>
            <FlipFilterOption value={FlipFilterType.Draft}>
              {t('Drafts')}
            </FlipFilterOption>
            <FlipFilterOption value={FlipFilterType.Archived}>
              {t('Archived')}
            </FlipFilterOption>
          </FlipFilter>
          <Box>
            <OnboardingPopover
              isOpen={eitherOnboardingState(
                onboardingShowingStep(OnboardingStep.CreateFlips)
              )}
            >
              <PopoverTrigger>
                <Box>
                  <IconLink
                    href="/flips/new"
                    icon="plus-solid"
                    bg="white"
                    position={
                      eitherOnboardingState(
                        onboardingShowingStep(OnboardingStep.CreateFlips)
                      )
                        ? 'relative'
                        : 'initial'
                    }
                    zIndex={2}
                  >
                    {t('New flip')}
                  </IconLink>
                </Box>
              </PopoverTrigger>
              <OnboardingPopoverContent
                title={t('Create required flips')}
                onDismiss={dismissCurrentTask}
              >
                <Stack>
                  <Text>
                    {t(`You need to create at least 3 flips per epoch to participate
                    in the next validation ceremony. Follow step-by-step
                    instructions.`)}
                  </Text>
                  <OnboardingPopoverContentIconRow icon="reward">
                    {t(
                      `You'll get rewarded for every successfully qualified flip.`
                    )}
                  </OnboardingPopoverContentIconRow>
                  <OnboardingPopoverContentIconRow icon="penalty">
                    {t(`Read carefully "What is a bad flip" rules to avoid
                      penalty.`)}
                  </OnboardingPopoverContentIconRow>
                </Stack>
              </OnboardingPopoverContent>
            </OnboardingPopover>
          </Box>
        </Flex>

        {current.matches('ready.dirty.active') &&
          canSubmitFlips &&
          (remainingRequiredFlips > 0 || remainingOptionalFlips > 0) && (
            <Box alignSelf="stretch" mb={8}>
              <Alert
                status="success"
                bg="green.010"
                borderWidth="1px"
                borderColor="green.050"
                fontWeight={500}
                rounded="md"
                px={3}
                py={2}
              >
                <AlertIcon name="info" color="green.500" size={5} mr={3} />
                {remainingRequiredFlips > 0
                  ? t(`Please submit required flips.`, {remainingRequiredFlips})
                  : null}{' '}
                {remainingOptionalFlips > 0
                  ? t(`You can also submit optional flips if you want.`, {
                      remainingOptionalFlips,
                    })
                  : null}
              </Alert>
            </Box>
          )}

        {!canSubmitFlips && (
          <Box alignSelf="stretch" mb={8}>
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
              {t('You can not submit flips. Please get validated first. ')}
            </Alert>
          </Box>
        )}

        {current.matches('ready.pristine') && (
          <Flex
            flex={1}
            alignItems="center"
            justifyContent="center"
            alignSelf="stretch"
          >
            <Image src="/static/flips-cant-icn.svg" />
          </Flex>
        )}

        {current.matches('ready.dirty') && (
          <FlipCardList>
            {filterFlips().map(flip => (
              <FlipCard
                key={flip.id}
                flipService={flip.ref}
                onDelete={() => {
                  if (
                    flip.type === FlipType.Published &&
                    (knownFlips || []).includes(flip.hash)
                  ) {
                    setSelectedFlip(flip)
                    openDeleteForm()
                  } else flip.ref.send('ARCHIVE')
                }}
              />
            ))}
            {current.matches('ready.dirty.active') && (
              <>
                {missingFlips.map(({keywords, ...flip}, idx) => (
                  <Box key={idx}>
                    <EmptyFlipBox position="relative">
                      {[FlipType.Deleting, FlipType.Invalid].some(
                        x => x === flip.type
                      ) && (
                        <FlipOverlay
                          backgroundImage={
                            // eslint-disable-next-line no-nested-ternary
                            flip.type === FlipType.Deleting
                              ? `linear-gradient(to top, ${colors.warning[500]}, transparent)`
                              : flip.type === FlipType.Invalid
                              ? `linear-gradient(to top, ${colors.red[500]}, ${colors.red[500]})`
                              : ''
                          }
                        >
                          <FlipOverlayStatus>
                            <FlipOverlayIcon name="info-solid" />
                            <FlipOverlayText>
                              {flip.type === FlipType.Deleting &&
                                t('Deleting...')}
                            </FlipOverlayText>
                          </FlipOverlayStatus>
                        </FlipOverlay>
                      )}
                      <Image src="/static/flips-cant-icn.svg" />
                    </EmptyFlipBox>
                    <Flex
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mt={4}
                    >
                      <Box>
                        <FlipCardTitle>
                          {keywords
                            ? formatKeywords(keywords.words)
                            : t('Missing keywords')}
                        </FlipCardTitle>
                        <FlipCardSubtitle>
                          {t('Missing on client')}
                        </FlipCardSubtitle>
                      </Box>
                      <FlipCardMenu>
                        <FlipCardMenuItem
                          onClick={() => {
                            setSelectedFlip(flip)
                            openDeleteForm()
                          }}
                        >
                          <FlipCardMenuItemIcon
                            name="delete"
                            size={5}
                            mr={2}
                            color="red.500"
                          />
                          {t('Delete flip')}
                        </FlipCardMenuItem>
                      </FlipCardMenu>
                    </Flex>
                  </Box>
                ))}
                {Array.from({length: remainingRequiredFlips}, (flip, idx) => (
                  <RequiredFlipPlaceholder
                    key={idx}
                    title={`Flip #${madeFlipsNumber + idx + 1}`}
                    {...flip}
                  />
                ))}
                {Array.from({length: remainingOptionalFlips}, (flip, idx) => (
                  <OptionalFlipPlaceholder
                    key={idx}
                    title={`Flip #${madeFlipsNumber +
                      remainingRequiredFlips +
                      idx +
                      1}`}
                    {...flip}
                    isDisabled={remainingRequiredFlips > 0}
                  />
                ))}
              </>
            )}
          </FlipCardList>
        )}

        <DeleteFlipDrawer
          hash={selectedFlip?.hash}
          cover={
            selectedFlip?.isMissing
              ? '/static/flips-cant-icn.svg'
              : selectedFlip?.images[selectedFlip.originalOrder[0]]
          }
          isMissing={selectedFlip?.isMissing}
          isOpen={isOpenDeleteForm}
          onClose={onCloseDeleteForm}
          onDelete={() => {
            selectedFlip.ref.send('DELETE')
            onCloseDeleteForm()
          }}
        />

        {global.isDev && <FloatDebug>{current.value}</FloatDebug>}
      </Page>
    </Layout>
  )
}
