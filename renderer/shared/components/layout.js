/* eslint-disable react/prop-types */
import React from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {
  Flex,
  Text,
  Stack,
  Image,
  Box,
  Heading,
  UnorderedList,
  ListItem,
  useDisclosure,
  RadioGroup,
  Radio,
  useToast,
  Alert,
  Link,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react'
import {useMachine} from '@xstate/react'
import semver from 'semver'
import {assign, createMachine} from 'xstate'
import NextLink from 'next/link'
import Sidebar from './sidebar'
import {useDebounce} from '../hooks/use-debounce'
import {useEpochState} from '../providers/epoch-context'
import {loadPersistentStateValue, persistItem} from '../utils/persist'
import {
  DnaSignInDialog,
  DnaSendDialog,
  DnaRawDialog,
  DnaSendFailedDialog,
  DnaSendSucceededDialog,
  DnaSignDialog,
} from '../../screens/dna/containers'
import {
  useAutoUpdateState,
  useAutoUpdateDispatch,
} from '../providers/update-context'
import {PrimaryButton, SecondaryButton} from './button'
import {FillCenter} from '../../screens/oracles/components'
import {
  Avatar,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  ExternalLink,
  Progress,
  TextLink,
  Toast,
} from './components'
import {ActivateMiningDrawer} from '../../screens/home/components'
import {activateMiningMachine} from '../../screens/home/machines'
import {
  callRpc,
  eitherState,
  shouldShowUpcomingValidationNotification,
  showWindowNotification,
} from '../utils/utils'
import {useChainState} from '../providers/chain-context'
import {useNode} from '../providers/node-context'
import {useSettings, useSettingsState} from '../providers/settings-context'
import {useFailToast} from '../hooks/use-toast'
import {
  DnaLinkMethod,
  useDnaLinkMethod,
  useDnaLinkRedirect,
} from '../../screens/dna/hooks'
import {viewVotingHref} from '../../screens/oracles/utils'
import {useHardFork} from '../../screens/hardfork/hooks'
import {AdBanner} from '../../screens/ads/containers'
import {useRotatingAds} from '../../screens/ads/hooks'
import {ChevronRightIcon, GithubIcon} from './icons'
import {
  useAutoStartLottery,
  useAutoStartValidation,
} from '../../screens/validation/hooks/use-start-validation'
import {useValidationToast} from '../../screens/validation/hooks/use-validation-toast'
import {useIdentityState} from '../providers/identity-context'
import {OfflineBanner} from './layout/offline'
import {TroubleshootingScreen} from '../../screens/troubleshooting'

global.getZoomLevel = global.getZoomLevel || {}

const AVAILABLE_TIMEOUT = global.isDev || global.isTest ? 0 : 1000 * 5

const sendConfirmQuit = () => global.ipcRenderer.send('confirm-quit')

export default function Layout({
  loading,
  syncing,
  offline,
  skipHardForkScreen = false,
  ...props
}) {
  const {t} = useTranslation()

  const debouncedSyncing = useDebounce(syncing, AVAILABLE_TIMEOUT)
  const debouncedOffline = useDebounce(offline, AVAILABLE_TIMEOUT)

  const [zoomLevel, setZoomLevel] = React.useState(
    () => loadPersistentStateValue('settings', 'zoomLevel') || 0
  )

  React.useEffect(() => {
    if (global.isDev) return

    const handleMouseWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault()
        setZoomLevel((level) =>
          Math.min(Math.max(-5, level + e.deltaY * -0.01), 5)
        )
      }
    }

    document.addEventListener('wheel', handleMouseWheel)

    return () => {
      document.removeEventListener('wheel', handleMouseWheel)
    }
  }, [])

  React.useEffect(() => {
    if (global.isDev) return

    if (Number.isFinite(zoomLevel)) {
      global.setZoomLevel(zoomLevel)
      persistItem('settings', 'zoomLevel', zoomLevel)
    }
  }, [zoomLevel])

  const failToast = useFailToast()

  const {nodeRemoteVersion, canUpdateNode} = useAutoUpdateState()
  const {updateNode} = useAutoUpdateDispatch()

  const [
    {
      details: forkDetails,
      isAvailable: isForkAvailable,
      didActivate: didActivateFork,
      didReject: didRejectFork,
    },
    {reject: rejectFork, reset: resetForkVoting},
  ] = useHardFork()

  const isFork =
    !loading &&
    !skipHardForkScreen &&
    canUpdateNode &&
    isForkAvailable &&
    !didRejectFork

  const isSyncing = !loading && debouncedSyncing && !debouncedOffline
  const isOffline = !loading && debouncedOffline && !debouncedSyncing
  const isReady = !loading && !debouncedOffline && !debouncedSyncing

  const isNotOffline = !debouncedOffline && !loading

  const {onOpen: onOpenConfirmQuit, ...confirmQuitDisclosure} = useDisclosure()

  const [{runInternalNode}] = useSettings()

  React.useEffect(() => {
    const handleRequestQuit = async () => {
      if (isReady) {
        try {
          const {online} = await callRpc('dna_identity')
          if (online && runInternalNode && isReady) {
            onOpenConfirmQuit()
          } else {
            sendConfirmQuit()
          }
        } catch {
          sendConfirmQuit()
        }
      } else {
        sendConfirmQuit()
      }
    }

    global.ipcRenderer.on('confirm-quit', handleRequestQuit)

    return () => {
      global.ipcRenderer.removeListener('confirm-quit', handleRequestQuit)
    }
  }, [isReady, onOpenConfirmQuit, runInternalNode])

  const {onOpen: onOpenSignInDialog, ...dnaSignInDisclosure} = useDisclosure()

  const handleReceiveDnaSignInLink = React.useCallback(() => {
    if (isNotOffline) onOpenSignInDialog()
  }, [isNotOffline, onOpenSignInDialog])

  const {
    params: {
      nonce_endpoint: nonceEndpoint,
      authentication_endpoint: authenticationEndpoint,
      favicon_url: faviconUrl,
      ...dnaSignInParams
    },
  } = useDnaLinkMethod(DnaLinkMethod.SignIn, {
    onReceive: handleReceiveDnaSignInLink,
    onInvalidLink: () => {
      failToast({
        title: t('Invalid DNA link'),
        description: t(`You must provide valid URL including protocol version`),
      })
    },
  })

  const {onOpen: onOpenSignDialog, ...dnaSignDisclosure} = useDisclosure()

  const handleReceiveDnaSignLink = React.useCallback(() => {
    if (isNotOffline) onOpenSignDialog()
  }, [isNotOffline, onOpenSignDialog])

  const {
    params: {message: dnaSignMessage, ...dnaSignParams},
  } = useDnaLinkMethod(DnaLinkMethod.Sign, {
    onReceive: handleReceiveDnaSignLink,
    onInvalidLink: () => {
      failToast({
        title: t('Invalid DNA link'),
        description: t(`You must provide valid URL including protocol version`),
      })
    },
  })

  return (
    <LayoutContainer>
      <Sidebar
        isForkAvailable={isForkAvailable}
        didActivateFork={didActivateFork}
        didRejectFork={didRejectFork}
        onResetForkVoting={resetForkVoting}
      />

      {loading && <LoadingApp />}

      {((isFork && !isSyncing && !isOffline) ||
        (isFork && isSyncing && didActivateFork)) && (
        <HardForkScreen
          {...forkDetails}
          version={nodeRemoteVersion}
          didActivateFork={didActivateFork}
          onUpdate={updateNode}
          onReject={rejectFork}
        />
      )}

      {isSyncing && (!isFork || (isFork && !didActivateFork)) && <SyncingApp />}
      {isOffline && <OfflineApp />}
      {isReady && !isFork && <NormalApp {...props} />}

      {Boolean(authenticationEndpoint) && (
        <DnaSignInDialog
          authenticationEndpoint={authenticationEndpoint}
          nonceEndpoint={nonceEndpoint}
          faviconUrl={faviconUrl}
          {...dnaSignInParams}
          {...dnaSignInDisclosure}
          onSignInError={failToast}
        />
      )}

      {Boolean(dnaSignMessage) && (
        <DnaSignDialog
          message={dnaSignMessage}
          {...dnaSignParams}
          {...dnaSignDisclosure}
          onSignError={failToast}
        />
      )}

      <UpdateExternalNodeDialog />

      <ConfirmQuitDialog {...confirmQuitDisclosure} />
    </LayoutContainer>
  )
}

function LayoutContainer(props) {
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

function NormalApp({skipBanner, children}) {
  const {t} = useTranslation()

  const epoch = useEpochState()

  useAutoStartLottery()
  useAutoStartValidation()

  useValidationToast()

  const [validationNotificationEpoch, setValidationNotificationEpoch] =
    React.useState(
      () => loadPersistentStateValue('validationNotification', 'epoch') || 0
    )

  React.useEffect(() => {
    if (
      !shouldShowUpcomingValidationNotification(
        epoch,
        validationNotificationEpoch
      )
    ) {
      return
    }
    showWindowNotification(
      t('Idena validation will start soon'),
      t('Keep your app opened'),
      () => {
        global.ipcRenderer.send('showMainWindow')
      }
    )
    const newEpoch = epoch.epoch + 1
    setValidationNotificationEpoch(newEpoch)
    persistItem('validationNotification', 'epoch', newEpoch)
  }, [epoch, validationNotificationEpoch, setValidationNotificationEpoch, t])

  const failToast = useFailToast()

  const dnaSendSucceededDisclosure = useDisclosure()

  const dnaSendFailedDisclosure = useDisclosure()

  const [dnaSendResponse, setDnaSendResponse] = React.useState()

  const handleInvalidDnaLink = React.useCallback(() => {
    failToast({
      title: t('Invalid DNA link'),
      description: t(`You must provide valid URL including protocol version`),
    })
  }, [failToast, t])

  const dnaSendDisclosure = useDisclosure()

  const {params: dnaSendParams} = useDnaLinkMethod(DnaLinkMethod.Send, {
    onReceive: dnaSendDisclosure.onOpen,
    onInvalidLink: handleInvalidDnaLink,
  })

  const dnaRawTxDisclosure = useDisclosure()

  const {params: dnaRawTxParams} = useDnaLinkMethod(DnaLinkMethod.RawTx, {
    onReceive: dnaRawTxDisclosure.onOpen,
    onInvalidLink: handleInvalidDnaLink,
  })

  useDnaLinkRedirect(
    DnaLinkMethod.Invite,
    ({address}) => `/contacts?new&address=${address}`,
    {
      onInvalidLink: handleInvalidDnaLink,
    }
  )

  useDnaLinkRedirect(
    DnaLinkMethod.Vote,
    ({address}) => viewVotingHref(address),
    {
      onInvalidLink: handleInvalidDnaLink,
    }
  )

  const ads = useRotatingAds()
  const hasRotatingAds = ads?.length > 0

  return (
    <Flex as="section" direction="column" flex={1} h="100vh" overflowY="auto">
      {hasRotatingAds && !skipBanner && <AdBanner />}

      {children}

      <DnaSendDialog
        {...dnaSendParams}
        {...dnaSendDisclosure}
        onDepositSuccess={({hash, url}) => {
          setDnaSendResponse({hash, url})
          dnaSendSucceededDisclosure.onOpen()
        }}
        onDepositError={({error, url}) => {
          setDnaSendResponse({error, url})
          dnaSendFailedDisclosure.onOpen()
        }}
        onSendTxFailed={failToast}
      />

      <DnaRawDialog
        {...dnaRawTxParams}
        {...dnaRawTxDisclosure}
        onSendSuccess={({hash, url}) => {
          setDnaSendResponse({hash, url})
          dnaSendSucceededDisclosure.onOpen()
        }}
        onSendError={({error, url}) => {
          setDnaSendResponse({error, url})
          dnaSendFailedDisclosure.onOpen()
        }}
        onSendRawTxFailed={failToast}
      />

      <DnaSendSucceededDialog
        {...dnaSendResponse}
        {...dnaSendSucceededDisclosure}
      />

      <DnaSendFailedDialog
        onRetrySucceeded={({hash, url}) => {
          setDnaSendResponse({hash, url})
          dnaSendFailedDisclosure.onClose()
          dnaSendSucceededDisclosure.onOpen()
        }}
        onRetryFailed={({error, url}) => {
          setDnaSendResponse({error, url})
        }}
        {...dnaSendResponse}
        {...dnaSendFailedDisclosure}
      />
    </Flex>
  )
}

function SyncingApp() {
  const {t} = useTranslation()

  const {currentBlock, highestBlock, genesisBlock, wrongTime, message} =
    useChainState()

  const {address} = useIdentityState()

  const [current] = useMachine(
    createMachine({
      context: {
        peers: [],
      },
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            src: () => callRpc('net_peers'),
            onDone: {
              target: 'done',
              actions: [assign({peers: (_, {data}) => data})],
            },
          },
        },
        done: {
          after: {
            5000: 'loading',
          },
        },
      },
    })
  )
  const {peers} = current.context

  const {runInternalNode, useExternalNode} = useSettingsState()

  return (
    <FillCenter bg="graphite.500" color="white" position="relative">
      <Flex
        align="center"
        justify="center"
        bg="orange.500"
        py={3}
        fontWeight={500}
        position="absolute"
        top={0}
        left={0}
        w="full"
      >
        {t('Synchronizing...')}
      </Flex>
      <Stack spacing={10} w="md">
        {Boolean(address) && (
          <Stack isInline spacing={6} align="center" py={2}>
            <Avatar address={address} boxSize={20} />
            <Heading fontSize="lg" fontWeight={500} wordBreak="break-all">
              {address}
            </Heading>
          </Stack>
        )}
        <Stack spacing={3}>
          <Flex justify="space-between">
            <Box>
              <Heading fontSize="lg" fontWeight={500}>
                {t('Synchronizing blocks')}
              </Heading>
              <Box
                fontSize="mdx"
                fontWeight={500}
                color="muted"
                style={{fontVariantNumeric: 'tabular-nums'}}
              >
                {highestBlock ? (
                  <>
                    {t('{{numBlocks}} blocks left', {
                      numBlocks: Number.isNaN(highestBlock - currentBlock)
                        ? '...'
                        : Math.max(
                            highestBlock - currentBlock,
                            0
                          ).toLocaleString(),
                    })}{' '}
                    (
                    {t('{{currentBlock}} out of {{highestBlock}}', {
                      currentBlock:
                        currentBlock && currentBlock.toLocaleString(),
                      highestBlock:
                        (highestBlock && highestBlock.toLocaleString()) ||
                        '...',
                    })}
                    )
                  </>
                ) : (
                  <>
                    {t('{{currentBlock}} out of {{highestBlock}}', {
                      currentBlock:
                        currentBlock && currentBlock.toLocaleString(),
                      highestBlock: '...',
                    })}
                  </>
                )}
              </Box>
            </Box>
            <Box>
              <Text as="span" color="muted">
                {t('Peers connected')}:{' '}
              </Text>
              {peers.length}
            </Box>
          </Flex>
          <Progress
            value={currentBlock}
            min={genesisBlock || 0}
            max={highestBlock || Number.MAX_SAFE_INTEGER}
          />
        </Stack>

        {runInternalNode && !useExternalNode && (
          <Text color="xwhite.040">
            <Trans i18nKey="autoActivateMining" t={t}>
              If your identity status is validated the mining will be activated
              automatically once the node is synchronized. Please change{' '}
              <TextLink href="/settings/node">settings</TextLink>
            </Trans>
          </Text>
        )}

        {message && (
          <Alert status="error" bg="red.500" borderRadius="lg">
            {message}
          </Alert>
        )}

        {wrongTime && (
          <Alert status="error" bg="red.500" borderRadius="lg">
            {t(
              'Please check your local clock. The time must be synchronized with internet time in order to have connections with other peers.'
            )}
          </Alert>
        )}
      </Stack>
    </FillCenter>
  )
}

function LoadingApp() {
  const {t} = useTranslation()

  return (
    <FillCenter bg="graphite.500" color="white" fontWeight={500}>
      {t('Please wait...')}
    </FillCenter>
  )
}

function OfflineApp() {
  const [{nodeReady, nodeFailed, unsupportedMacosVersion}] = useNode()

  const [
    {useExternalNode, runInternalNode},
    {toggleRunInternalNode, toggleUseExternalNode},
  ] = useSettings()

  const {nodeProgress} = useAutoUpdateState()

  const {t} = useTranslation()

  const isDownloadingBuiltinNode =
    !nodeReady &&
    !useExternalNode &&
    runInternalNode &&
    !nodeFailed &&
    nodeProgress

  const isExternalNodeOffline = useExternalNode || !runInternalNode

  const isStartingBuiltinNode =
    !useExternalNode &&
    runInternalNode &&
    !unsupportedMacosVersion &&
    (nodeReady || (!nodeReady && !nodeFailed && !nodeProgress))

  const isFailedBuiltinNode = nodeFailed && runInternalNode && !useExternalNode

  const isUnsupportedMacosVersion =
    runInternalNode && !useExternalNode && unsupportedMacosVersion

  const toMb = (b) =>
    (b / (1024 * 1024)).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })

  return (
    <FillCenter bg="graphite.500" color="white" position="relative">
      <OfflineBanner />

      {isDownloadingBuiltinNode && (
        <Stack spacing={3} w="md">
          <Stack isInline spacing={4} align="center">
            <Image src="/static/idena_white.svg" alt="logo" boxSize={12} />
            <Stack spacing={1} flex={1}>
              <Heading fontSize="lg" fontWeight={500}>
                {t('Downloading Idena Node...')}
              </Heading>
              <Flex justify="space-between" alignSelf="stretch">
                <Text color="xwhite.050">
                  {t('Version {{version}}', {
                    version: nodeProgress.version,
                  })}
                </Text>
                <Text>
                  {toMb(nodeProgress.transferred)} MB{' '}
                  <Text as="span" color="xwhite.040">
                    out of
                  </Text>{' '}
                  {toMb(nodeProgress.length)} MB
                </Text>
              </Flex>
            </Stack>
          </Stack>
          <Progress value={nodeProgress.percentage} max={100} />
        </Stack>
      )}

      {isExternalNodeOffline && (
        <Stack spacing={5} w={416}>
          <Heading fontSize="lg" fontWeight={500}>
            {t('Your {{nodeType}} node is offline', {
              nodeType: useExternalNode ? 'external' : '',
            })}
          </Heading>
          <Stack spacing={4} align="flex-start">
            <PrimaryButton
              onClick={() => {
                if (!runInternalNode) {
                  toggleRunInternalNode(true)
                } else {
                  toggleUseExternalNode(false)
                }
              }}
            >
              {t('Run the built-in node')}
            </PrimaryButton>
            <Text color="xwhite.050" fontSize="mdx">
              <Trans i18nKey="nodeOfflineCheckSettings" t={t}>
                If you have already node running, please check your connection{' '}
                <TextLink href="/settings/node">settings</TextLink>
              </Trans>
            </Text>
          </Stack>
        </Stack>
      )}

      {isStartingBuiltinNode && (
        <Heading fontSize="mdx" fontWeight={500}>
          {t('Idena Node is starting...')}
        </Heading>
      )}

      {isFailedBuiltinNode && <TroubleshootingScreen />}

      {isUnsupportedMacosVersion && (
        <Stack spacing={5} w={416}>
          <Heading fontSize="mdx" fontWeight={500}>
            {t(
              'Can not start built-in node. The minimum required version is macOS Catalina'
            )}
          </Heading>
          <Stack spacing={4} align="flex-start">
            <Text color="xwhite.050" fontSize="mdx">
              <Trans i18nKey="unsupportedMacosVersion" t={t}>
                Please update your macOS or{' '}
                <TextLink href="/settings/node">
                  connect to remote node
                </TextLink>
                .
              </Trans>
            </Text>
          </Stack>
        </Stack>
      )}
    </FillCenter>
  )
}

function HardForkScreen({
  version,
  changes,
  didActivateFork,
  startActivationDate,
  endActivationDate,
  onUpdate,
  onReject,
}) {
  const {t} = useTranslation()

  const identity = useIdentityState()

  const {
    isOpen: isOpenRejectDialog,
    onOpen: onOpenRejectDialog,
    onClose: onCloseRejectDialog,
  } = useDisclosure()

  const toast = useToast()

  const [currentActivateMining, sendActivateMining] = useMachine(
    activateMiningMachine,
    {
      context: {
        isOnline: identity.online,
        delegatee: identity.delegatee,
        delegationEpoch: identity.delegationEpoch,
      },
      actions: {
        onError: (_, {data: {message}}) => {
          toast({
            status: 'error',
            // eslint-disable-next-line react/display-name
            render: () => <Toast title={message} status="error" />,
          })
        },
      },
    }
  )
  const {mode} = currentActivateMining.context

  const shouldActivateMining =
    !didActivateFork &&
    (identity.isValidated || identity.isPool) &&
    !identity.online

  const canVote =
    !didActivateFork &&
    (identity.isValidated || identity.isPool) &&
    identity.online

  return (
    <>
      <FillCenter bg="graphite.500">
        <Stack spacing={10} w="md">
          <Stack spacing={6}>
            <Stack spacing={8}>
              <Stack isInline spacing={5} align="center">
                <Image
                  src="/static/idena_white.svg"
                  alt={t('Idena logo')}
                  boxSize={20}
                />
                <Stack spacing={1}>
                  <Heading fontSize="lg" fontWeight={500} color="white">
                    {t('Hard fork update')}
                  </Heading>
                  <Box>
                    <Text color="muted" fontSize="mdx">
                      {t('The new node version is available: {{version}}', {
                        version,
                        nsSeparator: '!!',
                      })}
                    </Text>
                    <ExternalLink href="https://scan.idena.io/hardfork">
                      {t('See voting stats')}
                    </ExternalLink>
                  </Box>
                </Stack>
              </Stack>
              <Stack spacing={1} color="xwhite.050">
                <Text color="white">{t('Details')}</Text>
                <Box bg="xblack.016" rounded="md" p={1}>
                  <Stack spacing={5} p={3} h={188} overflowY="auto">
                    <Stack spacing={3}>
                      <Text color="white">{t('Changes')}</Text>
                      <UnorderedList spacing="2" pl="4">
                        {changes.map((change) => (
                          <ListItem key={change}>{change}</ListItem>
                        ))}
                        {changes.length === 0 && <Text>No changes 🤷‍♂️</Text>}
                      </UnorderedList>
                    </Stack>
                    <Stack spacing={3}>
                      <Text color="white">
                        {t('Hard fork activation schedule')}
                      </Text>
                      <UnorderedList spacing="2" pl="4">
                        <ListItem>
                          {t(
                            'Hard fork will be activated at any date after {{startActivationDate}}',
                            {
                              startActivationDate: new Date(
                                startActivationDate
                              ).toLocaleString(),
                            }
                          )}
                        </ListItem>
                        <ListItem>
                          {t(
                            'Hard fork will be blocked on {{endActivationDate}} if voting criteria are not met',
                            {
                              endActivationDate: new Date(
                                endActivationDate
                              ).toLocaleString(),
                            }
                          )}
                        </ListItem>
                      </UnorderedList>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Stack>
            <Stack isInline justify="flex-end">
              <SecondaryButton
                onClick={() => {
                  global.openExternal(
                    `https://github.com/idena-network/idena-go/releases/tag/v${semver.minVersion(
                      `<=${version} >=${`${semver.major(
                        version
                      )}.${semver.minor(version)}.0`}`,
                      version
                    )}`
                  )
                }}
              >
                <Stack isInline align="center">
                  <GithubIcon boxSize="4" color="blue.500" />
                  <Text>{t('Check on Github')}</Text>
                </Stack>
              </SecondaryButton>
              {!canVote && (
                <PrimaryButton onClick={onUpdate}>
                  {t('Update Node Version')}
                </PrimaryButton>
              )}
            </Stack>
          </Stack>

          {shouldActivateMining && (
            <Stack
              spacing="2.5"
              align="flex-start"
              bg="xwhite.010"
              rounded="lg"
              py={4}
              px={6}
            >
              <Text color="xwhite.050" fontSize="mdx">
                {t(`You can not vote for the hard fork update since your mining status is deactivated.
                Please activate your mining status to vote or update the node.`)}
              </Text>
              <PrimaryButton
                variant="link"
                color="white"
                fontSize="sm"
                textDecoration="none"
                _active={{}}
                _focus={{}}
                onClick={() => {
                  sendActivateMining('SHOW')
                }}
              >
                {t('Activate mining status')}
                <ChevronRightIcon boxSize="4" />
              </PrimaryButton>
            </Stack>
          )}

          {canVote && (
            <form
              onSubmit={(e) => {
                e.preventDefault()

                const {votingOption} = e.target.elements

                if (votingOption.value === 'approve') onUpdate()
                else onOpenRejectDialog()
              }}
            >
              <Stack
                spacing={6}
                bg="xwhite.010"
                color="white"
                rounded="lg"
                px={10}
                py={8}
              >
                <Heading as="h4" fontSize="lg" fontWeight={500}>
                  {t('Do you support upcoming changes?')}
                </Heading>
                <Stack spacing={3}>
                  <Text color="xwhite.050" fontSize="sm">
                    {t('Choose an option to vote')}
                  </Text>
                  <RadioGroup name="votingOption">
                    <Stack spacing="2">
                      <Radio value="approve" borderColor="gray.100">
                        {t('Yes, use node version {{version}}', {version})}
                      </Radio>
                      <Radio value="reject" borderColor="gray.100">
                        {t('No, reject node {{version}}', {version})}
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </Stack>
                <Box alignSelf="flex-end">
                  <PrimaryButton type="submit">{t('Vote')}</PrimaryButton>
                </Box>
              </Stack>
            </form>
          )}
        </Stack>
      </FillCenter>

      {identity.address && (
        <ActivateMiningDrawer
          mode={mode}
          isOpen={eitherState(currentActivateMining, 'showing')}
          isCloseable={false}
          isLoading={eitherState(currentActivateMining, 'showing.mining')}
          onChangeMode={(value) => {
            sendActivateMining({type: 'CHANGE_MODE', mode: value})
          }}
          // eslint-disable-next-line no-shadow
          onActivate={({delegatee}) => {
            sendActivateMining('ACTIVATE', {delegatee})
          }}
          onClose={() => {
            sendActivateMining('CANCEL')
          }}
        />
      )}

      <Dialog isOpen={isOpenRejectDialog} onClose={onCloseRejectDialog}>
        <DialogHeader>
          {t('Are you sure you want to reject the hard fork update?')}
        </DialogHeader>
        <DialogBody>
          {t(`The mining penalties might be charged if the fork is activated by the
          network majority.`)}
        </DialogBody>
        <DialogFooter>
          <SecondaryButton onClick={onCloseRejectDialog}>
            {t('Cancel')}
          </SecondaryButton>
          <PrimaryButton
            colorScheme="red"
            onClick={() => {
              onReject()
              onCloseRejectDialog()
            }}
          >
            {t('Reject')}
          </PrimaryButton>
        </DialogFooter>
      </Dialog>
    </>
  )
}

function UpdateExternalNodeDialog() {
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
          <NextLink href="/settings/node" passHref>
            <Link onClick={hideExternalNodeUpdateModal}>settings</Link>
          </NextLink>{' '}
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

function ConfirmQuitDialog({onClose, onError, ...props}) {
  const {t} = useTranslation()

  const stopMiningAndQuitRef = React.useRef()

  return (
    <AlertDialog
      isCentered
      leastDestructiveRef={stopMiningAndQuitRef}
      onClose={onClose}
      {...props}
    >
      <AlertDialogOverlay bg="xblack.080" />
      <AlertDialogContent
        bg="white"
        color="brandGray.500"
        fontSize="md"
        p={8}
        pt={6}
        rounded="lg"
      >
        <AlertDialogHeader fontSize="lg" fontWeight={500} p={0} mb={4}>
          {t('Are you sure you want to exit?')}
        </AlertDialogHeader>

        <AlertDialogBody p={0} mb={8}>
          {t(`Your mining status is active. Closing the app may cause the mining
      penalty.`)}
        </AlertDialogBody>

        <AlertDialogFooter p={0}>
          <Stack isInline justify="flex-end">
            <SecondaryButton onClick={onClose}>{t('Cancel')}</SecondaryButton>
            <SecondaryButton onClick={sendConfirmQuit}>
              {t('Exit')}
            </SecondaryButton>
            <PrimaryButton
              ref={stopMiningAndQuitRef}
              onClick={async () => {
                try {
                  await callRpc('dna_becomeOffline', {})
                  sendConfirmQuit()
                } catch (error) {
                  onError(error?.message)
                }
              }}
            >
              {t('Stop mining and exit')}
            </PrimaryButton>
          </Stack>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
