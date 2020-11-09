import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Stack,
  Box,
  Collapse,
  useDisclosure,
  useToast,
  Icon,
} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
import {useRouter} from 'next/router'
import {Page, PageTitle} from '../../screens/app/components'
import {
  Checkbox,
  FloatDebug,
  Input,
  SuccessAlert,
  Textarea,
  Toast,
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
  TaggedInput,
  PercentInput,
} from '../../screens/oracles/components'
import {useAppMachine} from '../../shared/providers/app-context'
import {
  minOracleReward,
  votingMinBalance,
  votingMinStake,
  durationPreset,
  quorumVotesCount,
  viewVotingHref,
} from '../../screens/oracles/utils'
import {eitherState, toLocaleDna} from '../../shared/utils/utils'
import {
  ReviewVotingDrawer,
  VotingDurationInput,
} from '../../screens/oracles/containers'
import {VotingStatus} from '../../shared/types'

dayjs.extend(duration)
dayjs.extend(relativeTime)

function NewVotingPage() {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const toast = useToast()

  const {isOpen: isOpenAdvanced, onToggle: onToggleAdvanced} = useDisclosure()

  const [
    {
      context: {
        epoch: {epoch},
        identity: {address, balance},
      },
    },
  ] = useAppMachine()

  const newVotingMachine = React.useMemo(
    () => createNewVotingMachine(epoch, address),
    [address, epoch]
  )

  const [current, send, service] = useMachine(newVotingMachine, {
    actions: {
      onDone: () => {
        router.push(viewVotingHref(current.context.contractHash))
      },
      onError: (_, {data: {message}}) => {
        toast({
          // eslint-disable-next-line react/display-name
          render: () => <Toast title={message} status="error" />,
        })
      },
    },
  })

  const {
    votingDuration,
    publicVotingDuration,
    options,
    shouldStartImmediately,
    isFreeVoting,
    committeeSize,
    quorum = 20,
    winnerThreshold = 50,
    feePerGas,
    oracleReward,
    isWholeNetwork,
    oracleRewardsEstimates,
    ownerFee = 0,
  } = current.context

  const handleChange = ({target: {id, value}}) => send('CHANGE', {id, value})
  const dna = toLocaleDna(i18n)

  return (
    <Page p={0}>
      <Box px={20} py={6} w="full" overflowY="auto">
        <PageTitle mb={0}>{t('New voting')}</PageTitle>
        <SuccessAlert my={8}>
          {t(
            'After publishing or launching, you will not be able to edit the voting parameters.'
          )}
        </SuccessAlert>

        {current.matches('preload.late') && <NewVotingFormSkeleton />}

        {!current.matches('preload') && (
          <Stack spacing={3} w="xl">
            <VotingInlineFormControl htmlFor="title" label={t('Title')}>
              <Input id="title" onChange={handleChange} />
            </VotingInlineFormControl>

            <VotingInlineFormControl htmlFor="desc" label={t('Description')}>
              <Textarea id="desc" w="md" h={32} onChange={handleChange} />
            </VotingInlineFormControl>

            <VotingInlineFormControl label={t('Voting options')}>
              <Box
                borderWidth={1}
                borderColor="gray.300"
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
                    onChange={({target}) => {
                      send('SET_OPTIONS', {id, value: target.value})
                    }}
                    onAddOption={() => {
                      send('ADD_OPTION')
                    }}
                    onRemoveOption={() => {
                      send('REMOVE_OPTION', {id})
                    }}
                  />
                ))}
              </Box>
            </VotingInlineFormControl>

            <VotingInlineFormControl
              htmlFor="startDate"
              label={t('Start date')}
              isDisabled={shouldStartImmediately}
              mt={4}
            >
              <Stack spacing={3} flex={1}>
                <Input
                  id="startDate"
                  type="datetime-local"
                  onChange={handleChange}
                />
                <Checkbox
                  id="shouldStartImmediately"
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
              label={t('Committee size')}
              mt={2}
            >
              <Stack spacing={3} flex={1}>
                <Input
                  id="committeeSize"
                  type="number"
                  value={committeeSize}
                  isDisabled={isWholeNetwork}
                  onChange={handleChange}
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
              isDisabled={isFreeVoting}
              mt={2}
            >
              <Stack spacing={3} flex={1}>
                <DnaInput
                  id="votingMinPayment"
                  addon="iDNA"
                  isDisabled={isFreeVoting}
                  _disabled={{
                    bg: 'gray.50',
                  }}
                  onChange={handleChange}
                />
                <Checkbox
                  id="isFreeVoting"
                  onChange={({target: {id, checked}}) => {
                    send('CHANGE', {id, value: checked})
                  }}
                >
                  {t('Free voting')}
                </Checkbox>
              </Stack>
            </VotingInlineFormControl>

            <NewVotingFormSubtitle>{t('Rewards')}</NewVotingFormSubtitle>

            <TaggedInput
              id="oracleReward"
              type="number"
              value={Number(oracleReward)}
              min={minOracleReward(feePerGas)}
              label={t('Min reward per oracle')}
              presets={oracleRewardsEstimates}
              helperText={t('Total oracles rewards: {{amount}}', {
                amount: dna(
                  votingMinBalance({oracleReward, committeeSize, feePerGas})
                ),
                nsSeparator: '!',
              })}
              customText={t('iDNA')}
              onChangePreset={value => {
                send('CHANGE', {
                  id: 'oracleReward',
                  value,
                })
              }}
              onChangeCustom={({target}) => {
                send('CHANGE', {
                  id: 'oracleReward',
                  value: Number(target.value),
                })
              }}
            />

            <NewVotingFormSubtitle cursor="pointer" onClick={onToggleAdvanced}>
              {t('Advanced settings')}
              <Icon
                size={5}
                name="chevron-down"
                color="muted"
                ml={1}
                transform={isOpenAdvanced ? 'rotate(180deg)' : ''}
                transition="all 0.2s ease-in-out"
              />
            </NewVotingFormSubtitle>

            <Collapse isOpen={isOpenAdvanced} mt={2}>
              <Stack spacing={3}>
                <VotingDurationInput
                  id="publicVotingDuration"
                  value={publicVotingDuration}
                  label={t('Duration of summing up')}
                  presets={[
                    durationPreset({hours: 1}),
                    durationPreset({hours: 2}),
                    durationPreset({hours: 12}),
                    durationPreset({days: 1}),
                  ]}
                  service={service}
                />

                <VotingInlineFormControl
                  htmlFor="winnerThreshold"
                  label={t('Winner score')}
                >
                  <PercentInput
                    id="winnerThreshold"
                    value={winnerThreshold}
                    onChange={handleChange}
                  />
                </VotingInlineFormControl>

                <VotingInlineFormControl
                  htmlFor="ownerFee"
                  label={t('Owner fee')}
                >
                  <PercentInput
                    id="ownerFee"
                    value={ownerFee}
                    onChange={handleChange}
                  />
                </VotingInlineFormControl>
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
        minBalance={votingMinBalance({oracleReward, committeeSize, feePerGas})}
        minStake={votingMinStake(feePerGas)}
        isLoading={eitherState(
          current,
          'publishing.deploy',
          `publishing.${VotingStatus.Starting}`
        )}
        // eslint-disable-next-line no-shadow
        onConfirm={({from, balance, stake}) =>
          send('CONFIRM', {from, balance, stake})
        }
      />

      <FloatDebug>{current.value}</FloatDebug>
    </Page>
  )
}

export default NewVotingPage
