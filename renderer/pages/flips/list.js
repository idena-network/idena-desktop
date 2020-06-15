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
import dayjs from 'dayjs'
import {useTranslation} from 'react-i18next'
import {Page, PageTitle} from '../../screens/app/components'
import {
  FlipCardImage,
  FlipCardTitle,
  FlipCardSubtitle,
  FlipFilter,
  FlipFilterOption,
  RequiredFlipPlaceholder,
  OptionalFlipPlaceholder,
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
import {FlipType} from '../../shared/types'
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

  const {syncing, offline, loading} = useChainState()

  const {
    flips: knownFlips,
    requiredFlips: requiredFlipsNumber,
    availableFlips: availableFlipsNumber,
    flipKeyWordPairs: availableKeywords,
  } = useIdentityState()

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
        [FlipType.Publishing, FlipType.Published, FlipType.Invalid].includes(
          type
        )
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
            {filteredFlips.map(({id, ref}) => (
              <FlipCard key={id} flip={ref} />
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
                    title={`Flip #${idx + 1}`}
                    {...flip}
                  />
                ))}
                {Array.from({length: remainingOptionalFlips}, (flip, idx) => (
                  <OptionalFlipPlaceholder
                    key={idx}
                    title={`Flip #${remainingRequiredFlips + idx}`}
                    {...flip}
                  />
                ))}
              </>
            )}
          </FlipCardList>
        )}

        {global.isDev && (
          <Box position="absolute" left={6} bottom={6} zIndex="popover">
            <Debug>{current.value}</Debug>
          </Box>
        )}
      </Page>
    </Layout>
  )
}

// eslint-disable-next-line react/prop-types
function FlipCard({flip}) {
  const {t} = useTranslation()

  const [current, send] = useService(flip)
  const {id, keywords, originalOrder, images, type, createdAt} = current.context

  const {colors} = useTheme()

  const isDraft = type === FlipType.Draft

  return (
    <Box position="relative">
      <FlipCardImageBox>
        {[FlipType.Publishing, FlipType.Invalid].includes(type) && (
          <FlipOverlay
            backgroundImage={
              // eslint-disable-next-line no-nested-ternary
              type === FlipType.Publishing
                ? `linear-gradient(to top, ${
                    colors.warning[500]
                  }, ${transparentize(100, colors.warning[500])})`
                : type === FlipType.Invalid
                ? `linear-gradient(to top, ${colors.red[500]}, ${transparentize(
                    100,
                    colors.red[500]
                  )})`
                : ''
            }
          >
            <FlipOverlayStatus>
              <FlipOverlayIcon name="info-solid" />
              <FlipOverlayText>
                {type === FlipType.Publishing && t('Mining...')}
                {type === FlipType.Invalid && t('Mining error')}
              </FlipOverlayText>
            </FlipOverlayStatus>
          </FlipOverlay>
        )}
        <FlipCardImage src={images[originalOrder ? originalOrder[0] : 0]} />
      </FlipCardImageBox>
      <Flex justifyContent="space-between" alignItems="flex-start" mt={4}>
        <Box>
          <FlipCardTitle>
            {keywords.words
              ? formatKeywords(keywords.words)
              : t('Missing keywords')}
          </FlipCardTitle>
          <FlipCardSubtitle>
            {dayjs(createdAt).format('d.MM.YYYY, H:mm')}
          </FlipCardSubtitle>
        </Box>
        <FlipCardMenu>
          {isDraft && (
            <>
              <FlipCardMenuItem onClick={() => send('PUBLISH', {id})}>
                <FlipCardMenuItemIcon name="upload" size={5} mr={2} />
                {t('Submit flip')}
              </FlipCardMenuItem>
              <FlipCardMenuItem>
                <NextLink href={`/flips/edit?id=${id}`}>
                  <Flex>
                    <FlipCardMenuItemIcon name="edit" size={5} mr={2} />
                    {t('Edit flip')}
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
            {t('Delete flip')}
          </FlipCardMenuItem>
        </FlipCardMenu>
      </Flex>
    </Box>
  )
}
