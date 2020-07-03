/* eslint-disable react/prop-types */
import React from 'react'
import {useMachine} from '@xstate/react'
import {
  Flex,
  Box,
  Alert,
  AlertIcon,
  Image,
  useToast,
  useDisclosure,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {Page, PageTitle} from '../../screens/app/components'
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
} from '../../screens/flips/components'
import {formatKeywords} from '../../screens/flips/utils'
import {IconLink} from '../../shared/components/link'
import {FlipType, IdentityStatus} from '../../shared/types'
import {Debug} from '../../shared/components/components'
import {flipsMachine} from '../../screens/flips/machines'
import {useIdentityState} from '../../shared/providers/identity-context'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {Notification} from '../../shared/components/notifications'
import {NotificationType} from '../../shared/providers/notification-context'

export default function FlipListPage() {
  const {t} = useTranslation()

  const toast = useToast()

  const {
    isOpen: isOpenDeleteForm,
    onOpen: openDeleteForm,
    onClose: onCloseDeleteForm,
  } = useDisclosure()

  const {syncing, offline, loading} = useChainState()

  const {
    flips: knownFlips,
    requiredFlips: requiredFlipsNumber,
    availableFlips: availableFlipsNumber,
    flipKeyWordPairs: availableKeywords,
    state: status,
  } = useIdentityState()

  const [selectedFlip, setSelectedFlip] = React.useState()

  const [current, send] = useMachine(flipsMachine, {
    context: {
      knownFlips: knownFlips || [],
      availableKeywords: availableKeywords || [],
    },
    actions: {
      onError: (_, {error}) =>
        toast({
          title: error,
          status: 'error',
          duration: 5000,
          isClosable: true,
          // eslint-disable-next-line react/display-name
          render: () => (
            <Box fontSize="md">
              <Notification title={error} type={NotificationType.Error} />
            </Box>
          ),
        }),
    },
  })
  const {flips, missingFlips} = current.context

  const readyState = state => ({ready: {dirty: state}})

  // eslint-disable-next-line no-nested-ternary
  const filteredFlips = current.matches(readyState('active'))
    ? flips.filter(({type}) =>
        [
          FlipType.Publishing,
          FlipType.Published,
          FlipType.Deleting,
          FlipType.Invalid,
        ].includes(type)
      )
    : // eslint-disable-next-line no-nested-ternary
    current.matches(readyState('drafts'))
    ? flips.filter(({type}) => [FlipType.Draft].includes(type))
    : current.matches(readyState('archive'))
    ? flips.filter(({type}) =>
        [FlipType.Archived, FlipType.Deleted].includes(type)
      )
    : []

  const madeFlipsNumber = (knownFlips || []).length

  const remainingRequiredFlips = requiredFlipsNumber - madeFlipsNumber
  const remainingOptionalFlips =
    availableFlipsNumber - Math.max(requiredFlipsNumber, madeFlipsNumber)

  const canSubmitFlips = [
    IdentityStatus.Verified,
    IdentityStatus.Human,
    IdentityStatus.Newbie,
  ].includes(status)

  return (
    <Layout syncing={syncing} offline={offline} loading={loading}>
      <Page>
        <PageTitle>{t('My Flips')}</PageTitle>
        <Flex justify="space-between" align="center" alignSelf="stretch" mb={8}>
          <FlipFilter
            defaultValue="Active"
            onChange={value => send(`FILTER_${value.toUpperCase()}`)}
          >
            <FlipFilterOption value="Active">{t('Active')}</FlipFilterOption>
            <FlipFilterOption value="Drafts">{t('Drafts')}</FlipFilterOption>
            <FlipFilterOption value="Archive">{t('Archived')}</FlipFilterOption>
          </FlipFilter>
          <IconLink href="/flips/new" icon="plus-solid">
            {t('Add flip')}
          </IconLink>
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
                <AlertIcon
                  name="info"
                  color="green.500"
                  size={5}
                  mr={3}
                ></AlertIcon>
                {remainingRequiredFlips
                  ? t(`Please submit required flips.`, {remainingRequiredFlips})
                  : null}{' '}
                {remainingOptionalFlips
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
              <AlertIcon
                name="info"
                color="red.500"
                size={5}
                mr={3}
              ></AlertIcon>
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
            {filteredFlips.map(flip => (
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
                {missingFlips.map(({keywords}, idx) => (
                  <Box key={idx}>
                    <EmptyFlipBox>
                      <Image src="/static/flips-cant-icn.svg" />
                    </EmptyFlipBox>
                    <Box mt={4}>
                      <FlipCardTitle>
                        {keywords
                          ? formatKeywords(keywords.words)
                          : t('Missing keywords')}
                      </FlipCardTitle>
                      <FlipCardSubtitle>
                        {t('Missing on client')}
                      </FlipCardSubtitle>
                    </Box>
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
          cover={selectedFlip?.images[selectedFlip.originalOrder[0]]}
          isOpen={isOpenDeleteForm}
          onClose={onCloseDeleteForm}
          onDelete={() => {
            selectedFlip.ref.send('DELETE')
            onCloseDeleteForm()
          }}
        />

        {global.isDev && (
          <Box position="absolute" left={6} bottom={6} zIndex="popover">
            <Debug>{current.value}</Debug>
          </Box>
        )}
      </Page>
    </Layout>
  )
}
