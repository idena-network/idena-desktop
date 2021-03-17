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
  Textarea,
  Button,
  RadioButtonGroup,
  Radio,
  DrawerFooter,
  Icon,
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
import {FormGroup, Label, Switcher} from '../../shared/components'
import {Notification, Snackbar} from '../../shared/components/notifications'
import {Spinner} from '../../shared/components/spinner'
import {
  loadPersistentState,
  loadPersistentStateValue,
} from '../../shared/utils/persist'
import {createTimerMachine} from '../../shared/machines'
import {usePersistence} from '../../shared/hooks/use-persistent-state'

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

// eslint-disable-next-line react/display-name
export const ActivateInviteForm = React.forwardRef((props, ref) => {
  const {t} = useTranslation()

  const {addError} = useNotificationDispatch()

  const {activationTx} = useInviteState()
  const {activateInvite} = useInviteDispatch()

  const {canActivateInvite, state: status} = useIdentityState()

  const [code, setCode] = React.useState()

  if (!canActivateInvite) {
    return null
  }

  const mining = !!activationTx

  return (
    <Box
      ref={ref}
      as="form"
      {...props}
      onSubmit={async e => {
        e.preventDefault()
        try {
          await activateInvite(code?.trim())
        } catch ({message}) {
          addError({
            title: message,
          })
        }
      }}
    >
      <Stack spacing={6}>
        <FormControl>
          <Stack spacing={2}>
            <Flex justify="space-between" align="center">
              <FormLabel htmlFor="code" color="muted">
                {t('Invitation code')}
              </FormLabel>
              <Button
                variant="ghost"
                isDisabled={mining || status === IdentityStatus.Invite}
                bg="unset"
                color="muted"
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
            <Textarea
              id="code"
              value={code}
              borderColor="gray.300"
              px={3}
              pt="3/2"
              pb={2}
              isDisabled={mining || status === IdentityStatus.Invite}
              minH={rem(50)}
              placeholder={
                status === IdentityStatus.Invite &&
                'Click the button to activate invitation'
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

export function MinerStatusSwitcher() {
  const {t} = useTranslation()

  const {colors} = useTheme()

  const initialRef = React.useRef()

  const identity = useIdentityState()
  const {addError} = useNotificationDispatch()

  const [{result: hash, error}, callRpc] = useRpc()
  const [{mined}, setHash] = useTx()

  const [state, dispatch] = React.useReducer(
    function miningReducer(
      // eslint-disable-next-line no-shadow
      state,
      [action, payload]
    ) {
      switch (action) {
        case 'init':
          return {
            ...state,
            online: payload.online,
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
    },
    {
      online: null,
      showModal: false,
      isMining: false,
    }
  )

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

  if (!identity.canMine) {
    return null
  }

  return (
    <>
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
      <Drawer
        isOpen={state.showModal}
        isCloseable={false}
        onClose={() => dispatch(['close'])}
      >
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
            <FormLabel m={0} p={0}>
              {t('Type')}
            </FormLabel>
            <RadioButtonGroup mt={3}>
              <Stack isInline spacing={2}>
                <Radio
                  borderColor="gray.300"
                  borderWidth={1}
                  borderRadius="md"
                  p={2}
                  px={3}
                >
                  {t('Mining')}
                </Radio>
                <Radio
                  borderColor="gray.300"
                  borderWidth={1}
                  borderRadius="md"
                  p={2}
                  px={3}
                >
                  {t('Delegation')}
                </Radio>
              </Stack>
            </RadioButtonGroup>
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
                {t(`Submit the form to start mining. Your node has to be online unless you deactivate your status. Otherwise penalties might be charged after being offline more than 1 hour.
You can deactivate your online status at any time.`)}
              </Text>
              <Text fontSize="md" color="muted">
                {t('You can deactivate your online status at any time.')}
              </Text>
            </Box>
          </Stack>
        </DrawerBody>
        <DrawerFooter px={0}>
          <Stack isInline>
            <SecondaryButton fontSize="md">{t('Cancel')}</SecondaryButton>
            <PrimaryButton
              isLoading={state.isMining}
              onClick={() => {
                dispatch(['toggle'])
                callRpc(
                  state.online ? 'dna_becomeOffline' : 'dna_becomeOnline',
                  {}
                )
              }}
            >
              {state.isMining ? t('Waiting...') : t('Submit')}
            </PrimaryButton>
          </Stack>
        </DrawerFooter>
      </Drawer>
    </>
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
        <Notification
          pinned
          type={NotificationType.Info}
          icon={
            <Flex align="center" justify="center" h={5} w={5} mr={3}>
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
