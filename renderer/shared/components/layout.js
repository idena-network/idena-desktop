/* eslint-disable react/prop-types */
import React from 'react'
import {useRouter} from 'next/router'
import {Trans, useTranslation} from 'react-i18next'
import {
  Flex,
  Text,
  Stack,
  Image,
  Box,
  Heading,
  List,
  ListItem,
  Icon,
  useDisclosure,
  RadioGroup,
  Radio,
  Skeleton,
  useTheme,
  useToast,
  Alert,
  Link,
} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import semver from 'semver'
import {assign, createMachine} from 'xstate'
import {log} from 'xstate/lib/actions'
import NextLink from 'next/link'
import Sidebar from './sidebar'
import {useDebounce} from '../hooks/use-debounce'
import {useEpochState} from '../providers/epoch-context'
import {shouldStartValidation} from '../../screens/validation/utils'
import {useIdentityState} from '../providers/identity-context'
import {loadPersistentStateValue, persistItem} from '../utils/persist'
import {
  DnaSignInDialog,
  DnaSendDialog,
  DnaLinkHandler,
  DnaRawTxDialog,
} from './dna-link'
import {ValidationToast} from '../../screens/validation/components'
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
import {ActivateMiningDrawer} from '../../screens/profile/components'
import {activateMiningMachine} from '../../screens/profile/machines'
import {
  callRpc,
  eitherState,
  shouldShowUpcomingValidationNotification,
  showWindowNotification,
} from '../utils/utils'
import {useChainState} from '../providers/chain-context'
import {useNode} from '../providers/node-context'
import {useSettings} from '../providers/settings-context'
import {useFailToast, useSuccessToast} from '../hooks/use-toast'

global.getZoomLevel = global.getZoomLevel || {}

const AVAILABLE_TIMEOUT = global.isDev || global.isTest ? 0 : 1000 * 5

export default function Layout({
  loading,
  syncing,
  offline,
  skipHardForkScreen = false,
  ...props
}) {
  const debouncedSyncing = useDebounce(syncing, AVAILABLE_TIMEOUT)
  const debouncedOffline = useDebounce(offline, AVAILABLE_TIMEOUT)

  const [zoomLevel, setZoomLevel] = React.useState(
    () => loadPersistentStateValue('settings', 'zoomLevel') || 0
  )

  React.useEffect(() => {
    const handleMouseWheel = e => {
      if (e.ctrlKey) {
        e.preventDefault()
        setZoomLevel(level =>
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
    if (Number.isFinite(zoomLevel)) {
      global.setZoomLevel(zoomLevel)
      persistItem('settings', 'zoomLevel', zoomLevel)
    }
  }, [zoomLevel])

  const failToast = useFailToast()

  const {nodeRemoteVersion, mustUpdateNode} = useAutoUpdateState()
  const {updateNode, onRejectHardFork} = useAutoUpdateDispatch()

  const isHardFork = !loading && !skipHardForkScreen && mustUpdateNode
  const isSyncing = !loading && debouncedSyncing && !debouncedOffline
  const isOffline = !loading && debouncedOffline && !debouncedSyncing
  const isReady = !loading && !debouncedOffline && !debouncedSyncing
  const isNotOffline = !debouncedOffline && !loading

  return (
    <LayoutContainer>
      <Sidebar />

      {loading && <LoadingApp />}

      {isHardFork ? (
        <HardForkScreen
          version={nodeRemoteVersion}
          onUpdate={updateNode}
          onReject={onRejectHardFork}
        />
      ) : (
        <>
          {isSyncing && <SyncingApp />}
          {isOffline && <OfflineApp />}
          {isReady && <NormalApp {...props} />}

          {isNotOffline && (
            <DnaLinkHandler>
              <DnaSignInDialog
                isOpen={url => new URL(url).pathname.includes('signin')}
                onSigninError={failToast}
              />
            </DnaLinkHandler>
          )}
        </>
      )}
      <UpdateExternalNodeDialog />
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

function NormalApp({children}) {
  const {t} = useTranslation()

  const router = useRouter()

  const epoch = useEpochState()
  const identity = useIdentityState()

  React.useEffect(() => {
    if (shouldStartValidation(epoch, identity)) router.push('/validation')
  }, [epoch, identity, router])

  const [
    validationNotificationEpoch,
    setValidationNotificationEpoch,
  ] = React.useState(
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

  const successToast = useSuccessToast()
  const failToast = useFailToast()

  return (
    <Flex as="section" direction="column" flex={1} h="100vh" overflowY="auto">
      {children}

      {epoch && <ValidationToast epoch={epoch} identity={identity} />}

      <DnaLinkHandler>
        <DnaSendDialog
          isOpen={url => new URL(url).pathname.includes('send')}
          onDepositSuccess={hash =>
            successToast({
              title: t('Transaction sent'),
              description: hash,
            })
          }
          onDepositError={failToast}
        />
      </DnaLinkHandler>
      <DnaLinkHandler>
        <DnaRawTxDialog
          isOpen={url => new URL(url).pathname.includes('raw')}
          onSendSuccess={hash =>
            successToast({
              title: t('Transaction sent'),
              description: hash,
            })
          }
          onSendError={failToast}
        />
      </DnaLinkHandler>
    </Flex>
  )
}

function SyncingApp() {
  const {t} = useTranslation()

  const {currentBlock, highestBlock, genesisBlock, wrongTime} = useChainState()

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
            3000: 'loading',
          },
        },
      },
    })
  )
  const {peers} = current.context

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
        <Stack isInline spacing={6} align="center" py={2}>
          <Avatar address={address} size={20} />
          <Heading fontSize="lg" fontWeight={500} wordBreak="break-all">
            {address}
          </Heading>
        </Stack>
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
                      numBlocks:
                        highestBlock - currentBlock &&
                        (highestBlock - currentBlock).toLocaleString(),
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
  const [
    {nodeReady, nodeFailed, unsupportedMacosVersion},
    {tryRestartNode},
  ] = useNode()

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

  const isFailedBuiltinNode = nodeFailed && !useExternalNode

  const isUnsupportedMacosVersion =
    runInternalNode && !useExternalNode && unsupportedMacosVersion

  const toMb = b =>
    (b / (1024 * 1024)).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })

  return (
    <FillCenter bg="graphite.500" color="white" position="relative">
      <Flex
        align="center"
        justify="center"
        bg="red.500"
        py={3}
        fontWeight={500}
        position="absolute"
        top={0}
        left={0}
        w="full"
      >
        {t('Offline')}
      </Flex>

      {isDownloadingBuiltinNode && (
        <Stack spacing={3} w="md">
          <Stack isInline spacing={4} align="center">
            <Image src="/static/idena_white.svg" alt="logo" size={12} />
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

      {isFailedBuiltinNode && (
        <Stack spacing={5} w={416}>
          <Heading fontSize="lg" fontWeight={500}>
            {t('Your built-in node is failed')}
          </Heading>
          <Stack spacing={4} align="flex-start">
            <PrimaryButton onClick={tryRestartNode}>
              {t('Restart built-in node')}
            </PrimaryButton>
            <Text color="xwhite.050" fontSize="mdx">
              <Trans i18nKey="builtinNodeFailed" t={t}>
                If problem still exists, restart your app or check your
                connection <TextLink href="/settings/node">settings</TextLink>
              </Trans>
            </Text>
          </Stack>
        </Stack>
      )}

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

function HardForkScreen({version, onUpdate, onReject}) {
  const {t} = useTranslation()

  const {colors} = useTheme()

  const identity = useIdentityState()

  const {nodeCurrentVersion} = useAutoUpdateState()

  const [currentHardFork, sendHardFork] = useMachine(
    createMachine({
      context: {
        changes: [],
        didActivateFork: undefined,
        startActivationDate: undefined,
        endActivationDate: undefined,
        votingOption: 'approve',
      },
      initial: 'fetching',
      states: {
        fetching: {
          invoke: {
            src: async () => {
              const fetchJsonResult = async (
                path,
                base = 'https://api.idena.io'
              ) =>
                (await (await fetch(new URL(`api${path}`, base))).json()).result

              const forkChangelog = await fetchJsonResult(
                `/node/${version}/forkchangelog`
              )

              const currentVersionChangelog = await fetchJsonResult(
                `/node/${nodeCurrentVersion}/forkchangelog`
              )

              const [{upgrade: highestUpgrade}] = await fetchJsonResult(
                '/upgrades?limit=1'
              )

              const nextTiming =
                forkChangelog &&
                (await fetchJsonResult(`/upgrade/${forkChangelog.Upgrade}`))

              return {
                changes: forkChangelog?.Changes ?? [],
                didActivateFork:
                  currentVersionChangelog === null ||
                  highestUpgrade >= currentVersionChangelog.Upgrade,
                ...nextTiming,
              }
            },
            onDone: {
              target: 'fetched',
              actions: [
                assign((context, {data}) => ({
                  ...context,
                  ...data,
                })),
                log(),
              ],
            },
            onError: 'failed',
          },
        },
        fetched: {
          on: {
            VOTE: {actions: [assign({votingOption: (_, {option}) => option})]},
          },
        },
        failed: {},
      },
    })
  )

  const {
    changes,
    startActivationDate,
    endActivationDate,
    didActivateFork,
    votingOption,
  } = currentHardFork.context

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
                  size={20}
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
                <Skeleton
                  isLoaded={eitherState(currentHardFork, 'fetched', 'failed')}
                  colorStart={colors.xblack['016']}
                  colorEnd={colors.xblack['016']}
                >
                  <Box bg="xblack.016" rounded="md" p={1}>
                    <Stack spacing={5} p={3} h={188} overflowY="auto">
                      <Stack spacing={3}>
                        <Text color="white">{t('Changes')}</Text>
                        <List styleType="unordered" spacing={2}>
                          {changes.map(change => (
                            <ListItem key={change}>{change}</ListItem>
                          ))}
                          {changes.length === 0 && <Text>No changes 🤷‍♂️</Text>}
                        </List>
                      </Stack>
                      <Stack spacing={3}>
                        <Text color="white">
                          {t('Hard fork activation schedule')}
                        </Text>
                        <List styleType="unordered" spacing={2}>
                          <ListItem>
                            {t(
                              'Hard fork will be activated at any date after {{startActivationDate}}',
                              {
                                startActivationDate: startActivationDate
                                  ? new Date(
                                      startActivationDate
                                    ).toLocaleString()
                                  : 'TBD',
                              }
                            )}
                          </ListItem>
                          <ListItem>
                            {t(
                              'Hard fork will be blocked on {{endActivationDate}} if voting criteria are not met',
                              {
                                endActivationDate: endActivationDate
                                  ? new Date(endActivationDate).toLocaleString()
                                  : 'TBD',
                              }
                            )}
                          </ListItem>
                        </List>
                      </Stack>
                    </Stack>
                  </Box>
                </Skeleton>
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
                  <Icon name="github" size={4} color="blue.500" />
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
          {eitherState(currentHardFork, 'fetched') && shouldActivateMining && (
            <Box bg="xwhite.010" rounded="lg" py={4} px={6}>
              <Text color="xwhite.050" fontSize="mdx">
                {t(`You can not vote for the hard fork update since your mining status is deactivated.
                Please activate your mining status to vote or update the node.`)}
              </Text>
              <PrimaryButton
                variant="link"
                fontSize="sm"
                textDecoration="none"
                _active={null}
                _focus={{shadow: 'none'}}
                onClick={() => {
                  sendActivateMining('SHOW')
                }}
              >
                {t('Activate mining status')}
                <Icon name="chevron-down" size={4} transform="rotate(-90deg)" />
              </PrimaryButton>
            </Box>
          )}
          {eitherState(currentHardFork, 'fetched') && canVote && (
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
                <RadioGroup
                  value={votingOption}
                  onChange={e => {
                    sendHardFork('VOTE', {option: e.target.value})
                  }}
                >
                  <Radio value="approve">
                    {t('Yes, use node version {{version}}', {version})}
                  </Radio>
                  <Radio value="reject">
                    {t('No, reject node {{version}}', {version})}
                  </Radio>
                </RadioGroup>
              </Stack>
              <Box alignSelf="flex-end">
                <PrimaryButton
                  onClick={() => {
                    if (votingOption === 'approve') onUpdate()
                    else onOpenRejectDialog()
                  }}
                >
                  {t('Vote')}
                </PrimaryButton>
              </Box>
            </Stack>
          )}
        </Stack>
      </FillCenter>
      {identity.address && (
        <ActivateMiningDrawer
          mode={mode}
          isOpen={eitherState(currentActivateMining, 'showing')}
          isCloseable={false}
          isLoading={eitherState(currentActivateMining, 'showing.mining')}
          onChangeMode={value => {
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
            variantColor="red"
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
