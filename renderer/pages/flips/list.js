/* eslint-disable react/prop-types */
import React from 'react'
import NextLink from 'next/link'
import {useService, useMachine} from '@xstate/react'
import {
  Flex,
  Box,
  Alert,
  AlertIcon,
  Image,
  MenuDivider,
  useTheme,
  useToast,
} from '@chakra-ui/core'
import {transparentize} from 'polished'
import {Page, PageTitle} from '../../screens/app/components'
import {
  FlipCardImage,
  FlipCardTitle,
  FlipCardSubtitle,
  FlipFilter,
  FlipFilterOption,
  RequiredFlip,
  OptionalFlip,
  FlipCardList,
  FlipCardMenu,
  FlipCardMenuItem,
  FlipCardMenuItemIcon,
  EmptyFlipBox,
  FlipOverlay,
  FlipOverlayStatus,
  FlipOverlayIcon,
  FlipOverlayText,
  FlipCardImageBox,
} from '../../screens/flips/components'
import {formatKeywords} from '../../screens/flips/utils'
import {IconLink} from '../../shared/components/link'
// import {useAppMachine} from '../../screens/app/machines'
import {FlipType} from '../../shared/types'
import {Debug} from '../../shared/components/components'
import {flipsMachine} from '../../screens/flips/machines'
import {useIdentityState} from '../../shared/providers/identity-context'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {Notification} from '../../shared/components/notifications'
import {NotificationType} from '../../shared/providers/notification-context'

function FlipListPage({
  identity: {
    flips: knownFlips,
    requiredFlips: requiredFlipsNumber,
    availableFlips: availableFlipsNumber,
    flipKeyWordPairs,
    flipKeyWordPairs: availableKeywords,
  },
  chainState: {syncing, offline, loading},
}) {
  // const [
  //   {
  //     context: {
  //       identity: {
  //         flips: knownFlips,
  //         requiredFlips: requiredFlipsNumber,
  //         availableFlips: availableFlipsNumber,
  //         flipKeyWordPairs,
  //       },
  //       flipsRef,
  //     },
  //   },
  // ] = useAppMachine()

  const toast = useToast()

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
  const {flips} = current.context

  const readyState = state => ({ready: {dirty: state}})

  // eslint-disable-next-line no-nested-ternary
  const filteredFlips = current.matches(readyState('active'))
    ? flips.filter(({type}) =>
        [FlipType.Publishing, FlipType.Published].includes(type)
      )
    : // eslint-disable-next-line no-nested-ternary
    current.matches(readyState('drafts'))
    ? flips.filter(({type}) => [FlipType.Draft].includes(type))
    : current.matches(readyState('archive'))
    ? flips.filter(({type}) => [FlipType.Archived].includes(type))
    : []

  const madeFlipsNumber = (knownFlips || []).length

  const remainingRequiredFlips = requiredFlipsNumber - madeFlipsNumber
  const remainingOptionalFlips =
    availableFlipsNumber - Math.max(requiredFlipsNumber, madeFlipsNumber)

  const missingFlipsNumber = madeFlipsNumber - filteredFlips.length

  const usedWords = (flipKeyWordPairs || [])
    .filter(({used}) => used)
    .slice(0, missingFlipsNumber)
    .map(({id, words}) => ({
      id,
      words: words.map(global.loadKeyword),
    }))

  return (
    <Layout syncing={syncing} offline={offline} loading={loading}>
      <Page>
        <PageTitle>My Flips</PageTitle>
        <Flex justify="space-between" align="center" alignSelf="stretch" mb={8}>
          <FlipFilter
            defaultValue="Active"
            onChange={value => send(`FILTER_${value.toUpperCase()}`)}
          >
            <FlipFilterOption value="Active">Active</FlipFilterOption>
            <FlipFilterOption value="Drafts">Drafts</FlipFilterOption>
            <FlipFilterOption value="Archive">Archived</FlipFilterOption>
          </FlipFilter>
          <IconLink href="/flips/new" icon="plus-solid">
            Add flip
          </IconLink>
        </Flex>
        {current.matches('ready.dirty.active') &&
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
                  ? `Please submit ${remainingRequiredFlips} required flips.`
                  : null}{' '}
                {remainingOptionalFlips
                  ? `You can also submit ${remainingOptionalFlips} optional flips if you want.`
                  : null}
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
            <Image src="/flips-cant-icn.svg" />
          </Flex>
        )}

        {current.matches('ready.dirty') && (
          <FlipCardList>
            {filteredFlips.map(({id, ref}) => (
              <FlipCard key={id} flip={ref} />
            ))}
            {current.matches('ready.dirty.active') && (
              <>
                {Array.from({length: missingFlipsNumber}, (_, idx) => (
                  <Box>
                    <EmptyFlipBox>
                      <Image src="/flips-cant-icn.svg" />
                    </EmptyFlipBox>
                    <Box mt={4}>
                      <FlipCardTitle>
                        {formatKeywords(usedWords[idx].words)}
                      </FlipCardTitle>
                      <FlipCardSubtitle>Missing on client</FlipCardSubtitle>
                    </Box>
                  </Box>
                ))}
                {Array.from({length: remainingRequiredFlips}, (flip, idx) => (
                  <RequiredFlip
                    key={idx}
                    title={`Flip #${idx + 1}`}
                    {...flip}
                  />
                ))}
                {Array.from({length: remainingOptionalFlips}, (flip, idx) => (
                  <OptionalFlip
                    key={idx}
                    title={`Flip #${remainingRequiredFlips + idx}`}
                    {...flip}
                  />
                ))}
              </>
            )}
          </FlipCardList>
        )}

        <Box position="absolute" left={6} bottom={6}>
          <Debug>{current.value}</Debug>
        </Box>
      </Page>
    </Layout>
  )
}

// eslint-disable-next-line react/prop-types
function FlipCard({flip}) {
  const [current, send] = useService(flip)
  const {id, keywords, images, type, createdAt} = current.context

  const {colors} = useTheme()

  const isDraft = type === FlipType.Draft

  return (
    <Box position="relative">
      <FlipCardImageBox>
        {[FlipType.Publishing, FlipType.Failed].includes(type) && (
          <FlipOverlay
            backgroundImage={
              // eslint-disable-next-line no-nested-ternary
              type === FlipType.Publishing
                ? `linear-gradient(to top, ${
                    colors.warning[500]
                  }, ${transparentize(100, colors.warning[500])})`
                : type === FlipType.Failed
                ? `linear-gradient(to top, ${colors.red[500]}, ${transparentize(
                    100,
                    colors.red['0']
                  )})`
                : ''
            }
          >
            <FlipOverlayStatus>
              <FlipOverlayIcon name="info-solid" />
              <FlipOverlayText>
                {type === FlipType.Publishing && 'Mining...'}
                {type === FlipType.Failed && 'Mining error'}
              </FlipOverlayText>
            </FlipOverlayStatus>
          </FlipOverlay>
        )}
        <FlipCardImage src={images[0]} />
      </FlipCardImageBox>
      <Flex justifyContent="space-between" alignItems="flex-start" mt={4}>
        <Box>
          <FlipCardTitle>
            {keywords.words
              ? formatKeywords(keywords.words)
              : 'Missing keywords'}
          </FlipCardTitle>
          <FlipCardSubtitle>
            {new Date(createdAt).toLocaleDateString()}
          </FlipCardSubtitle>
        </Box>
        <FlipCardMenu>
          {isDraft && (
            <>
              <FlipCardMenuItem onClick={() => send('PUBLISH', {id})}>
                <FlipCardMenuItemIcon name="upload" size={5} mr={2} />
                Submit flip
              </FlipCardMenuItem>
              <FlipCardMenuItem>
                <NextLink href={`/flips/edit?id=${id}`}>
                  <Flex>
                    <FlipCardMenuItemIcon name="edit" size={5} mr={2} />
                    Edit flip
                  </Flex>
                </NextLink>
              </FlipCardMenuItem>
              <MenuDivider color="rgb(232, 234, 237)" my={2} width="145px" />
            </>
          )}
          <FlipCardMenuItem onClick={() => send('DELETE', {id})}>
            <FlipCardMenuItemIcon
              name="delete"
              size={5}
              mr={2}
              color="red.500"
            />
            Delete flip
          </FlipCardMenuItem>
        </FlipCardMenu>
      </Flex>
    </Box>
  )
}

export default function EnrichedFlipListPage() {
  const chainState = useChainState()

  const identity = useIdentityState()

  if (chainState && identity.address) {
    return <FlipListPage identity={identity} chainState={chainState} />
  }

  return null
}
