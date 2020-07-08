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
} from '../../shared/components/components'
import {rem} from '../../shared/theme'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {
  mapToFriendlyStatus,
  useIdentityState,
} from '../../shared/providers/identity-context'
import {IdentityStatus} from '../../shared/types'
import {
  useNotificationDispatch,
  NotificationType,
} from '../../shared/providers/notification-context'
import {
  useInviteState,
  useInviteDispatch,
} from '../../shared/providers/invite-context'
import useRpc from '../../shared/hooks/use-rpc'
import useTx from '../../shared/hooks/use-tx'
import {
  FormGroup,
  Label,
  Switcher,
  SubHeading,
  Modal,
} from '../../shared/components'
import {Notification, Snackbar} from '../../shared/components/notifications'
import {Spinner} from '../../shared/components/spinner'
import {
  loadPersistentState,
  loadPersistentStateValue,
} from '../../shared/utils/persist'
import {createTimerMachine} from '../../shared/machines'
import {usePersistence} from '../../shared/hooks/use-persistent-state'

export function UserCard({address, state}) {
  return (
    <Stack isInline spacing={6} align="center" mb={6} width={rem(480)}>
      <Avatar address={address} />
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
    </Stack>
  )
}

export function UserStatList(props) {
  return (
    <Stack spacing={4} bg="gray.50" px={10} py={8} rounded="lg" {...props} />
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

export function ActivateInviteForm() {
  const {t} = useTranslation()

  const {addError} = useNotificationDispatch()

  const {activationTx} = useInviteState()
  const {activateInvite} = useInviteDispatch()

  const {canActivateInvite, state: status} = useIdentityState()

  if (!canActivateInvite) {
    return null
  }

  const mining = !!activationTx

  return (
    <Box
      as="form"
      onSubmit={async e => {
        e.preventDefault()

        try {
          await activateInvite(e.target.elements.code.value)
        } catch ({message}) {
          addError({
            title: message,
          })
        }
      }}
    >
      <Stack isInline spacing={2} align="flex-end">
        <FormControl justifySelf="stretch" flex={1}>
          <FormLabel htmlFor="code">{t('Invitation code')}</FormLabel>
          <Input
            id="code"
            isDisabled={mining || status === IdentityStatus.Invite}
            placeholder={
              status === IdentityStatus.Invite &&
              'Click the button to activate invitation'
            }
            _disabled={{
              bg: 'gray.50',
            }}
          />
        </FormControl>
        <PrimaryButton isDisabled={mining} type="submit">
          {mining ? t('Mining...') : t('Activate invite')}
        </PrimaryButton>
      </Stack>
    </Box>
  )
}

export function SpoilInviteDrawer({children, ...props}) {
  const {t} = useTranslation()
  return (
    <Drawer {...props}>
      <DrawerHeader mb={6}>
        <Avatar address={`0x${'2'.repeat(64)}`} mx="auto" />
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

const miningSwitcherDefaultState = {
  online: null,
  showModal: false,
  isMining: false,
}

export function MinerStatusSwitcher() {
  const identity = useIdentityState()
  const {addError} = useNotificationDispatch()

  const [{result: hash, error}, callRpc] = useRpc()
  const [{mined}, setHash] = useTx()

  const [state, dispatch] = React.useReducer(function miningReducer(
    // eslint-disable-next-line no-shadow
    state,
    [action, {online} = miningSwitcherDefaultState]
  ) {
    switch (action) {
      case 'init':
        return {
          ...state,
          online,
        }
      case 'open':
        return {
          ...state,
          showModal: true,
        }
      case 'close':
        return {
          ...state,
          showModal: false,
        }

      case 'toggle':
        return {
          ...state,
          isMining: true,
        }
      case 'mined':
        return {
          ...state,
          isMining: false,
          showModal: false,
        }
      case 'error':
        return {
          ...state,
          showModal: false,
          isMining: false,
        }
      default:
        return state
    }
  }, miningSwitcherDefaultState)

  React.useEffect(() => {
    if (!state.showModal) {
      dispatch(['init', identity])
    }
  }, [identity, state.showModal])

  React.useEffect(() => setHash(hash), [hash, setHash])

  React.useEffect(() => {
    if (error) {
      dispatch(['error'])
      addError({title: error.message})
    }
  }, [addError, error])

  React.useEffect(() => {
    if (mined) {
      dispatch(['mined'])
    }
  }, [mined])

  const {t} = useTranslation()

  const {colors} = useTheme()

  if (!identity.canMine) {
    return null
  }

  return (
    <Box mb={6}>
      <FormGroup onClick={() => dispatch(['open'])}>
        <div className="form-control">
          <Flex align="center" justify="space-between">
            <Label
              htmlFor="switcher"
              style={{margin: 0, cursor: 'pointer', maxWidth: rem(110)}}
            >
              {t('Mining')}
            </Label>
            <Box pointerEvents="none">
              {state.online !== null && state.online !== undefined && (
                <Switcher
                  withStatusHint
                  isChecked={state.online}
                  isInProgress={state.isMining}
                  bgOff={colors.red[500]}
                  bgOn={colors.brandBlue[500]}
                />
              )}
            </Box>
          </Flex>
        </div>
        <style jsx>{`
          .form-control {
            border: solid 1px ${colors.gray[300]};
            color: ${colors.brandGray[500]};
            background: ${colors.white};
            border-radius: 6px;
            font-size: 1em;
            padding: 0.5em 1em 0.65em;
            cursor: pointer;
          }
        `}</style>
      </FormGroup>
      <Modal show={state.showModal} onHide={() => dispatch(['close'])}>
        <Box mb={4}>
          <SubHeading>
            {!state.online
              ? t('Activate mining status')
              : t('Deactivate mining status')}
          </SubHeading>
          <Text>
            {!state.online ? (
              <span>
                {t(`Submit the form to start mining. Your node has to be online
                unless you deactivate your status. Otherwise penalties might be
                charged after being offline more than 1 hour.`)}
                <br />
                <br />
                {t('You can deactivate your online status at any time.')}
              </span>
            ) : (
              <span>
                {t('Submit the form to deactivate your mining status.')}
                <br />
                <br />
                {t('You can activate it again afterwards.')}
              </span>
            )}
          </Text>
        </Box>
        <Stack isInline spacing={2} justify="flex-end">
          <SecondaryButton onClick={() => dispatch(['close'])}>
            {t('Cancel')}
          </SecondaryButton>
          <PrimaryButton
            onClick={() => {
              dispatch(['toggle'])
              callRpc(
                state.online ? 'dna_becomeOffline' : 'dna_becomeOnline',
                {}
              )
            }}
            isDisabled={state.isMining}
          >
            {state.isMining ? t('Waiting...') : t('Submit')}
          </PrimaryButton>
        </Stack>
      </Modal>
    </Box>
  )
}

export function ValidationResultToast({epoch}) {
  const timerMachine = React.useMemo(
    () =>
      createTimerMachine(
        dayjs(loadPersistentStateValue('validationResults', epoch).epochStart)
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

  const {colors} = useTheme()

  const url = `https://scan.idena.io/${
    isValidationSucceeded ? 'reward' : 'answers'
  }?epoch=${epoch}&identity=${address}`

  const notSeen =
    typeof state[epoch] === 'boolean'
      ? !state[epoch]
      : state[epoch] && !state[epoch].seen

  return notSeen ? (
    <Snackbar>
      {current.matches('running') && (
        <Notification
          pinned
          type={NotificationType.Info}
          icon={
            <Flex
              align="center"
              justify="center"
              css={{
                height: rem(20),
                width: rem(20),
                marginRight: rem(12),
              }}
            >
              <Box style={{transform: 'scale(0.35) translateY(-10px)'}}>
                <Spinner color={colors.brandBlue[500]} />
              </Box>
            </Flex>
          }
          title={t('Please wait for the validation report')}
        />
      )}
      {current.matches('stopped') && (
        <Notification
          pinned
          type={NotificationType.Info}
          title={
            isValidationSucceeded
              ? t('See your validation rewards in the blockchain explorer')
              : t('See your validation results in the blockchain explorer')
          }
          action={() => {
            dispatch(true)
            global.openExternal(url)
          }}
          actionName={t('Open')}
        />
      )}
    </Snackbar>
  ) : null
}
