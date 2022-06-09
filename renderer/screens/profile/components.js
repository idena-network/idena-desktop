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
  Radio,
  Icon,
  Switch,
  Alert,
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
  HStack,
  Wrap,
  WrapItem,
  StatHelpText,
  Center,
  RadioGroup,
  InputGroup,
  InputRightElement,
  IconButton,
  useBoolean,
  useClipboard,
} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {useQuery} from 'react-query'
import QrCode from 'qrcode.react'
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
  FailAlert,
  IconDrawerHeader,
  ArrowTextLink,
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
  toLocaleDna,
  toPercent,
} from '../../shared/utils/utils'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useFailToast, useSuccessToast} from '../../shared/hooks/use-toast'
import {validateInvitationCode} from './utils'
import {BLOCK_TIME} from '../oracles/utils'
import {
  useInvitationRewardRatio,
  useInvitationRewardRatioProps,
  useReplenishStake,
  useStakingAlert,
} from './hooks'
import {DnaInput, FillCenter} from '../oracles/components'
import {useTotalValidationScore} from '../validation-report/hooks'
import {
  EyeIcon,
  EyeOffIcon,
  PrivateKeyIcon,
  UserIcon,
} from '../../shared/components/icons'

export function UserInlineCard({
  identity: {address, state},
  children,
  ...props
}) {
  return (
    <HStack spacing="6" align="center" {...props}>
      <Avatar
        address={address}
        bg="white"
        border="solid 1px"
        borderColor="gray.016"
      />
      <Stack spacing="1.5">
        <Stack spacing="1">
          <Heading as="h2" fontSize="lg" fontWeight={500} lineHeight="shorter">
            {mapToFriendlyStatus(state)}
          </Heading>
          <Heading
            as="h3"
            fontSize="mdx"
            fontWeight="normal"
            color="muted"
            lineHeight="5"
          >
            {address}
          </Heading>
        </Stack>
        {children}
      </Stack>
    </HStack>
  )
}

export function UserStatList({title, children, ...props}) {
  return (
    <Stack spacing="4" {...props}>
      <Heading as="h4" fontSize="lg" fontWeight={500} lineHeight="6">
        {title}
      </Heading>
      <Box bg="gray.50" borderRadius="lg" px="10" py="6">
        {children}
      </Box>
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
      <UserStatLabel
        borderBottom={`dotted 1px ${colors.muted}`}
        cursor="help"
        fontWeight={500}
      >
        <UserStatLabelTooltip label={annotation}>{label}</UserStatLabelTooltip>
      </UserStatLabel>
      {value && <UserStatValue>{value}</UserStatValue>}
      {children}
    </UserStat>
  )
}

export function UserStat({children, ...props}) {
  return (
    <Stat pt="2" pb="3" {...props}>
      <Stack spacing="1">{children}</Stack>
    </Stat>
  )
}

export function UserStatLabel(props) {
  return (
    <StatLabel color="muted" fontSize="md" lineHeight="4" minH="4" {...props} />
  )
}

export function UserStatValue(props) {
  return (
    <StatNumber
      fontSize="md"
      fontWeight={500}
      lineHeight="4"
      minH="4"
      {...props}
    />
  )
}

export function UserStatLabelTooltip(props) {
  return <Tooltip placement="top" zIndex="tooltip" {...props} />
}

export function UserStatHelpText(props) {
  return (
    <StatHelpText
      fontSize="md"
      fontWeight={500}
      lineHeight="4"
      opacity={1}
      minH="4"
      {...props}
    />
  )
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
        onSubmit={async e => {
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
              ['missing', 'invalid'].some(errorCode =>
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
                  <FormLabel htmlFor="code">{t('Invitation code')}</FormLabel>
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
                  onChange={e => setCode(e.target.value)}
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
        <Center as={Stack} spacing="4">
          <Avatar address={dummyAddress} />
          <Heading fontSize="lg" fontWeight={500}>
            {t('Spoil invitation code')}
          </Heading>
        </Center>
      </DrawerHeader>
      <DrawerBody>
        <Text fontSize="md" mb="6">
          {t(
            `Spoil invitations that are shared publicly. This will encourage people to share invitations privately and prevent bots from collecting invitation codes.`
          )}
        </Text>
        {children}
      </DrawerBody>
      <DrawerFooter>
        <PrimaryButton type="submit" form="spoilInvite">
          {t('Spoil invite')}
        </PrimaryButton>
      </DrawerFooter>
    </Drawer>
  )
}

export function SpoilInviteForm({onSpoil}) {
  const {t} = useTranslation()

  return (
    <Stack spacing="6">
      <form
        id="spoilInvite"
        onSubmit={e => {
          e.preventDefault()
          onSpoil(e.target.elements.key.value)
        }}
      >
        <FormControl>
          <Stack spacing="3">
            <FormLabel htmlFor="key">{t('Invitation code')}</FormLabel>
            <Input id="key" placeholder={t('Invitation code to spoil')} />
          </Stack>
        </FormControl>
      </form>
      <Text>
        {t(
          `When you click 'Spoil' the invitation code will be activated by a random address and wasted.`
        )}
      </Text>
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

  return (
    <Stack spacing={3}>
      <Text fontWeight={500} h="4.5" lineHeight="4.5">
        {t('Status')}
      </Text>
      <FormControl
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        borderColor="gray.300"
        borderWidth={1}
        borderRadius="md"
        px="3"
        h="8"
        w="full"
      >
        <FormLabel htmlFor="mining" fontWeight="normal">
          {isDelegator ? t('Delegation') : t('Mining')}
        </FormLabel>
        <HStack align="center">
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
        </HStack>
      </FormControl>
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
    <Drawer onClose={onClose} {...props}>
      <IconDrawerHeader icon={<UserIcon />}>
        {t('Miner status')}
      </IconDrawerHeader>
      <DrawerBody>
        <Stack spacing="6">
          <FormControl as={Stack} spacing="3">
            <FormLabel>{t('Type')}</FormLabel>
            <ActivateMiningRadioGroup value={mode} onChange={onChangeMode}>
              <Radio value={NodeType.Miner}>{t('Mining')}</Radio>
              <Radio value={NodeType.Delegator}>{t('Delegation')}</Radio>
            </ActivateMiningRadioGroup>
          </FormControl>

          {willDelegate ? (
            <Stack spacing="5">
              <FormControl as={Stack} spacing="3">
                <FormLabel>{t('Delegation address')}</FormLabel>
                <Input
                  ref={delegateeInputRef}
                  defaultValue={pendingUndelegation}
                  isDisabled={Boolean(pendingUndelegation)}
                />
              </FormControl>

              {pendingUndelegation ? (
                <FailAlert>
                  {t(
                    'You have recently disabled delegation. You need to wait for {{count}} epochs to delegate to a new address.',
                    {count: waitForDelegationEpochs}
                  )}
                </FailAlert>
              ) : (
                <FailAlert>
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
                </FailAlert>
              )}
            </Stack>
          ) : (
            <Stack bg="gray.50" p="6" pt="4.5">
              <Heading fontSize="base" fontWeight={500} lineHeight="6" h="6">
                {t('Activate mining status')}
              </Heading>
              <Stack spacing="1">
                <Text color="muted">
                  {t(
                    `Submit the form to start mining. Your node has to be online unless you deactivate your status. Otherwise penalties might be charged after being offline more than 1 hour.`
                  )}
                </Text>
                <Text color="muted">
                  {t('You can deactivate your online status at any time.')}
                </Text>
              </Stack>
            </Stack>
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
      <IconDrawerHeader icon={<UserIcon />}>
        {isDelegator
          ? t('Deactivate delegation status')
          : t('Deactivate mining status')}
      </IconDrawerHeader>
      <DrawerBody mt="6">
        <Stack spacing="6">
          <Text color="gray.500" fontSize="md">
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
            <FailAlert>
              {t('You can disable delegation at the next epoch only')}
            </FailAlert>
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
    </Drawer>
  )
}

function ActivateMiningRadioGroup({children, ...props}) {
  return (
    <RadioGroup {...props}>
      <HStack w="full">
        {React.Children.map(children, child => (
          <Box
            flex={1}
            borderWidth={1}
            borderColor="gray.300"
            borderRadius="md"
            px="3"
            py="2"
          >
            {child}
          </Box>
        ))}
      </HStack>
    </RadioGroup>
  )
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
        <FormLabel htmlFor="stake">{t('Withdraw stake, iDNA')}</FormLabel>
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

export function MyIdenaBotAlert({onConnect}) {
  const {t} = useTranslation()

  const {state} = useIdentityState()

  const myIdenaBotDisclosure = useDisclosure()

  const [doNotShowAgain, setDoNotShowAgain] = React.useState()

  const connectButtonRef = React.useRef()

  // eslint-disable-next-line no-shadow
  const eitherState = (...states) => states.some(s => s === state)

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
        p="3"
        mt="2"
        mx="2"
        w="auto"
        onClick={myIdenaBotDisclosure.onOpen}
      >
        {t(`Subscribe to @MyIdenaBot to get personalized notifications based on
        your status`)}
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
            onChange={e => {
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
  const {t, i18n} = useTranslation()

  const [
    {age, penalty, totalShortFlipPoints, totalQualifiedFlips},
  ] = useIdentity()

  const epoch = useEpochState()

  const score = useTotalValidationScore()

  const invitationRewardRatio = useInvitationRewardRatio()

  const invitationRewardRatioProps = useInvitationRewardRatioProps()

  const formatDna = toLocaleDna(i18n.language, {maximumFractionDigits: 5})

  return (
    <Wrap spacing="1">
      {age > 0 && <ProfileTag label={t('Age')} value={age} />}

      {/* <ProfileTag label={t('Age')} value={age} />
      <ProfileTag label={t('Age')} value={age} />
      <ProfileTag label={t('Age')} value={age} /> */}

      {Number.isFinite(score) && (
        <Box>
          <ProfileTagPopover>
            <PopoverTrigger>
              <Box>
                <ProfileTag
                  label={t('Score')}
                  value={toPercent(score)}
                  cursor="help"
                />
              </Box>
            </PopoverTrigger>
            <ProfileTagPopoverContent>
              <Stack>
                <Stack spacing="2px">
                  <Text color="muted" lineHeight="shorter">
                    {t('Total score')}
                  </Text>
                  <Text color="white" lineHeight="base">
                    {t(
                      `{{totalShortFlipPoints}} out of {{totalQualifiedFlips}}`,
                      {
                        totalShortFlipPoints,
                        totalQualifiedFlips,
                      }
                    )}
                  </Text>
                </Stack>
                <Stack spacing="2px">
                  <Text color="muted" lineHeight="shorter">
                    {t('Epoch #{{epoch}}', {epoch: epoch?.epoch})}
                  </Text>
                  <ArrowTextLink
                    href="/validation-report"
                    color="white"
                    fontSize="sm"
                    lineHeight="4"
                  >
                    {t('Validation report')}
                  </ArrowTextLink>
                </Stack>
              </Stack>
            </ProfileTagPopoverContent>
          </ProfileTagPopover>
        </Box>
      )}

      {penalty > 0 && (
        <ProfileTag
          label={t('Mining penalty')}
          value={formatDna(penalty)}
          bg="red.012"
          color="red.500"
        />
      )}

      {invitationRewardRatio && (
        <Box>
          <ProfileTagPopover>
            <ProfileTagPopoverTrigger>
              <ProfileTag
                label={t('Invitation rewards')}
                value={toPercent(invitationRewardRatio)}
                cursor="help"
                {...invitationRewardRatioProps}
              />
            </ProfileTagPopoverTrigger>
            <ProfileTagPopoverContent>
              <Stack spacing="0.5" w="40">
                <Text color="xwhite.040" lineHeight="4">
                  {t(
                    'You will get {{invitationRewardRatio}} of the invitation rewards if your invite is activated now',
                    {invitationRewardRatio: toPercent(invitationRewardRatio)}
                  )}
                </Text>
                <Box>
                  <ArrowTextLink
                    href="/contacts"
                    color="white"
                    fontSize="sm"
                    lineHeight="4"
                  >
                    {t('Check invites')}
                  </ArrowTextLink>
                </Box>
              </Stack>
            </ProfileTagPopoverContent>
          </ProfileTagPopover>
        </Box>
      )}
    </Wrap>
  )
}

export function ProfileTag({label, value, ...props}) {
  return (
    <WrapItem>
      <Tag
        bg="gray.016"
        borderRadius="xl"
        fontSize="sm"
        px="3"
        minH="6"
        {...props}
      >
        <HStack spacing="1">
          <Text>{label}</Text>
          <Text>{value}</Text>
        </HStack>
      </Tag>
    </WrapItem>
  )
}

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

export function ReplenishStakeDrawer({onSuccess, onError, ...props}) {
  const {t, i18n} = useTranslation()

  const {address, state} = useIdentityState()

  const {data: balanceData} = useQuery({
    queryKey: ['get-balance', address],
    // eslint-disable-next-line no-shadow
    queryFn: ({queryKey: [, address]}) => callRpc('dna_getBalance', address),
    enabled: Boolean(address),
    staleTime: (BLOCK_TIME / 2) * 1000,
    notifyOnChangeProps: 'tracked',
  })

  const {submit} = useReplenishStake({onSuccess, onError})

  const formatDna = toLocaleDna(i18n.language, {
    maximumFractionDigits: 5,
  })

  const isRisky = [
    IdentityStatus.Candidate,
    IdentityStatus.Newbie,
    IdentityStatus.Verified,
  ].includes(state)

  return (
    <Drawer {...props}>
      <DrawerHeader>
        <Stack spacing="4">
          <FillCenter bg="blue.012" h={12} minH={12} w={12} rounded="xl">
            <Icon name="wallet" w="6" h="6" color="blue.500" />
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
              onSubmit={e => {
                e.preventDefault()

                const formData = new FormData(e.target)

                const amount = formData.get('amount')

                submit({amount})
              }}
            >
              <FormControl>
                <FormLabel mb="3">{t('Amount')}</FormLabel>
                <DnaInput name="amount" />
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
            </form>
          </Stack>
          {isRisky && (
            <FailAlert>
              {state === IdentityStatus.Verified
                ? t(
                    'You will lose 100% of the Stake if you fail the upcoming validation'
                  )
                : t(
                    'You will lose 100% of the Stake if you fail or miss the upcoming validation'
                  )}
            </FailAlert>
          )}
        </Stack>
      </DrawerBody>
      <DrawerFooter>
        <Stack isInline>
          {/* eslint-disable-next-line react/destructuring-assignment */}
          <SecondaryButton onClick={props.onClose}>
            {t('Not now')}
          </SecondaryButton>
          <PrimaryButton form="replenishStake" type="submit">
            {t('Add stake')}
          </PrimaryButton>
        </Stack>
      </DrawerFooter>
    </Drawer>
  )
}

export function StakingAlert(props) {
  const warning = useStakingAlert()

  return warning ? (
    <FailAlert {...props}>
      {Array.isArray(warning) ? (
        <Stack spacing={0}>
          {warning.map((message, idx) => (
            <Text key={idx} as="span">
              {message}
            </Text>
          ))}
        </Stack>
      ) : (
        warning
      )}
    </FailAlert>
  ) : null
}

export function ExportPrivateKeyDrawer(props) {
  const {t} = useTranslation()

  const [step, setStep] = React.useState('passphrase')

  const [revealPassword, setRevealPassword] = useBoolean()

  const [encodedKey, setEncodedKey] = React.useState()

  const clipboard = useClipboard(encodedKey)

  return (
    <Drawer {...props}>
      <IconDrawerHeader icon={<PrivateKeyIcon />}>
        {t('Export private key')}
      </IconDrawerHeader>

      <DrawerBody>
        <Stack spacing="5">
          {step === 'passphrase' ? (
            <>
              <Text>
                {t('Create a new password to export your private key')}
              </Text>
              <form
                id="exportPrivateKey"
                onSubmit={async e => {
                  e.preventDefault()

                  setEncodedKey(
                    await callRpc(
                      'dna_exportKey',
                      new FormData(e.target).get('password')
                    )
                  )

                  setStep('encodedPrivateKey')
                }}
              >
                <FormControl isRequired>
                  <Stack>
                    <FormLabel>{t('New password')}</FormLabel>
                    <InputGroup>
                      <Input
                        name="password"
                        type={revealPassword ? 'text' : 'password'}
                      />
                      <InputRightElement>
                        <IconButton
                          variant="unstyled"
                          icon={
                            revealPassword ? (
                              <EyeIcon boxSize="4" />
                            ) : (
                              <EyeOffIcon boxSize="4" />
                            )
                          }
                          size="xs"
                          onClick={setRevealPassword.toggle}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </Stack>
                </FormControl>
              </form>
            </>
          ) : (
            <>
              <Text>
                {t(
                  'Scan QR by your mobile phone or copy code below for export private key.'
                )}
              </Text>
              <Center>
                <Box borderRadius="md" boxShadow="md" p="2">
                  <QrCode value="encodedPrivateKey" />
                </Box>
              </Center>
              <FormControl>
                <Stack spacing="1">
                  <Flex justify="space-between" align="center">
                    <FormLabel>{t('Encrypted private key')}</FormLabel>
                    <Button
                      variant="link"
                      colorScheme="blue"
                      _hover={{
                        textDecoration: 'none',
                      }}
                      onClick={clipboard.onCopy}
                    >
                      {t('Copy')}
                    </Button>
                  </Flex>
                  <Input type="password" value={encodedKey} isDisabled />
                </Stack>
              </FormControl>
            </>
          )}
        </Stack>
      </DrawerBody>

      <DrawerFooter>
        {step === 'passphrase' ? (
          <PrimaryButton type="submit" form="exportPrivateKey">
            {t('Export')}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={() => {
              props.onClose()
              setStep('passphrase')
            }}
          >
            {t('Close')}
          </PrimaryButton>
        )}
      </DrawerFooter>
    </Drawer>
  )
}
