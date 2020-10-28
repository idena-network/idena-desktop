import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Stack,
  Box,
  Collapse,
  useDisclosure,
  useToast,
  Checkbox,
} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import {useRouter} from 'next/router'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
import {Page, PageTitle} from '../../screens/app/components'
import {
  FloatDebug,
  SuccessAlert,
  Textarea,
  Toast,
} from '../../shared/components/components'
import {PrimaryButton} from '../../shared/components/button'
import {createNewVotingMachine} from '../../screens/oracles/machines'
import {
  NewVotingFormSkeleton,
  VotingFormAdvancedToggle,
  VotingInlineFormControl,
  VotingOptionInput,
} from '../../screens/oracles/components'
import {useAppMachine} from '../../shared/providers/app-context'
import {
  BLOCK_TIME,
  minOracleReward,
  votingMinBalance,
  votingMinStake,
} from '../../screens/oracles/utils'
import {eitherState, toLocaleDna} from '../../shared/utils/utils'
import {ReviewVotingDrawer} from '../../screens/oracles/containers'
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

  const [current, send] = useMachine(newVotingMachine, {
    actions: {
      onDone: ({shouldStartImmediately: didStart}) => {
        toast({
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast
              title={t(`Deployed ${didStart && 'and started'} sir`)}
              status="error"
            />
          ),
        })
        if (Math.random() > 1) router.push('/oracles/list')
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
    oracleReward,
    feePerGas,
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
            <VotingInlineFormControl
              id="title"
              label={t('Title')}
              onChange={handleChange}
            />

            <VotingInlineFormControl label={t('Description')}>
              <Textarea id="desc" w="md" h={32} onChange={handleChange} />
            </VotingInlineFormControl>

            <VotingInlineFormControl label={t('Options')}>
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
              id="votingMinPayment"
              type="number"
              label={t('Voting deposit')}
              unit="iDNA"
              isDisabled={isFreeVoting}
              onChange={handleChange}
            />

            <VotingInlineFormControl>
              <Checkbox
                id="isFreeVoting"
                borderColor="gray.100"
                mt={-2}
                onChange={({target: {id, checked}}) => {
                  send('CHANGE', {id, value: checked})
                }}
              >
                {t('Free voting')}
              </Checkbox>
            </VotingInlineFormControl>

            <VotingInlineFormControl
              id="oracleReward"
              type="number"
              defaultValue={20 || minOracleReward(feePerGas)}
              min={20 || minOracleReward(feePerGas)}
              label={t('Min reward per oracle')}
              unit="iDNA"
              helperText={t('Total oracles rewards: {{amount}}', {
                amount: dna(
                  votingMinBalance({oracleReward, committeeSize, feePerGas})
                ),
                nsSeparator: '!',
              })}
              onChange={handleChange}
            />

            <VotingInlineFormControl
              id="startDate"
              type="date"
              label={t('Start date')}
              isDisabled={shouldStartImmediately}
              onChange={handleChange}
            />

            <VotingInlineFormControl>
              <Checkbox
                id="shouldStartImmediately"
                borderColor="gray.100"
                mt={-2}
                onChange={({target: {id, checked}}) => {
                  send('CHANGE', {id, value: checked})
                }}
              >
                {t('Start now')}
              </Checkbox>
            </VotingInlineFormControl>

            <VotingFormAdvancedToggle
              onClick={onToggleAdvanced}
              isOpen={isOpenAdvanced}
            />

            <Collapse isOpen={isOpenAdvanced}>
              <Stack spacing={3}>
                <VotingInlineFormControl
                  id="votingDuration"
                  type="number"
                  label={t('Duration of vote, blocks')}
                  defaultValue={votingDuration}
                  helperText={dayjs
                    .duration(votingDuration * BLOCK_TIME, 's')
                    .humanize()}
                  onChange={handleChange}
                />
                <VotingInlineFormControl
                  id="publicVotingDuration"
                  type="number"
                  label={t('Duration of summing up, blocks')}
                  defaultValue={publicVotingDuration}
                  helperText={dayjs
                    .duration(publicVotingDuration * BLOCK_TIME, 's')
                    .humanize()}
                  onChange={handleChange}
                />
                <VotingInlineFormControl
                  id="winnerThreshold"
                  type="number"
                  label={t('Winner score')}
                  defaultValue={50}
                  unit="%"
                  onChange={handleChange}
                />
                <VotingInlineFormControl
                  id="quorum"
                  type="number"
                  label={t('Min committee size')}
                  defaultValue={20}
                  unit="%"
                  onChange={handleChange}
                />
                <VotingInlineFormControl
                  id="committeeSize"
                  label={t('Max committee size')}
                  type="number"
                  defaultValue={100}
                  onChange={handleChange}
                />
                <VotingInlineFormControl
                  id="maxOptions"
                  label={t('Options')}
                  type="number"
                  defaultValue={options.length}
                  onChange={({target: {value}}) =>
                    send('SET_OPTIONS_NUMBER', {value})
                  }
                />
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
