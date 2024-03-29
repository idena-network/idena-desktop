/* eslint-disable react/prop-types */
import React from 'react'
import {
  Stack,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  FormControl,
  Text,
  Box,
  Flex,
  Button,
  Radio,
  Switch,
  Alert,
  AlertDescription,
  List,
  ListItem,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Tag,
  FormHelperText,
  RadioGroup,
  HStack,
  useBoolean,
  WrapItem,
  Wrap,
} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {useQuery} from 'react-query'
import {
  Avatar,
  Tooltip,
  FormLabel,
  Input,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Checkbox,
  DialogFooter,
  DialogBody,
  Dialog,
  ErrorAlert,
  TextLink,
} from '../../shared/components/components'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {
  mapToFriendlyStatus,
  useIdentity,
  useIdentityState,
} from '../../shared/providers/identity-context'
import {IdentityStatus, NodeType} from '../../shared/types'
import {useInvite} from '../../shared/providers/invite-context'
import {activateMiningMachine} from './machines'
import {
  callRpc,
  dummyAddress,
  eitherState,
  humanizeDuration,
  toLocaleDna,
  toPercent,
} from '../../shared/utils/utils'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useFailToast, useSuccessToast} from '../../shared/hooks/use-toast'
import {getStakingWarning, validateInvitationCode} from './utils'
import {BLOCK_TIME} from '../oracles/utils'
import {useInviteScore, useReplenishStake} from './hooks'
import {DnaInput, FillCenter} from '../oracles/components'
import {useTotalValidationScore} from '../validation/report/hooks'
import {
  ChevronRightIcon,
  InfoIcon,
  TelegramIcon,
  UserIcon,
  WalletIcon,
} from '../../shared/components/icons'
import {AdDrawer} from '../ads/containers'
import {useTrackTx} from '../ads/hooks'

export function UserInlineCard({
  identity: {address, state},
  children,
  ...props
}) {
  return (
    <Stack isInline spacing={6} align="center" {...props}>
      <Avatar
        address={address}
        bg="white"
        borderWidth={1}
        borderColor="gray.016"
      />
      <Stack spacing="1.5" w="full">
        <Stack spacing={1}>
          <Heading as="h2" fontSize="lg" fontWeight={500} lineHeight="short">
            {mapToFriendlyStatus(state)}
          </Heading>
          <Heading
            as="h3"
            fontSize="mdx"
            fontWeight="normal"
            color="muted"
            lineHeight="shorter"
          >
            {address}
          </Heading>
        </Stack>
        {children}
      </Stack>
    </Stack>
  )
}

export function UserStatList({title, children, ...props}) {
  return (
    <Stack spacing="4" {...props}>
      <Heading as="h4" fontSize="lg" fontWeight={500}>
        {title}
      </Heading>
      <Stack spacing="4" bg="gray.50" px="10" py="8" rounded="lg">
        {children}
      </Stack>
    </Stack>
  )
}

export function SimpleUserStat({label, value, ...props}) {
  return (
    <UserStat {...props}>
      <UserStatLabel>{label}</UserStatLabel>
      <UserStatValue>{value}</UserStatValue>
    </UserStat>
  )
}

export function AnnotatedUserStat({label, value, tooltip}) {
  return (
    <UserStat>
      <Stack spacing="1">
        <UserStatLabelTooltip label={tooltip}>
          <UserStatLabel
            color="muted"
            fontWeight={500}
            lineHeight="19px"
            borderBottom="dotted 1px"
            borderBottomColor="muted"
            cursor="help"
          >
            {label}
          </UserStatLabel>
        </UserStatLabelTooltip>
        {value && <UserStatValue>{value}</UserStatValue>}
      </Stack>
    </UserStat>
  )
}

export function UserStat(props) {
  return <Stat as={Stack} spacing="1" {...props} />
}

// eslint-disable-next-line react/display-name
export const UserStatLabel = React.forwardRef((props, ref) => (
  <StatLabel
    ref={ref}
    color="muted"
    alignSelf="flex-start"
    fontSize="md"
    lineHeight="5"
    {...props}
  />
))

export function UserStatValue(props) {
  return <StatNumber fontSize="md" fontWeight={500} lineHeight="5" {...props} />
}

export function UserStatLabelTooltip(props) {
  return <Tooltip placement="top" zIndex="tooltip" {...props} />
}

// eslint-disable-next-line react/display-name
export const ActivateInviteForm = React.forwardRef(
  ({onHowToGetInvitation, ...props}, ref) => {
    const {t} = useTranslation()

    const failToast = useFailToast()

    const [{activationTx}, {activateInvite}] = useInvite()

    const {state: status} = useIdentityState()

    const [code, setCode] = React.useState()

    const mining = !!activationTx

    const hasBeenInvited = status === IdentityStatus.Invite

    return (
      <Box
        ref={ref}
        as="form"
        onSubmit={async (e) => {
          e.preventDefault()
          try {
            const trimmedCode = code?.trim()

            if (trimmedCode) {
              if (!validateInvitationCode(trimmedCode))
                throw new Error('invalid')
            }

            await activateInvite(trimmedCode)
          } catch ({message}) {
            failToast(
              // eslint-disable-next-line no-nested-ternary
              ['missing', 'invalid'].some((errorCode) =>
                message.includes(errorCode)
              )
                ? t('Invitation code is not valid')
                : message.includes('validation ceremony')
                ? t(
                    'Can not activate invitation since the validation is running'
                  )
                : message
            )
          }
        }}
        {...props}
      >
        {hasBeenInvited ? (
          <Flex justify="flex-end">
            <PrimaryButton
              isLoading={mining}
              loadingText={t('Mining...')}
              type="submit"
            >
              {t('Accept invitation')}
            </PrimaryButton>
          </Flex>
        ) : (
          <Stack spacing={6}>
            <FormControl>
              <Stack spacing={3}>
                <Flex justify="space-between" align="center">
                  <FormLabel htmlFor="code" p={0}>
                    {t('Invitation code')}
                  </FormLabel>
                  <Button
                    variant="ghost"
                    isDisabled={mining}
                    bg="unset"
                    color="muted"
                    fontWeight={500}
                    h="unset"
                    p={0}
                    _hover={{bg: 'unset'}}
                    _active={{bg: 'unset'}}
                    _focus={{boxShadow: 'none'}}
                    onClick={() => setCode(global.clipboard.readText())}
                  >
                    {t('Paste')}
                  </Button>
                </Flex>
                <Input
                  id="code"
                  value={code}
                  isDisabled={mining}
                  resize="none"
                  _disabled={{
                    bg: 'gray.50',
                  }}
                  _placeholder={{
                    color: 'muted',
                  }}
                  onChange={(e) => setCode(e.target.value)}
                />
              </Stack>
            </FormControl>
            <Stack spacing={4} isInline align="center" justify="flex-end">
              <Button
                variant="link"
                colorScheme="blue"
                fontWeight={500}
                _hover={null}
                _active={null}
                onClick={onHowToGetInvitation}
              >
                {t('How to get an invitation')}
              </Button>
              <PrimaryButton
                isLoading={mining}
                loadingText={t('Mining...')}
                type="submit"
              >
                {t('Activate invitation')}
              </PrimaryButton>
            </Stack>
          </Stack>
        )}
      </Box>
    )
  }
)

export function SpoilInviteDrawer({children, ...props}) {
  const {t} = useTranslation()
  return (
    <Drawer {...props}>
      <DrawerHeader mb={6}>
        <Avatar address={dummyAddress} mx="auto" />
        <Heading
          fontSize="lg"
          fontWeight={500}
          color="brandGray.500"
          mt={4}
          mb={0}
          textAlign="center"
        >
          {t('Spoil invitation code')}
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        <Text fontSize="md" mb={6}>
          {t(
            `Spoil invitations that are shared publicly. This will encourage people to share invitations privately and prevent bots from collecting invitation codes.`
          )}
        </Text>
        {children}
      </DrawerBody>
    </Drawer>
  )
}

export function SpoilInviteForm({onSpoil}) {
  const {t} = useTranslation()
  return (
    <Stack
      as="form"
      spacing={6}
      onSubmit={(e) => {
        e.preventDefault()
        onSpoil(e.target.elements.key.value)
      }}
    >
      <FormControl>
        <FormLabel htmlFor="key">Invitation code</FormLabel>
        <Input id="key" placeholder={t('Invitation code to spoil')} />
      </FormControl>
      <Text fontSize="md">
        {t(
          `When you click 'Spoil' the invitation code will be activated by a random address and wasted.`
        )}
      </Text>
      <PrimaryButton ml="auto" type="submit">
        {t('Spoil invite')}
      </PrimaryButton>
    </Stack>
  )
}

export function ActivateMiningForm({
  isOnline,
  delegatee,
  delegationEpoch,
  pendingUndelegation,
  onShow,
}) {
  const failToast = useFailToast()

  const epoch = useEpochState()

  const [current, send] = useMachine(activateMiningMachine, {
    context: {
      isOnline,
      delegatee,
      delegationEpoch,
    },
    actions: {
      onError: (_, {data}) => failToast(data?.message),
    },
  })
  const {mode} = current.context

  React.useEffect(() => {
    send('CANCEL')
  }, [isOnline, delegatee, send])

  const isDelegator = typeof delegatee === 'string'

  return (
    <>
      <ActivateMiningSwitch
        isOnline={isOnline || isDelegator}
        isDelegator={isDelegator}
        onShow={() => {
          send('SHOW')
          if (onShow) onShow()
        }}
      />
      {isOnline || isDelegator ? (
        <DeactivateMiningDrawer
          delegatee={delegatee}
          canUndelegate={epoch?.epoch > delegationEpoch}
          isOpen={eitherState(current, 'showing')}
          isCloseable={false}
          isLoading={eitherState(current, 'showing.mining')}
          onDeactivate={() => {
            send('DEACTIVATE', {
              mode: isDelegator ? NodeType.Delegator : NodeType.Miner,
            })
          }}
          onClose={() => {
            send('CANCEL')
          }}
        />
      ) : (
        <ActivateMiningDrawer
          mode={mode}
          delegationEpoch={delegationEpoch}
          pendingUndelegation={pendingUndelegation}
          currentEpoch={epoch?.epoch}
          isOpen={eitherState(current, 'showing')}
          isCloseable={false}
          isLoading={eitherState(current, 'showing.mining')}
          onChangeMode={(value) => {
            send({type: 'CHANGE_MODE', mode: value})
          }}
          // eslint-disable-next-line no-shadow
          onActivate={({delegatee}) => {
            send('ACTIVATE', {delegatee})
          }}
          onClose={() => {
            send('CANCEL')
          }}
        />
      )}
    </>
  )
}

export function ActivateMiningSwitch({isOnline, isDelegator, onShow}) {
  const {t} = useTranslation()

  return (
    <Stack spacing="3">
      <Text fontWeight={500} h={18}>
        {t('Status')}
      </Text>
      <Flex
        align="center"
        justify="space-between"
        borderColor="gray.300"
        borderWidth={1}
        rounded="md"
        h="8"
        px={3}
      >
        <FormLabel htmlFor="mining" fontWeight="normal" mb={0} noOfLines={1}>
          {isDelegator ? t('Delegation') : t('Mining')}
        </FormLabel>
        <Stack direction="row" align="center">
          <Text color={isOnline ? 'blue.500' : 'red.500'} fontWeight={500}>
            {isOnline ? t('On') : t('Off')}
          </Text>
          <Switch
            id="mining"
            size="sm"
            isChecked={isOnline}
            h="4"
            sx={{
              '& > input:not(:checked) + span': {
                background: 'red.500',
              },
            }}
            onChange={onShow}
          />
        </Stack>
      </Flex>
    </Stack>
  )
}

export function ActivateMiningDrawer({
  mode,
  delegationEpoch,
  pendingUndelegation,
  currentEpoch,
  isLoading,
  onChangeMode,
  onActivate,
  onClose,
  ...props
}) {
  const {t} = useTranslation()

  const delegateeInputRef = React.useRef()

  const willDelegate = mode === NodeType.Delegator

  const waitForDelegationEpochs =
    3 - (currentEpoch - delegationEpoch) <= 0
      ? 3
      : 3 - (currentEpoch - delegationEpoch)

  return (
    <AdDrawer isMining={isLoading} onClose={onClose} {...props}>
      <DrawerHeader>
        <Flex
          align="center"
          justify="center"
          bg="blue.012"
          h={12}
          w={12}
          rounded="xl"
        >
          <UserIcon boxSize="6" color="blue.500" />
        </Flex>
        <Heading
          color="brandGray.500"
          fontSize="lg"
          fontWeight={500}
          lineHeight="base"
          mt={4}
        >
          {t('Miner status')}
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        <Stack spacing={6} mt={30}>
          <FormControl as={Stack} spacing={3}>
            <FormLabel p={0}>{t('Type')}</FormLabel>
            <RadioGroup value={mode} onChange={onChangeMode}>
              <HStack spacing="2">
                <Radio value={NodeType.Miner} variant="bordered" flex={1}>
                  {t('Mining')}
                </Radio>
                <Radio value={NodeType.Delegator} variant="bordered" flex={1}>
                  {t('Delegation')}
                </Radio>
              </HStack>
            </RadioGroup>
          </FormControl>
          {willDelegate ? (
            <Stack spacing={5}>
              <FormControl as={Stack} spacing={3}>
                <FormLabel>{t('Delegation address')}</FormLabel>
                <Input
                  ref={delegateeInputRef}
                  defaultValue={pendingUndelegation}
                  isDisabled={Boolean(pendingUndelegation)}
                />
              </FormControl>

              {pendingUndelegation ? (
                <ErrorAlert>
                  {t(
                    'You have recently disabled delegation. You need to wait for {{count}} epochs to delegate to a new address.',
                    {count: waitForDelegationEpochs}
                  )}
                </ErrorAlert>
              ) : (
                <ErrorAlert alignItems="flex-start">
                  <Stack spacing="1">
                    <Text>
                      {t(
                        'You can lose your stake, all your mining and validation rewards if you delegate your mining status.'
                      )}
                    </Text>
                    <Text>
                      {t(
                        'Disabling delegation could be done at the next epoch only.'
                      )}
                    </Text>
                  </Stack>
                </ErrorAlert>
              )}
            </Stack>
          ) : (
            <Box bg="gray.50" p={6} py={4}>
              <Heading
                color="brandGray.500"
                fontSize="base"
                fontWeight={500}
                mb={2}
              >
                {t('Activate mining status')}
              </Heading>
              <Text fontSize="md" color="muted" mb={3}>
                {t(
                  `Submit the form to start mining. Your node has to be online unless you deactivate your status. Otherwise penalties might be charged after being offline more than 1 hour.`
                )}
              </Text>
              <Text fontSize="md" color="muted">
                {t('You can deactivate your online status at any time.')}
              </Text>
            </Box>
          )}
        </Stack>
      </DrawerBody>
      <DrawerFooter>
        <Stack isInline>
          <SecondaryButton onClick={onClose}>{t('Cancel')}</SecondaryButton>
          <PrimaryButton
            isLoading={isLoading}
            onClick={() => {
              onActivate({delegatee: delegateeInputRef.current?.value})
            }}
            loadingText={t('Waiting...')}
          >
            {t('Submit')}
          </PrimaryButton>
        </Stack>
      </DrawerFooter>
    </AdDrawer>
  )
}

export function DeactivateMiningDrawer({
  isLoading,
  delegatee,
  canUndelegate,
  onDeactivate,
  onClose,
  ...props
}) {
  const {t} = useTranslation()

  const isDelegator = typeof delegatee === 'string'

  return (
    <AdDrawer isMining={isLoading} onClose={onClose} {...props}>
      <DrawerHeader>
        <Flex
          align="center"
          justify="center"
          bg="blue.012"
          h={12}
          w={12}
          rounded="xl"
        >
          <UserIcon boxSize="6" color="blue.500" />
        </Flex>
        <Heading
          color="brandGray.500"
          fontSize="lg"
          fontWeight={500}
          lineHeight="base"
          mt={4}
        >
          {isDelegator
            ? t('Deactivate delegation status')
            : t('Deactivate mining status')}
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        <Stack spacing={6} mt={30}>
          <Text fontSize="md">
            {isDelegator
              ? t(`Submit the form to deactivate your delegation status.`)
              : t(
                  `Submit the form to deactivate your mining status. You can activate it again afterwards.`
                )}
          </Text>
          {isDelegator && (
            <FormControl as={Stack} spacing={3}>
              <FormLabel>{t('Delegation address')}</FormLabel>
              <Input defaultValue={delegatee} isDisabled />
            </FormControl>
          )}
          {isDelegator && !canUndelegate && (
            <Alert
              status="error"
              rounded="md"
              bg="red.010"
              borderColor="red.050"
              borderWidth={1}
            >
              <InfoIcon alignSelf="flex-start" color="red.500" />
              <AlertDescription
                color="brandGray.500"
                fontSize="md"
                fontWeight={500}
              >
                {t('You can disable delegation at the next epoch only')}
              </AlertDescription>
            </Alert>
          )}
        </Stack>
      </DrawerBody>
      <DrawerFooter>
        <Stack isInline>
          <SecondaryButton onClick={onClose}>{t('Cancel')}</SecondaryButton>
          <PrimaryButton
            isDisabled={isDelegator && !canUndelegate}
            isLoading={isLoading}
            onClick={onDeactivate}
            loadingText={t('Waiting...')}
          >
            {t('Submit')}
          </PrimaryButton>
        </Stack>
      </DrawerFooter>
    </AdDrawer>
  )
}

export function KillIdentityDrawer({
  address,
  lockedStake,
  age,
  children,
  ...props
}) {
  const {t} = useTranslation()

  return (
    <Drawer {...props}>
      <DrawerHeader mb={6}>
        <Avatar address={address} mx="auto" />
        <Heading
          fontSize="lg"
          fontWeight={500}
          color="brandGray.500"
          mt={4}
          mb={0}
          textAlign="center"
        >
          {t('Terminate identity')}
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        <Text fontSize="md" mb={6}>
          {t(`Terminate your identity and withdraw the stake. Your identity status
            will be reset to 'Not validated'.`)}
        </Text>
        {children}
      </DrawerBody>
    </Drawer>
  )
}

export function KillForm({onSuccess, onFail}) {
  const {t, i18n} = useTranslation(['translation', 'error'])

  const [{address, stake, lockedStake, age}, {killMe}] = useIdentity()
  const stakeToWithdraw = Number(lockedStake) > 0 ? stake - lockedStake : stake

  const toastSuccess = useSuccessToast()
  const toastFail = useFailToast()

  const [submitting, setSubmitting] = React.useState(false)

  const formatDna = toLocaleDna(i18n.language, {
    maximumFractionDigits: 5,
  })

  return (
    <Stack
      as="form"
      spacing={6}
      onSubmit={async (e) => {
        e.preventDefault()

        try {
          const to = e.target.elements.to.value

          if (to !== address)
            throw new Error(t('You must specify your own identity address'))

          setSubmitting(true)

          const {result, error} = await killMe({to})

          setSubmitting(false)

          if (error) {
            toastFail({
              title: t('Error while sending transaction'),
              description: error.message,
            })
          } else {
            toastSuccess(t('Transaction sent'))
            if (onSuccess) onSuccess(result)
          }
        } catch (error) {
          setSubmitting(false)
          toastFail(error?.message ?? t('Something went wrong'))
          if (onFail) onFail(error)
        }
      }}
    >
      {Number(lockedStake) > 0 && (
        <>
          <FormControl>
            <FormHelperText fontSize="md">
              <Flex justify="space-between">
                <Box as="span" color="muted">
                  {t('Burn')}
                </Box>
                <Box as="span" color="brandGray.500">
                  {formatDna(lockedStake)}
                </Box>
              </Flex>
            </FormHelperText>
          </FormControl>
          <Text fontSize="md" mb={6}>
            {t(
              'Get validated for {{epochs}} more epoch(s) to be able to withdraw the full amount of the stake.',
              {epochs: 10 - age}
            )}
          </Text>
        </>
      )}
      <FormControl>
        <FormHelperText fontSize="md">
          <Flex justify="space-between">
            <Box as="span" color="muted">
              {t('Withdraw stake')}
            </Box>
            <Box as="span" color="brandGray.500">
              {formatDna(stakeToWithdraw)}
            </Box>
          </Flex>
        </FormHelperText>
      </FormControl>

      <Text fontSize="md" mb={6}>
        {t(
          'Please enter your identity address to confirm termination. Stake will be transferred to the identity address.'
        )}
      </Text>
      <FormControl>
        <FormLabel htmlFor="to">{t('Address')}</FormLabel>
        <Input id="to" placeholder={t('Your identity address')} />
      </FormControl>

      <PrimaryButton
        ml="auto"
        type="submit"
        isLoading={submitting}
        colorScheme="red"
        _hover={{
          bg: 'rgb(227 60 60)',
        }}
        _active={{
          bg: 'rgb(227 60 60)',
        }}
        _focus={{
          boxShadow: '0 0 0 3px rgb(255 102 102 /0.50)',
        }}
      >
        {t('Terminate')}
      </PrimaryButton>
    </Stack>
  )
}

export function MyIdenaBotAlert({onConnect, onSkip}) {
  const {t} = useTranslation()

  const {state} = useIdentityState()

  const myIdenaBotDisclosure = useDisclosure()

  const [doNotShowAgain, setDoNotShowAgain] = React.useState()

  const connectButtonRef = React.useRef()

  // eslint-disable-next-line no-shadow
  const eitherState = (...states) => states.some((s) => s === state)

  return (
    <>
      <Alert
        variant="solid"
        justifyContent="center"
        flexShrink={0}
        boxShadow="0 3px 12px 0 rgb(255 163 102 /0.1), 0 2px 3px 0 rgb(255 163 102 /0.2)"
        color="white"
        cursor="pointer"
        fontWeight={500}
        rounded="md"
        h={10}
        mt={2}
        mx={2}
        w="auto"
        onClick={myIdenaBotDisclosure.onOpen}
      >
        <Flex flexGrow={1}>
          <Flex flexGrow={1} alignItems="center" justifyContent="center">
            <Box ml={6}>
              <TelegramIcon boxSize="6" mr="1" />
              {t(`Subscribe to @MyIdenaBot to get personalized notifications based on
        your status`)}
            </Box>
          </Flex>
          <Flex ml="auto">
            <Button
              variant="link"
              colorScheme="white"
              width={12}
              pl={2}
              height={10}
              fontWeight={500}
              _hover={null}
              _active={null}
              onClick={(e) => {
                e.stopPropagation()
                onSkip()
              }}
            >
              {t('Close')}
            </Button>
          </Flex>
        </Flex>
      </Alert>

      <Dialog
        title="Subscribe to @MyIdenaBot"
        size="md"
        initialFocusRef={connectButtonRef}
        {...myIdenaBotDisclosure}
      >
        <DialogBody>
          <Stack>
            <Text>
              {t(
                `MyIdenaBot reminds you about important actions based on your
              identity status:`,
                {nsSeparator: '!!'}
              )}
            </Text>

            {eitherState(IdentityStatus.Undefined) && (
              <IdenaBotFeatureList
                features={[
                  'next validation reminder',
                  'notification when you get an invite',
                  'reminder to activate your invite',
                  'your validation results when validation consensus is reached',
                ]}
              />
            )}

            {eitherState(IdentityStatus.Invite, IdentityStatus.Candidate) && (
              <IdenaBotFeatureList
                features={[
                  'next validation reminder',
                  'your validation results when validation consensus is reached',
                ]}
              />
            )}

            {eitherState(IdentityStatus.Newbie) && (
              <IdenaBotFeatureList
                features={[
                  'next validation reminder',
                  'reminder to create flips if you haven’t done it yet and the validation is coming',
                  'your validation results when validation consensus is reached',
                ]}
              />
            )}

            {eitherState(IdentityStatus.Verified, IdentityStatus.Human) && (
              <IdenaBotFeatureList
                features={[
                  'next validation reminder',
                  'reminder to create flips',
                  'your validation results when validation consensus is reached',
                  'reminder to share your remaining invites',
                  'reminder to submit extra flips to get more rewards',
                  'status update of all your invitees to check if they are ready for the validation (activated invites, submitted flips)',
                ]}
              />
            )}
            {eitherState(IdentityStatus.Zombie, IdentityStatus.Suspended) && (
              <IdenaBotFeatureList
                features={[
                  'next validation reminder',
                  'your validation results when validation consensus is reached',
                  'reminder to share your remaining invites',
                  'reminder to submit extra flips to get more rewards',
                  'status update of all your invitees to check if they are ready for the validation (activated invites, submitted flips)',
                ]}
              />
            )}
          </Stack>
        </DialogBody>
        <DialogFooter align="center">
          <Checkbox
            borderColor="gray.100"
            isChecked={doNotShowAgain}
            onChange={(e) => {
              setDoNotShowAgain(e.target.checked)
            }}
          >
            {t('Do not show again')}
          </Checkbox>
          <SecondaryButton
            onClick={() => {
              myIdenaBotDisclosure.onClose()
              if (doNotShowAgain) onConnect()
            }}
          >
            {t('Not now')}
          </SecondaryButton>
          <PrimaryButton
            ref={connectButtonRef}
            onClick={() => {
              global.openExternal('https://t.me/MyIdenaBot')
              onConnect()
            }}
          >
            {t('Connect')}
          </PrimaryButton>
        </DialogFooter>
      </Dialog>
    </>
  )
}

function IdenaBotFeatureList({features, listSeparator = ';'}) {
  return (
    <List spacing={1} styleType="'- '">
      {features.map((feature, idx) => (
        <ListItem key={feature} textTransform="lowercase">
          {feature}
          {idx < features.length - 1 ? listSeparator : '.'}
        </ListItem>
      ))}
    </List>
  )
}

export function ProfileTagList() {
  const {t} = useTranslation()

  const [{age, penaltySeconds, totalShortFlipPoints, totalQualifiedFlips}] =
    useIdentity()

  const epoch = useEpochState()

  const score = useTotalValidationScore()

  const inviteScore = useInviteScore()

  return (
    <Wrap spacing="1" w="full">
      {age > 0 && (
        <WrapItem>
          <SimpleProfileTag label={t('Age')} value={age} />
        </WrapItem>
      )}

      {Number.isFinite(score) && (
        <WrapItem>
          <Popover placement="top" arrowShadowColor="transparent">
            <PopoverTrigger>
              <Box>
                <SimpleProfileTag
                  label={t('Score')}
                  value={toPercent(score)}
                  cursor="help"
                />
              </Box>
            </PopoverTrigger>
            <PopoverContent border="none" fontSize="sm" w="max-content">
              <PopoverArrow bg="graphite.500" />
              <PopoverBody bg="graphite.500" borderRadius="sm" p="2" pt="1">
                <Stack>
                  <Stack spacing="0.5">
                    <Text color="muted" lineHeight="shorter">
                      {t('Total score')}
                    </Text>
                    <Text color="white" lineHeight="4">
                      {t(
                        `{{totalShortFlipPoints}} out of {{totalQualifiedFlips}}`,
                        {
                          totalShortFlipPoints,
                          totalQualifiedFlips,
                        }
                      )}
                    </Text>
                  </Stack>
                  <Stack spacing="0.5">
                    <Text color="muted" lineHeight="shorter">
                      {t('Epoch #{{epoch}}', {epoch: epoch?.epoch})}
                    </Text>
                    <TextLink
                      href="/validation/report"
                      color="white"
                      lineHeight="4"
                    >
                      {t('Validation report')}
                      <ChevronRightIcon />
                    </TextLink>
                  </Stack>
                </Stack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </WrapItem>
      )}

      {penaltySeconds > 0 && (
        <WrapItem>
          <ProfileTag bg={[null, 'red.012']}>
            <ProfileTagLabel color="red.500">
              {t('Mining penalty')}
            </ProfileTagLabel>
            <ProfileTagValue color="red.500">
              {humanizeDuration(penaltySeconds)}
            </ProfileTagValue>
          </ProfileTag>
        </WrapItem>
      )}

      {inviteScore > 0 && (
        <WrapItem>
          <ProfileTagPopover>
            <ProfileTagPopoverTrigger>
              <ProfileTag
                cursor="help"
                bg={
                  // eslint-disable-next-line no-nested-ternary
                  inviteScore < 0.75
                    ? 'red.010'
                    : inviteScore < 0.99
                    ? 'orange.010'
                    : 'green.010'
                }
                color={
                  // eslint-disable-next-line no-nested-ternary
                  inviteScore < 0.75
                    ? 'red.500'
                    : inviteScore < 0.99
                    ? 'orange.500'
                    : 'green.500'
                }
              >
                <ProfileTagLabel>{t('Invitation rewards')}</ProfileTagLabel>
                <ProfileTagValue>{toPercent(inviteScore)}</ProfileTagValue>
              </ProfileTag>
            </ProfileTagPopoverTrigger>
            <ProfileTagPopoverContent>
              <Stack spacing="2px" w={40}>
                <Text color="xwhite.040" lineHeight="base">
                  {t(
                    'You will get {{invitationRewardRatio}} of the invitation rewards if your invite is activated now',
                    {invitationRewardRatio: toPercent(inviteScore)}
                  )}
                </Text>
                <TextLink href="/contacts" color="white" lineHeight="base">
                  {t('Check invites')}
                  <ChevronRightIcon />
                </TextLink>
              </Stack>
            </ProfileTagPopoverContent>
          </ProfileTagPopover>
        </WrapItem>
      )}
    </Wrap>
  )
}

function ProfileTag({children, ...props}) {
  return (
    <Tag
      bg={[null, 'gray.016']}
      borderRadius={[null, 'xl']}
      borderBottomWidth={[1, 0]}
      borderBottomColor="gray.100"
      color="gray.500"
      fontSize={['base', 'sm']}
      px={[null, '3']}
      pt={['2', 0]}
      pb={['2.5', 0]}
      w={['full', null]}
      {...props}
    >
      <Stack direction={['column', 'row']} spacing={['1.5', '1']} w={['full']}>
        {children}
      </Stack>
    </Tag>
  )
}

function ProfileTagLabel(props) {
  return <Text {...props} />
}

function ProfileTagValue(props) {
  return <Text color={['muted', 'inherit']} {...props} />
}

// eslint-disable-next-line react/display-name
const SimpleProfileTag = React.forwardRef(({label, value, ...props}, ref) => (
  <ProfileTag ref={ref} {...props}>
    <ProfileTagLabel>{label}</ProfileTagLabel>
    <ProfileTagValue>{value}</ProfileTagValue>
  </ProfileTag>
))

export function ProfileTagPopover(props) {
  return <Popover placement="top" arrowShadowColor="transparent" {...props} />
}

function ProfileTagPopoverTrigger({children}) {
  return (
    <PopoverTrigger>
      <Box>{children}</Box>
    </PopoverTrigger>
  )
}

function ProfileTagPopoverContent({children}) {
  return (
    <PopoverContent
      border="none"
      fontSize="sm"
      w="fit-content"
      zIndex="popover"
      _focus={{
        outline: 'none',
      }}
    >
      <PopoverArrow bg="graphite.500" />
      <PopoverBody bg="graphite.500" borderRadius="sm" p="2" pt="1">
        {children}
      </PopoverBody>
    </PopoverContent>
  )
}

export function ReplenishStakeDrawer({onSuccess, onMined, onError, ...props}) {
  const {t, i18n} = useTranslation()

  const {address, state, age} = useIdentityState()

  const {data: balanceData} = useQuery({
    queryKey: ['get-balance', address],
    // eslint-disable-next-line no-shadow
    queryFn: ({queryKey: [, address]}) => callRpc('dna_getBalance', address),
    enabled: Boolean(address),
    staleTime: (BLOCK_TIME / 2) * 1000,
    notifyOnChangeProps: 'tracked',
  })

  const [sendValue, setSendValue] = React.useState('')

  const [isMining, setIsMining] = useBoolean()
  const {off: setIsMiningOff} = setIsMining

  const {data: hash, submit} = useReplenishStake({
    onSuccess,
    onError: React.useCallback(
      (e) => {
        setIsMiningOff()
        onError(e)
      },
      [onError, setIsMiningOff]
    ),
  })

  useTrackTx(hash, {
    onMined: React.useCallback(() => {
      setIsMiningOff()
      onMined()
    }, [onMined, setIsMiningOff]),
  })

  const formatDna = toLocaleDna(i18n.language, {
    maximumFractionDigits: 5,
  })

  const [checkboxes, setCheckboxes] = React.useState({
    cb1: {show: false, value: false},
    cb2: {show: false, value: false},
    cb3: {show: false, value: false},
    cb4: {show: false, value: false},
  })

  React.useEffect(() => {
    setCheckboxes({
      cb1: {show: true, value: false},
      cb2: {
        show: [IdentityStatus.Candidate, IdentityStatus.Newbie].includes(state),
        value: false,
      },
      cb3: {
        show: state === IdentityStatus.Candidate,
        value: false,
      },
      cb4: {show: !!getStakingWarning(t, state, age), value: false},
    })
  }, [age, state, t])

  const allChecked = Object.entries(checkboxes).reduce(
    (prev, current) => prev && (current[1].show ? current[1].value : true),
    true
  )

  return (
    <AdDrawer isMining={isMining} {...props}>
      <DrawerHeader>
        <Stack spacing="4">
          <FillCenter bg="blue.012" h={12} minH={12} w={12} rounded="xl">
            <WalletIcon boxSize="6" color="blue.500" />
          </FillCenter>
          <Heading
            color="brandGray.500"
            fontSize="lg"
            fontWeight={500}
            lineHeight="base"
          >
            {t('Add stake')}
          </Heading>
        </Stack>
      </DrawerHeader>
      <DrawerBody fontSize="md">
        <Stack spacing={30}>
          <Stack>
            <Text>
              {t(
                'Get quadratic staking rewards for locking iDNA in your identity stake.'
              )}
            </Text>
            <Text>
              {t('Current stake amount: {{amount}}', {
                amount: formatDna(balanceData?.stake),
                nsSeparator: '!!',
              })}
            </Text>
          </Stack>
          <Stack spacing="2.5">
            <form
              id="replenishStake"
              onSubmit={(e) => {
                e.preventDefault()

                setIsMining.on()

                submit({amount: sendValue})
              }}
            >
              <FormControl>
                <FormLabel mx={0} mb="3">
                  {t('Amount')}
                </FormLabel>
                <DnaInput
                  value={sendValue}
                  onChange={(e) => setSendValue(Number(e.target.value))}
                />
                <FormHelperText fontSize="md">
                  <Flex justify="space-between">
                    <Box as="span" color="muted">
                      {t('Available')}
                    </Box>
                    <Box as="span" color="brandGray.500">
                      {formatDna(balanceData?.balance)}
                    </Box>
                  </Flex>
                </FormHelperText>
              </FormControl>
              <Stack mt={4} spacing={2}>
                <FormControl>
                  <Checkbox
                    alignItems="flex-start"
                    sx={{
                      '& input+span': {
                        marginTop: '2px',
                      },
                    }}
                    isChecked={checkboxes.cb1.value}
                    onChange={(e) =>
                      setCheckboxes((prev) => ({
                        ...prev,
                        cb1: {
                          ...prev.cb1,
                          value: e.target.checked,
                        },
                      }))
                    }
                  >
                    {t(
                      'I understand that I can only withdraw my stake by terminating my identity'
                    )}
                  </Checkbox>
                </FormControl>
                {checkboxes.cb2.show && (
                  <FormControl>
                    <Checkbox
                      alignItems="flex-start"
                      sx={{
                        '& input+span': {
                          marginTop: '2px',
                        },
                      }}
                      isChecked={checkboxes.cb2.value}
                      onChange={(e) =>
                        setCheckboxes((prev) => ({
                          ...prev,
                          cb2: {
                            ...prev.cb2,
                            value: e.target.checked,
                          },
                        }))
                      }
                    >
                      {t(
                        'I understand that I can not terminate my identity until I get Verified or Human status'
                      )}
                    </Checkbox>
                  </FormControl>
                )}
                {checkboxes.cb3.show && (
                  <FormControl>
                    <Checkbox
                      alignItems="flex-start"
                      sx={{
                        '& input+span': {
                          marginTop: '2px',
                        },
                      }}
                      isChecked={checkboxes.cb3.value}
                      onChange={(e) =>
                        setCheckboxes((prev) => ({
                          ...prev,
                          cb3: {
                            ...prev.cb3,
                            value: e.target.checked,
                          },
                        }))
                      }
                    >
                      {t(
                        'I understand that inviter can terminate my identity and burn my stake until I get validated'
                      )}
                    </Checkbox>
                  </FormControl>
                )}
                {checkboxes.cb4.show && (
                  <FormControl>
                    <Checkbox
                      alignItems="flex-start"
                      sx={{
                        '& input+span': {
                          marginTop: '2px',
                        },
                      }}
                      isChecked={checkboxes.cb4.value}
                      onChange={(e) =>
                        setCheckboxes((prev) => ({
                          ...prev,
                          cb4: {
                            ...prev.cb4,
                            value: e.target.checked,
                          },
                        }))
                      }
                    >
                      {getStakingWarning(t, state, age)}
                    </Checkbox>
                  </FormControl>
                )}
              </Stack>
            </form>
          </Stack>
        </Stack>
      </DrawerBody>
      <DrawerFooter>
        <Stack isInline>
          {/* eslint-disable-next-line react/destructuring-assignment */}
          <SecondaryButton onClick={props.onClose}>
            {t('Not now')}
          </SecondaryButton>
          <PrimaryButton
            form="replenishStake"
            type="submit"
            isDisabled={!allChecked || !sendValue}
            isLoading={isMining}
            loadingText={t('Mining...')}
          >
            {t('Add stake')}
          </PrimaryButton>
        </Stack>
      </DrawerFooter>
    </AdDrawer>
  )
}
