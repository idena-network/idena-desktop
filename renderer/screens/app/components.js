/* eslint-disable react/prop-types */
import {
  Flex,
  Heading,
  Text,
  Stack,
  Box,
  Icon,
  Alert,
  AlertTitle,
  Link,
  Button,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import NextLink from 'next/link'
import {useRouter} from 'next/router'
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogBody,
} from '../../shared/components/components'
import {PrimaryButton} from '../../shared/components/button'
import {
  useAutoUpdateState,
  useAutoUpdateDispatch,
} from '../../shared/providers/update-context'
import {EpochPeriod, IdentityStatus} from '../../shared/types'
import {loadValidationState} from '../validation/utils'
import {pluralize} from '../../shared/utils/string'

export function LayoutContainer(props) {
  return (
    <Flex
      align="stretch"
      flexWrap="wrap"
      color="brand.gray"
      fontSize="md"
      minH="100vh"
      {...props}
    />
  )
}

export function Page(props) {
  return (
    <Flex
      flexDirection="column"
      align="flex-start"
      flexBasis={0}
      flexGrow={999}
      maxH="100vh"
      minW="50%"
      px={20}
      py={6}
      overflowY="auto"
      {...props}
    />
  )
}

export function PageSidebar(props) {
  return (
    <Flex
      bg="gray.200"
      flexDirection="column"
      flexBasis={200}
      flexGrow={1}
      p={2}
      w={200}
      maxW={200}
      {...props}
    />
  )
}

export function PageTitle(props) {
  return (
    <Heading as="h1" fontSize="xl" fontWeight={500} py={2} mb={4} {...props} />
  )
}

export function Logo() {
  return <Icon name="logo" size="56px" mx="auto" my={8} />
}

export function Nav(props) {
  return <Flex direction="column" mx={2} {...props} />
}

export function NavItem({href, icon, children}) {
  const {pathname} = useRouter()
  const isActive = pathname.startsWith(href)

  return (
    <NextLink href={href} passHref>
      <Link
        bg={isActive ? 'xblack.016' : ''}
        color={isActive ? 'white' : 'xwhite.050'}
        fontWeight={500}
        height={8}
        px={2}
        py="3/2"
        rounded="lg"
        _hover={{bg: 'gray.10', color: 'white'}}
        _active={{
          bg: 'xblack.016',
        }}
        _focus={{outline: 'none'}}
      >
        <Icon name={icon} size={5} mr={2} />
        {children}
      </Link>
    </NextLink>
  )
}

export function ConnectionStatus(props) {
  return (
    <Stack
      isInline
      alignItems="start"
      alignSelf="start"
      px={3}
      py={1}
      rounded="xl"
      {...props}
    ></Stack>
  )
}

export function ConnectionStatusText(props) {
  return <Text fontWeight={500} {...props}></Text>
}

export function Bandwidth({strength, color}) {
  return (
    <Stack
      isInline
      spacing="2px"
      align="flex-end"
      px="px"
      pt="2px"
      pb="3px"
      mr={1}
    >
      {Array.from({length: 4}).map((_, idx) => (
        <BandwidthItem
          key={idx}
          bg={`${color}.${idx < strength ? '400' : '100'}`}
          height={`${(idx + 1) * 3}px`}
          width="2px"
        />
      ))}
    </Stack>
  )
}

function BandwidthItem(props) {
  return <Box rounded="sm" transition="background 0.3s ease" {...props}></Box>
}

export function CurrentTask({epoch: {epoch, currentPeriod: period}, identity}) {
  const {t} = useTranslation()

  if (!period || !identity.state) return null

  switch (period) {
    case EpochPeriod.None: {
      const {
        flips,
        requiredFlips: requiredFlipsNumber,
        availableFlips: availableFlipsNumber,
        state: status,
        canActivateInvite,
      } = identity

      switch (true) {
        case canActivateInvite:
          return (
            <Link href="/profile" color="white">
              {t('Activate invite')}
            </Link>
          )

        case [
          IdentityStatus.Human,
          IdentityStatus.Verified,
          IdentityStatus.Newbie,
        ].includes(status): {
          const publishedFlipsNumber = (flips || []).length
          const remainingRequiredFlipsNumber =
            requiredFlipsNumber - publishedFlipsNumber
          const optionalFlipsNumber =
            availableFlipsNumber -
            Math.max(requiredFlipsNumber, publishedFlipsNumber)

          const shouldSendFlips = remainingRequiredFlipsNumber > 0

          return shouldSendFlips ? (
            <Link href="/flips/list" color="white">
              Create {remainingRequiredFlipsNumber} required{' '}
              {pluralize('flip', remainingRequiredFlipsNumber)}
            </Link>
          ) : (
            `Wait for validation${
              optionalFlipsNumber > 0
                ? ` or create ${optionalFlipsNumber} optional ${pluralize(
                    'flip',
                    optionalFlipsNumber
                  )}`
                : ''
            }`
          )
        }

        case [
          IdentityStatus.Candidate,
          IdentityStatus.Suspended,
          IdentityStatus.Zombie,
        ].includes(status):
          return t('Wait for validation')

        default:
          return '...'
      }
    }

    case EpochPeriod.ShortSession:
    case EpochPeriod.LongSession: {
      const validationState = loadValidationState()

      switch (true) {
        case [IdentityStatus.Undefined, IdentityStatus.Invite].includes(
          identity.state
        ):
          return t(
            'Can not start validation session because you did not activate invite'
          )

        case [
          IdentityStatus.Candidate,
          IdentityStatus.Suspended,
          IdentityStatus.Zombie,
          IdentityStatus.Newbie,
          IdentityStatus.Verified,
          IdentityStatus.Human,
        ].includes(identity.state): {
          if (validationState) {
            const {
              done,
              context: {epoch: lastValidationEpoch},
            } = validationState

            const isValidated = [
              IdentityStatus.Newbie,
              IdentityStatus.Verified,
              IdentityStatus.Human,
            ].includes(identity.state)

            if (lastValidationEpoch === epoch)
              return done ? (
                t(`Wait for validation end`)
              ) : (
                <Link href="/validation" color="white">
                  {t('Validate')}
                </Link>
              )

            return isValidated
              ? t(
                  'Can not start validation session because you did not submit flips.'
                )
              : 'Starting your validation session...' // this is not normal thus not localized
          }
          return '...'
        }

        default:
          return '...'
      }
    }

    case EpochPeriod.FlipLottery:
      return t('Shuffling flips...')

    case EpochPeriod.AfterLongSession:
      return t(`Wait for validation end`)

    default:
      return '...'
  }
}

export function ActionPanel(props) {
  return <Stack spacing="px" mt={6} {...props} />
}

export function ActionItem({title, value, children, ...props}) {
  return (
    <Box bg="gray.10" fontWeight={500} mx={2} p={3} pt={2} {...props}>
      <Text color="xwhite.050">{title}</Text>
      <Box color="white">{value || children}</Box>
    </Box>
  )
}

export function VersionPanel(props) {
  return <Box mt="auto" ml={4} {...props} />
}

export function VersionText(props) {
  return <Text color="xwhite.050" fontWeight={500} {...props} />
}

export function UpdateExternalNodeDialog() {
  const {showExternalUpdateModal} = useAutoUpdateState()
  const {hideExternalNodeUpdateModal} = useAutoUpdateDispatch()

  const {t} = useTranslation()

  return (
    <Dialog
      isOpen={showExternalUpdateModal}
      onClose={hideExternalNodeUpdateModal}
    >
      <DialogHeader>{t('Cannot update remote node')}</DialogHeader>
      <DialogBody>
        <Text>
          Please, run built-in at the{' '}
          <Link href="/settings/node" onClick={hideExternalNodeUpdateModal}>
            settings
          </Link>{' '}
          page to enjoy automatic updates.
        </Text>
        <Text>{t('Otherwise, please update your remote node manually.')}</Text>
      </DialogBody>
      <DialogFooter>
        <PrimaryButton onClick={hideExternalNodeUpdateModal}>
          {t('Okay, got it')}
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
}

export function OfflineApp({onRetry}) {
  // also 👇
  // handle built-in node behaviour here: starting, downloading, all that stuff
  // tackle with built-in node starting
  // tackle with built-in node failure to start
  return (
    <Flex direction="column" flex={99} minW="50%">
      <Alert status="error" bg="red.500" px={4} py={3} justifyContent="center">
        <AlertTitle color="white" fontWeight={500}>
          Offline
        </AlertTitle>
      </Alert>
      <Stack
        spacing={4}
        flex={1}
        align="center"
        justify="center"
        bg="rgb(69,72,77)"
      >
        <Heading color="white" fontSize="lg" fontWeight={500}>
          Your node is offline
        </Heading>
        <Box>
          <PrimaryButton onClick={onRetry}>Run the built-in node</PrimaryButton>
        </Box>
        <Text color="white">
          If you have already node running, please check your connection{' '}
          <Link color="brandBlue.500" href="/settings/node">
            settings
          </Link>
        </Text>
      </Stack>
    </Flex>
  )
}

export function UpdateButton({version, children, ...props}) {
  return (
    <Button
      bg="white"
      color="brandGray.500"
      flexDirection="column"
      alignItems="center"
      minH={12}
      w="full"
      _hover={null}
      {...props}
    >
      <Text fontWeight={500}>{children}</Text>
      <Text color="muted" fontWeight={400}>
        {version}
      </Text>
    </Button>
  )
}
