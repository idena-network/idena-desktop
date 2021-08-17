/* eslint-disable react/prop-types */
import React from 'react'
import {
  Stack,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  useTheme,
  FormControl,
  Text,
  Box,
  Flex,
  Button,
  RadioButtonGroup,
  Radio,
  DrawerFooter,
  Icon,
  Switch,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {useMachine} from '@xstate/react'
import {
  Avatar,
  Tooltip,
  FormLabel,
  Input,
  Drawer,
  DrawerHeader,
  DrawerBody,
  Toast,
  SuccessAlert,
  Snackbar,
} from '../../shared/components/components'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {
  mapToFriendlyStatus,
  useIdentity,
  useIdentityState,
} from '../../shared/providers/identity-context'
import {IdentityStatus, NodeType} from '../../shared/types'
import {useInvite} from '../../shared/providers/invite-context'
import {
  loadPersistentState,
  loadPersistentStateValue,
} from '../../shared/utils/persist'
import {createTimerMachine} from '../../shared/machines'
import {usePersistence} from '../../shared/hooks/use-persistent-state'
import {activateMiningMachine} from './machines'
import {
  calculateInvitationRewardRatio,
  dummyAddress,
  eitherState,
  toPercent,
} from '../../shared/utils/utils'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useFailToast, useSuccessToast} from '../../shared/hooks/use-toast'

export function UserInlineCard({address, status, ...props}) {
  return (
    <Stack isInline spacing={6} align="center" {...props}>
      <Avatar address={address} />
      <Stack spacing={1}>
        <Heading as="h2" fontSize="lg" fontWeight={500} lineHeight="short">
          {mapToFriendlyStatus(status)}
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
    </Stack>
  )
}

export function UserStatList({title, children, ...props}) {
  return (
    <Stack spacing={4} {...props}>
      <Heading as="h4" fontSize="lg" fontWeight={500}>
        {title}
      </Heading>
      <Stack spacing={4} bg="gray.50" px={10} py={8} rounded="lg">
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

export function AnnotatedUserStat({
  annotation,
  label,
  value,
  children,
  ...props
}) {
  const {colors} = useTheme()
  return (
    <UserStat {...props}>
      <UserStatLabel borderBottom={`dotted 1px ${colors.muted}`} cursor="help">
        <UserStatLabelTooltip label={annotation}>{label}</UserStatLabelTooltip>
      </UserStatLabel>
      {value && <UserStatValue>{value}</UserStatValue>}
      {children}
    </UserStat>
  )
}

export function UserStat(props) {
  return <Stat as={Stack} spacing="2px" {...props} />
}

export function UserStatLabel(props) {
  return (
    <StatLabel
      color="muted"
      alignSelf="flex-start"
      fontSize="md"
      lineHeight="short"
      {...props}
    />
  )
}

export function UserStatValue(props) {
  return (
    <StatNumber fontSize="md" fontWeight={500} lineHeight="base" {...props} />
  )
}

export function UserStatLabelTooltip(props) {
  return <Tooltip placement="top" zIndex="tooltip" {...props} />
}

// eslint-disable-next-line react/display-name
export const ActivateInviteForm = React.forwardRef((props, ref) => {
  const {t} = useTranslation()

  const failToast = useFailToast()

  const [{activationTx}, {activateInvite}] = useInvite()

  const {state: status} = useIdentityState()

  const [code, setCode] = React.useState()

  const mining = !!activationTx

  return (
    <Box
      ref={ref}
      as="form"
      onSubmit={async e => {
        e.preventDefault()
        try {
          await activateInvite(code?.trim())
        } catch ({message}) {
          failToast(
            // eslint-disable-next-line no-nested-ternary
            message.includes('missing')
              ? t('Invitation code is not valid')
              : message.includes('validation ceremony')
              ? t('Can not activate invitation since the validation is running')
              : message
          )
        }
      }}
      {...props}
    >
      <Stack spacing={6}>
        <FormControl>
          <Stack spacing={3}>
            <Flex justify="space-between" align="center">
              <FormLabel htmlFor="code" p={0}>
                {t('Invitation code')}
              </FormLabel>
              <Button
                variant="ghost"
                isDisabled={mining || status === IdentityStatus.Invite}
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
              isDisabled={mining || status === IdentityStatus.Invite}
              placeholder={
                status === IdentityStatus.Invite
                  ? 'Click the button to activate invitation'
                  : ''
              }
              resize="none"
              _disabled={{
                bg: 'gray.50',
              }}
              _placeholder={{
                color: 'muted',
              }}
              onChange={e => setCode(e.target.value)}
            />
          </Stack>
        </FormControl>
        <PrimaryButton
          isLoading={mining}
          loadingText={t('Mining...')}
          type="submit"
          ml="auto"
        >
          {t('Activate invite')}
        </PrimaryButton>
      </Stack>
    </Box>
  )
})

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
      onSubmit={e => {
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

export function ValidationResultToast({epoch}) {
  const timerMachine = React.useMemo(
    () =>
      createTimerMachine(
        dayjs(loadPersistentStateValue('validationResults', epoch)?.epochStart)
          .add(1, 'minute')
          .diff(dayjs(), 'second')
      ),
    [epoch]
  )
  const [current] = useMachine(timerMachine)

  const [state, dispatch] = usePersistence(
    React.useReducer(
      (prevState, seen) => ({
        ...prevState,
        [epoch]: {
          ...prevState[epoch],
          seen,
        },
      }),
      loadPersistentState('validationResults') || {}
    ),
    'validationResults'
  )

  const {address, state: identityStatus} = useIdentityState()

  const isValidationSucceeded = [
    IdentityStatus.Newbie,
    IdentityStatus.Verified,
    IdentityStatus.Human,
  ].includes(identityStatus)

  const {t} = useTranslation()

  const url = `https://scan.idena.io/identity/${address}/epoch/${epoch}/${
    isValidationSucceeded ? 'rewards' : 'validation'
  }`

  const notSeen =
    typeof state[epoch] === 'boolean'
      ? !state[epoch]
      : state[epoch] && !state[epoch].seen

  return notSeen ? (
    <Snackbar>
      {current.matches('running') && (
        <Toast
          icon="spinner"
          title={t('Please wait for the validation report')}
        />
      )}
      {current.matches('stopped') && (
        <Toast
          title={
            isValidationSucceeded
              ? t('See your validation rewards in the blockchain explorer')
              : t('See your validation results in the blockchain explorer')
          }
          onAction={() => {
            dispatch(true)
            global.openExternal(url)
          }}
          actionContent={t('Open')}
        />
      )}
    </Snackbar>
  ) : null
}

export function ActivateMiningForm({
  isOnline,
  delegatee,
  delegationEpoch,
  onShow,
}) {
  const toast = useToast()

  const epoch = useEpochState()

  const [current, send] = useMachine(activateMiningMachine, {
    context: {
      isOnline,
      delegatee,
      delegationEpoch,
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
          isOpen={eitherState(current, 'showing')}
          isCloseable={false}
          isLoading={eitherState(current, 'showing.mining')}
          onChangeMode={value => {
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

  const {colors} = useTheme()

  const accentColor = isOnline ? 'blue' : 'red'

  return (
    <Stack spacing={3}>
      <Text fontWeight={500} h={18}>
        {t('Status')}
      </Text>
      <Flex
        align="center"
        justify="space-between"
        borderColor="gray.300"
        borderWidth={1}
        rounded="md"
        h={8}
        px={3}
      >
        <FormLabel htmlFor="mining" fontWeight="normal" pb={0}>
          {isDelegator ? t('Delegation') : t('Mining')}
        </FormLabel>
        <Stack isInline align="center">
          <Text color={`${accentColor}.500`} fontWeight={500}>
            {isOnline ? t('On') : t('Off')}
          </Text>
          <Switch
            id="mining"
            size="sm"
            isChecked={isOnline}
            color={accentColor}
            h={4}
            className="toggle"
            onChange={onShow}
          />
          <style jsx global>{`
            .toggle > input[type='checkbox']:not(:checked) + div {
              background: ${colors.red[500]};
            }
          `}</style>
        </Stack>
      </Flex>
    </Stack>
  )
}

export function ActivateMiningDrawer({
  mode,
  isLoading,
  onChangeMode,
  onActivate,
  onClose,
  ...props
}) {
  const {t} = useTranslation()

  const delegateeInputRef = React.useRef()

  const willDelegate = mode === NodeType.Delegator

  return (
    <Drawer onClose={onClose} {...props}>
      <DrawerHeader>
        <Flex
          align="center"
          justify="center"
          bg="blue.012"
          h={12}
          w={12}
          rounded="xl"
        >
          <Icon name="user" w={6} h={6} color="blue.500" />
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
            <RadioButtonGroup
              spacing={2}
              isInline
              d="flex"
              value={mode}
              onChange={onChangeMode}
            >
              <Radio
                value={NodeType.Miner}
                flex={1}
                borderColor="gray.300"
                borderWidth={1}
                borderRadius="md"
                p={2}
                px={3}
              >
                {t('Mining')}
              </Radio>
              <Radio
                value={NodeType.Delegator}
                flex={1}
                borderColor="gray.300"
                borderWidth={1}
                borderRadius="md"
                p={2}
                px={3}
              >
                {t('Delegation')}
              </Radio>
            </RadioButtonGroup>
          </FormControl>
          {willDelegate ? (
            <Stack spacing={5}>
              <FormControl as={Stack} spacing={3}>
                <FormLabel>{t('Delegation address')}</FormLabel>
                <Input ref={delegateeInputRef} />
              </FormControl>
              <Alert
                status="error"
                rounded="md"
                bg="red.010"
                borderColor="red.050"
                borderWidth={1}
              >
                <AlertIcon name="info" alignSelf="flex-start" color="red.500" />
                <AlertDescription
                  as={Stack}
                  spacing={3}
                  color="brandGray.500"
                  fontSize="md"
                  fontWeight={500}
                >
                  <Text>
                    {t(
                      `Please be aware that both mining and validation rewards will go to the pool’s owner address if you delegate your mining status. Your address will get only the part of rewards that goes to your stake. Your identity could be terminated by the pool owner and you can lose your stake.`
                    )}
                  </Text>
                  <Text>
                    {t(
                      'Disabling delegation could be done at the next epoch only.'
                    )}
                  </Text>
                </AlertDescription>
              </Alert>
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
      <DrawerFooter px={0}>
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
    </Drawer>
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
    <Drawer onClose={onClose} {...props}>
      <DrawerHeader>
        <Flex
          align="center"
          justify="center"
          bg="blue.012"
          h={12}
          w={12}
          rounded="xl"
        >
          <Icon name="user" w={6} h={6} color="blue.500" />
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
              <AlertIcon name="info" alignSelf="flex-start" color="red.500" />
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
      <DrawerFooter px={0}>
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
    </Drawer>
  )
}

export function InviteScoreAlert({
  sync: {highestBlock},
  epoch,
  identity: {canInvite},
  ...props
}) {
  const {t} = useTranslation()

  const [showInviteScore, setShowInviteScore] = React.useState()

  React.useEffect(() => {
    const hasPendingInvites =
      (global.invitesDb ?? {})
        .getInvites()
        .filter(
          ({activated, terminatedHash, deletedAt}) =>
            !activated && !terminatedHash && !deletedAt
        ).length > 0
    setShowInviteScore(hasPendingInvites || canInvite)
  }, [canInvite])

  return showInviteScore ? (
    <SuccessAlert minH={36} w="full" {...props}>
      {t(
        'You will get {{invitationRewardRatio}} of the invitation rewards if your invite is activated now',
        {
          invitationRewardRatio: toPercent(
            calculateInvitationRewardRatio(epoch ?? {}, {
              highestBlock,
            })
          ),
        }
      )}
    </SuccessAlert>
  ) : null
}

export function KillIdentityDrawer({address, children, ...props}) {
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
  const {t} = useTranslation(['translation', 'error'])

  const [{address, stake}, {killMe}] = useIdentity()

  const toastSuccess = useSuccessToast()
  const toastFail = useFailToast()

  const [submitting, setSubmitting] = React.useState(false)

  return (
    <Stack
      as="form"
      spacing={6}
      onSubmit={async e => {
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
      <FormControl>
        <FormLabel htmlFor="stake">{t('Withraw stake, iDNA')}</FormLabel>
        <Input
          id="stake"
          value={stake}
          isDisabled
          _disabled={{
            bg: 'gray.50',
          }}
        />
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
        variantColor="red"
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
