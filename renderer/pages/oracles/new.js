import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Flex,
  Stack,
  Box,
  Collapse,
  useDisclosure,
  Text,
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
import {rem} from '../../shared/theme'
import {PrimaryButton} from '../../shared/components/button'
import {createNewVotingMachine} from '../../screens/oracles/machines'
import {
  VotingFormAdvancedToggle,
  VotingInlineFormControl,
  VotingOptionText,
} from '../../screens/oracles/components'
import {useAppMachine} from '../../shared/providers/app-context'
import {BLOCK_TIME} from '../../screens/oracles/utils'
import {toLocaleDna} from '../../shared/utils/utils'

dayjs.extend(duration)
dayjs.extend(relativeTime)

function NewVotingPage() {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const toast = useToast()

  const {isOpen: isOpenAdvanced, onToggle: onToggleAdvanced} = useDisclosure()

  const [
    {
      context: {epoch, identity},
    },
  ] = useAppMachine()

  const newVotingMachine = React.useMemo(
    () => createNewVotingMachine(epoch.epoch),
    [epoch.epoch]
  )

  const [current, send] = useMachine(newVotingMachine, {
    context: {identity, epoch},
    actions: {
      onDeployed: () => router.push('/oracles/list'),
      onDeployFailed: (_, {data: {message}}) => {
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
  } = current.context

  const handleChange = ({target: {id, value}}) => send('CHANGE', {id, value})
  const dna = toLocaleDna(i18n)

  return (
    <Page p={0}>
      <Box px={20} py={6} w="full" overflowY="auto">
        <PageTitle>{t('New voting')}</PageTitle>
        <SuccessAlert>
          {t(
            'After publishing or launching, you will not be able to edit the voting parameters.'
          )}
        </SuccessAlert>
        <Stack maxW="xl" spacing={5} my={8}>
          <Stack as="form" spacing={3}>
            <VotingInlineFormControl
              id="title"
              label={t('Title')}
              onChange={handleChange}
            />
            <VotingInlineFormControl label={t('Description')}>
              <Textarea id="desc" w="md" h={32} onChange={handleChange} />
            </VotingInlineFormControl>
            <VotingInlineFormControl
              id="votingMinPayment"
              type="number"
              label={t('Voting deposit')}
              unit="DNA"
              isDisabled={isFreeVoting}
              onChange={handleChange}
            />
            <VotingInlineFormControl mt={-2}>
              <Checkbox
                id="isFreeVoting"
                borderColor="gray.100"
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
              label={t('Min reward per oracle')}
              unit="DNA"
              helperText={t('Total oracles rewards: {{amount}}', {
                amount: dna(oracleReward * committeeSize),
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
                onChange={({target: {id, checked}}) => {
                  send('CHANGE', {id, value: checked})
                }}
              >
                {t('Start now')}
              </Checkbox>
            </VotingInlineFormControl>

            <VotingFormAdvancedToggle onClick={onToggleAdvanced} />

            <Collapse mt={2} isOpen={isOpenAdvanced}>
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
          <Flex ml={32} mb={rem(84)}>
            <Box flex={1} bg="gray.50" borderRadius="lg" px={10} py={5} w="md">
              <Text py={rem(10)} mb={2}>
                {t('Name of options')}
              </Text>
              <Stack spacing={3}>
                {options.map((option, idx) => (
                  <VotingOptionText
                    key={idx}
                    label={t('Option {{num}}', {num: idx + 1})}
                    onChange={({target: {value}}) => {
                      send('SET_OPTIONS', {idx, value})
                    }}
                  >
                    {option}
                  </VotingOptionText>
                ))}
              </Stack>
            </Box>
          </Flex>
        </Stack>
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
        <PrimaryButton onClick={() => send('PUBLISH')}>
          {t('Publish')}
        </PrimaryButton>
      </Stack>
      <FloatDebug>{current.value}</FloatDebug>
    </Page>
  )
}

export default NewVotingPage
