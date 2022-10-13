import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Stack,
  Box,
  Collapse,
  useDisclosure,
  useToast,
  Flex,
  CloseButton,
  FormErrorMessage,
} from '@chakra-ui/react'
import {useMachine} from '@xstate/react'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
import {useRouter} from 'next/router'
import {
  Checkbox,
  FloatDebug,
  Input,
  SuccessAlert,
  Textarea,
  Toast,
  Page,
  PageTitle,
} from '../../shared/components/components'
import {PrimaryButton} from '../../shared/components/button'
import {createNewVotingMachine} from '../../screens/oracles/machines'
import {
  DnaInput,
  NewVotingFormSkeleton,
  NewOracleFormHelperText,
  VotingInlineFormControl,
  VotingOptionInput,
  NewVotingFormSubtitle,
  PercentInput,
  PresetFormControl,
  PresetFormControlOptionList,
  PresetFormControlOption,
  PresetFormControlInputBox,
  NumberInput,
} from '../../screens/oracles/components'
import {
  votingMinStake,
  durationPreset,
  quorumVotesCount,
  viewVotingHref,
  humanError,
  hasLinklessOptions,
  hasValuableOptions,
} from '../../screens/oracles/utils'
import {eitherState, isAddress, toLocaleDna} from '../../shared/utils/utils'
import {
  NewOraclePresetDialog,
  ReviewVotingDrawer,
  VotingDurationInput,
} from '../../screens/oracles/containers'
import {VotingStatus} from '../../shared/types'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useIdentityState} from '../../shared/providers/identity-context'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {ChevronDownIcon, ChevronUpIcon} from '../../shared/components/icons'

dayjs.extend(duration)
dayjs.extend(relativeTime)

function NewVotingPage() {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const toast = useToast()

  const {isOpen: isOpenAdvanced, onToggle: onToggleAdvanced} = useDisclosure()

  const {syncing, offline} = useChainState()
  const epochState = useEpochState()
  const {address, balance} = useIdentityState()

  const epoch = epochState?.epoch ?? -1

  const newVotingMachine = React.useMemo(
    () => createNewVotingMachine(epoch, address),
    [address, epoch]
  )

  const [current, send, service] = useMachine(newVotingMachine, {
    actions: {
      onDone: () => {
        router.push(viewVotingHref(current.context.contractHash))
      },
      onError: (context, {data: {message}}) => {
        toast({
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast title={humanError(message, context)} status="error" />
          ),
        })
      },
      onInvalidForm: () => {
        toast({
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast title={t('Please correct form fields')} status="error" />
          ),
        })
      },
    },
  })

  const {
    options,
    startDate,
    votingDuration,
    publicVotingDuration,
    shouldStartImmediately,
    isFreeVoting,
    committeeSize,
    quorum = 1,
    winnerThreshold = '66',
    feePerGas,
    rewardsFund,
    isWholeNetwork,
    ownerFee = 0,
    ownerDeposit,
    votingMinPayment,
    ownerAddress,
    isCustomOwnerAddress,
    dirtyBag,
  } = current.context

  const isInvalid = (field, cond = current.context[field]) =>
    dirtyBag[field] && !cond

  const isInvalidOptions = isInvalid('options', hasValuableOptions(options))
  const hasLinksInOptions = isInvalid('options', hasLinklessOptions(options))

  const handleChange = ({target: {id, value}}) => send('CHANGE', {id, value})
  const dna = toLocaleDna(i18n)

  return (
    <Layout syncing={syncing} offline={offline}>
      <Page p={0}>
        <Box px={20} py={6} w="full" overflowY="auto">
          <Flex justify="space-between" align="center">
            <PageTitle mb={0}>{t('New voting')}</PageTitle>
            <CloseButton
              ml="auto"
              onClick={() => router.push('/oracles/list')}
            />
          </Flex>
          <SuccessAlert my={8}>
            {t(
              'After publishing or launching, you will not be able to edit the voting parameters.'
            )}
          </SuccessAlert>

          {current.matches('preload.late') && <NewVotingFormSkeleton />}

          {!current.matches('preload') && (
            <Stack spacing={3}>
              <VotingInlineFormControl
                htmlFor="title"
                label={t('Title')}
                isInvalid={isInvalid('title')}
              >
                <Input id="title" onChange={handleChange} />
                {isInvalid('title') && (
                  <FormErrorMessage fontSize="md" mt={1}>
                    {t('You must provide title')}
                  </FormErrorMessage>
                )}
              </VotingInlineFormControl>

              <VotingInlineFormControl
                htmlFor="desc"
                label={t('Description')}
                isInvalid={isInvalid('desc')}
              >
                <Textarea id="desc" w="md" h={32} onChange={handleChange} />
                {isInvalid('desc') && (
                  <FormErrorMessage fontSize="md" mt={1}>
                    {t('You must provide description')}
                  </FormErrorMessage>
                )}
              </VotingInlineFormControl>

              <VotingInlineFormControl
                label={t('Voting options')}
                isInvalid={isInvalidOptions || hasLinksInOptions}
              >
                <Box
                  borderWidth={
                    isInvalidOptions || hasLinksInOptions ? '2px' : 1
                  }
                  borderColor={
                    isInvalidOptions || hasLinksInOptions
                      ? 'red.500'
                      : 'gray.300'
                  }
                  borderRadius="md"
                  p={1}
                  w="md"
                >
                  {options.map(({id, value}, idx) => (
                    <VotingOptionInput
                      key={id}
                      value={value}
                      placeholder={`${t('Option')} ${idx + 1}...`}
                      isLast={idx === options.length - 1}
                      isDisabled={[0, 1].includes(idx)}
                      onChange={({target}) => {
                        send('SET_OPTIONS', {id, value: target.value})
                      }}
                      onAddOption={() => {
                        send('ADD_OPTION')
                      }}
                      onRemoveOption={() => {
                        send('REMOVE_OPTION', {id})
                      }}
                      _invalid={null}
                    />
                  ))}
                </Box>
                {isInvalidOptions && (
                  <FormErrorMessage fontSize="md" mt={1}>
                    {t('You must provide at least 2 options')}
                  </FormErrorMessage>
                )}
                {hasLinksInOptions && (
                  <FormErrorMessage fontSize="md" mt={1}>
                    {t(
                      'Links are not allowed in voting options. Please use Description for links.'
                    )}
                  </FormErrorMessage>
                )}
              </VotingInlineFormControl>

              <VotingInlineFormControl
                htmlFor="startDate"
                label={t('Start date')}
                isInvalid={isInvalid(
                  'startDate',
                  startDate || shouldStartImmediately
                )}
                mt={4}
              >
                <Stack spacing={3} flex={1}>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    isDisabled={shouldStartImmediately}
                    onChange={handleChange}
                  />
                  {isInvalid(
                    'startDate',
                    startDate || shouldStartImmediately
                  ) && (
                    <FormErrorMessage fontSize="md" mt={-2}>
                      {t('You must either choose start date or start now')}
                    </FormErrorMessage>
                  )}
                  <Checkbox
                    id="shouldStartImmediately"
                    isChecked={shouldStartImmediately}
                    onChange={({target: {id, checked}}) => {
                      send('CHANGE', {id, value: checked})
                    }}
                  >
                    {t('Start now')}
                  </Checkbox>
                </Stack>
              </VotingInlineFormControl>

              <VotingDurationInput
                id="votingDuration"
                label={t('Voting duration')}
                value={votingDuration}
                tooltip={t('Secret voting period')}
                presets={[
                  durationPreset({hours: 12}),
                  durationPreset({days: 1}),
                  durationPreset({days: 2}),
                  durationPreset({days: 5}),
                  durationPreset({weeks: 1}),
                ]}
                service={service}
                mt={2}
              />

              <NewVotingFormSubtitle>
                {t('Oracles requirements')}
              </NewVotingFormSubtitle>

              <VotingInlineFormControl
                htmlFor="committeeSize"
                label={t('Committee size, oracles')}
                isInvalid={committeeSize < 1}
                tooltip={t(
                  'The number of randomly selected oracles allowed to vote'
                )}
                mt={2}
              >
                <Stack spacing={3} flex={1}>
                  <NumberInput
                    id="committeeSize"
                    value={committeeSize}
                    min={1}
                    step={1}
                    preventInvalidInput
                    isDisabled={isWholeNetwork}
                    onChange={({target: {id, value}}) => {
                      send('CHANGE_COMMITTEE', {id, value: parseInt(value)})
                    }}
                  />
                  <Checkbox
                    id="isWholeNetwork"
                    onChange={({target: {checked}}) => {
                      send('SET_WHOLE_NETWORK', {checked})
                    }}
                  >
                    {t('Whole network')}
                  </Checkbox>
                </Stack>
              </VotingInlineFormControl>

              <VotingInlineFormControl
                htmlFor="quorum"
                label={t('Quorum')}
                tooltip={t(
                  'The share of Oracle committee sufficient to determine the voting outcome'
                )}
                mt={2}
              >
                <Stack spacing={0} flex={1}>
                  <PercentInput
                    id="quorum"
                    value={quorum}
                    onChange={handleChange}
                  />
                  <NewOracleFormHelperText textAlign="right">
                    {t('{{count}} votes are required', {
                      count: quorumVotesCount({quorum, committeeSize}),
                    })}
                  </NewOracleFormHelperText>
                </Stack>
              </VotingInlineFormControl>

              <VotingInlineFormControl
                htmlFor="votingMinPayment"
                label={t('Voting deposit')}
                tooltip={t(
                  'Refunded when voting in majority and lost when voting in minority'
                )}
                isDisabled={isFreeVoting}
                mt={2}
              >
                <Stack spacing={3} flex={1}>
                  <DnaInput
                    id="votingMinPayment"
                    value={votingMinPayment}
                    isDisabled={isFreeVoting}
                    onChange={handleChange}
                  />
                  <Checkbox
                    id="isFreeVoting"
                    isChecked={isFreeVoting}
                    onChange={({target: {id, checked}}) => {
                      send('CHANGE', {id, value: checked})
                    }}
                  >
                    {t('No voting deposit for oracles')}
                  </Checkbox>
                </Stack>
              </VotingInlineFormControl>

              <NewVotingFormSubtitle>
                {t('Cost of voting')}
              </NewVotingFormSubtitle>

              <VotingInlineFormControl
                htmlFor="ownerDeposit"
                label={t('Owner deposit')}
                tooltip={t(
                  'Owner deposit is required to start the voting. It will be refunded to the owner address.'
                )}
              >
                <DnaInput id="ownerDeposit" value={ownerDeposit} isDisabled />
              </VotingInlineFormControl>

              <VotingInlineFormControl
                htmlFor="rewardsFund"
                label={t('Rewards fund')}
                tooltip={t('Oracle rewards fund')}
              >
                <DnaInput
                  id="rewardsFund"
                  value={rewardsFund}
                  onChange={({target: {id, value}}) =>
                    send('CHANGE', {id, value: parseFloat(value)})
                  }
                />
                <NewOracleFormHelperText textAlign="right">
                  {t('Min reward per oracle: {{amount}}', {
                    amount: dna(rewardsFund / Math.max(1, committeeSize)),
                    nsSeparator: '!',
                  })}
                </NewOracleFormHelperText>
              </VotingInlineFormControl>

              <NewVotingFormSubtitle
                cursor="pointer"
                onClick={onToggleAdvanced}
              >
                {t('Advanced settings')}
                {isOpenAdvanced ? (
                  <ChevronUpIcon boxSize="5" color="muted" ml="1" />
                ) : (
                  <ChevronDownIcon boxSize="5" color="muted" ml="1" />
                )}
              </NewVotingFormSubtitle>

              <Collapse in={isOpenAdvanced} mt={2}>
                <Stack spacing={3}>
                  <VotingInlineFormControl
                    pt={1 / 2}
                    htmlFor="ownerAddress"
                    label={t('Owner address')}
                    tooltip={t(
                      'Owner deposit will be sent to the specified Owner address'
                    )}
                    isInvalid={isInvalid(
                      'ownerAddress',
                      !isCustomOwnerAddress || isAddress(ownerAddress)
                    )}
                  >
                    <Stack spacing={3} flex={1}>
                      <Input
                        isDisabled={!isCustomOwnerAddress}
                        id="ownerAddress"
                        value={ownerAddress}
                        onChange={handleChange}
                      />
                      {isInvalid(
                        'ownerAddress',
                        !isCustomOwnerAddress || isAddress(ownerAddress)
                      ) && (
                        <FormErrorMessage fontSize="md">
                          {t('You must provide a valid address')}
                        </FormErrorMessage>
                      )}
                      <Checkbox
                        id="isCustomOwnerAddress"
                        onChange={({target: {id, checked}}) => {
                          send('CHANGE', {id, value: checked})
                        }}
                        isInvalid={false}
                      >
                        {t('Custom owner address')}
                      </Checkbox>
                    </Stack>
                  </VotingInlineFormControl>

                  <VotingInlineFormControl
                    htmlFor="ownerFee"
                    label={t('Owner fee')}
                    tooltip={t(
                      '% of the oracle rewards above the specified Rewards fund that will be sent to the Owner address'
                    )}
                  >
                    <PercentInput
                      id="ownerFee"
                      value={ownerFee}
                      onChange={handleChange}
                    />
                  </VotingInlineFormControl>

                  <VotingDurationInput
                    id="publicVotingDuration"
                    value={publicVotingDuration}
                    label={t('Counting duration')}
                    tooltip={t(
                      'Period when secret votes are getting published and results are counted'
                    )}
                    presets={[
                      durationPreset({hours: 12}),
                      durationPreset({days: 1}),
                      durationPreset({days: 2}),
                      durationPreset({days: 5}),
                      durationPreset({weeks: 1}),
                    ]}
                    service={service}
                  />

                  <PresetFormControl
                    label={t('Majority threshold')}
                    tooltip={t(
                      'The minimum share of the votes which an option requires to achieve before it becomes the voting outcome'
                    )}
                  >
                    <PresetFormControlOptionList
                      value={winnerThreshold}
                      onChange={value => {
                        send('CHANGE', {
                          id: 'winnerThreshold',
                          value,
                        })
                      }}
                    >
                      <PresetFormControlOption value="51">
                        {t('Simple majority')}
                      </PresetFormControlOption>
                      <PresetFormControlOption value="66">
                        {t('Super majority')}
                      </PresetFormControlOption>
                      <PresetFormControlOption value="100">
                        {t('N/A (polls)')}
                      </PresetFormControlOption>
                    </PresetFormControlOptionList>

                    <PresetFormControlInputBox>
                      <PercentInput
                        id="winnerThreshold"
                        value={winnerThreshold}
                        onChange={handleChange}
                      />
                    </PresetFormControlInputBox>
                  </PresetFormControl>
                </Stack>
              </Collapse>
            </Stack>
          )}
        </Box>

        <Stack
          isInline
          mt="auto"
          alignSelf="stretch"
          justify="flex-end"
          borderTop="1px"
          borderTopColor="gray.300"
          py={3}
          px={4}
        >
          <PrimaryButton
            isLoading={current.matches('publishing')}
            loadingText={t('Publishing')}
            onClick={() => send('PUBLISH')}
          >
            {t('Publish')}
          </PrimaryButton>
        </Stack>

        <ReviewVotingDrawer
          isOpen={current.matches('publishing')}
          onClose={() => send('CANCEL')}
          from={address}
          available={balance}
          ownerDeposit={ownerDeposit}
          rewardsFund={rewardsFund}
          minStake={votingMinStake(feePerGas)}
          votingDuration={votingDuration}
          publicVotingDuration={publicVotingDuration}
          ownerFee={ownerFee}
          shouldStartImmediately={shouldStartImmediately}
          ownerAddress={ownerAddress}
          isCustomOwnerAddress={isCustomOwnerAddress}
          isLoading={eitherState(
            current,
            'publishing.deploy',
            `publishing.${VotingStatus.Starting}`
          )}
          // eslint-disable-next-line no-shadow
          onConfirm={({from, balance, stake}) =>
            send('CONFIRM', {
              from,
              balance,
              stake,
            })
          }
          onError={e => send('ERROR', e)}
        />

        <NewOraclePresetDialog
          isOpen={eitherState(current, 'choosingPreset')}
          onChoosePreset={preset => send('CHOOSE_PRESET', {preset})}
          onCancel={() => send('CANCEL')}
        />

        {global.isDev && <FloatDebug>{current.value}</FloatDebug>}
      </Page>
    </Layout>
  )
}

export default NewVotingPage
