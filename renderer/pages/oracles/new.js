import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Flex,
  Stack,
  Box,
  Alert,
  AlertIcon,
  Textarea,
  Collapse,
  useDisclosure,
  Text,
} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import {useRouter} from 'next/router'
import {Page, PageTitle} from '../../screens/app/components'
import {FloatDebug} from '../../shared/components/components'
import {rem} from '../../shared/theme'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {createNewVotingMachine} from '../../screens/oracles/machines'
import {
  VotingFormAdvancedDivider,
  VotingInlineFormControl,
  VotingOptionText,
} from '../../screens/oracles/components'
import {useAppMachine} from '../../shared/providers/app-context'

function NewVotingPage() {
  const {t} = useTranslation()

  const router = useRouter()

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
    },
  })

  const handleChangeFormControl = ({target: {id, value}}) =>
    send('CHANGE', {id, value})

  return (
    <Page p={0}>
      <Flex
        direction="column"
        flex={1}
        alignSelf="stretch"
        px={20}
        pb={rem(9)}
        overflowY="auto"
      >
        <PageTitle mt={6}>{t('New voting')}</PageTitle>
        <Box>
          <Box alignSelf="stretch" mb={8}>
            <Alert
              status="success"
              bg="green.010"
              borderWidth="1px"
              borderColor="green.050"
              fontWeight={500}
              rounded="md"
              px={3}
              py={2}
            >
              <AlertIcon name="info" color="green.500" size={5} mr={3} />
              {t(
                'After publishing or launching, you will not be able to edit the voting parameters.'
              )}
            </Alert>
          </Box>
          <Stack maxW="xl" spacing={5}>
            <Stack as="form" spacing={3}>
              <VotingInlineFormControl
                id="title"
                label={t('Title')}
                onChange={handleChangeFormControl}
              />
              <VotingInlineFormControl
                label={t('Description')}
                align="flex-start"
              >
                <Textarea
                  id="desc"
                  borderColor="gray.300"
                  px={3}
                  pt="3/2"
                  pb={2}
                  w="md"
                  _placeholder={{
                    color: 'muted',
                  }}
                  onChange={handleChangeFormControl}
                />
              </VotingInlineFormControl>
              <VotingInlineFormControl
                id="startDate"
                type="date"
                label={t('Start of voting')}
                onChange={handleChangeFormControl}
              />
              <VotingFormAdvancedDivider onClick={onToggleAdvanced} />
              <Collapse mt={2} isOpen={isOpenAdvanced}>
                <Stack spacing={3}>
                  <VotingInlineFormControl
                    id="finishDate"
                    type="date"
                    label={t('Deadline')}
                    onChange={handleChangeFormControl}
                  />
                  <VotingInlineFormControl
                    id="duration"
                    label={t('Duration of summing up')}
                    onChange={handleChangeFormControl}
                  />
                  <VotingInlineFormControl
                    id="threshold"
                    label={t('Winner score')}
                    onChange={handleChangeFormControl}
                  />
                  <VotingInlineFormControl
                    id="minCommitteeSize"
                    label={t('Max committee size')}
                    onChange={handleChangeFormControl}
                  />
                  <VotingInlineFormControl
                    id="maxCommitteeSize"
                    label={t('Min committee size')}
                    onChange={handleChangeFormControl}
                  />
                  <VotingInlineFormControl
                    id="deposit"
                    label={t('Voting deposit')}
                    onChange={handleChangeFormControl}
                  />
                  <VotingInlineFormControl
                    id="reward"
                    label={t('Voting reward')}
                    onChange={handleChangeFormControl}
                  />
                </Stack>
              </Collapse>
            </Stack>
            <Flex ml={32} mb={rem(84)}>
              <Box
                flex={1}
                bg="gray.50"
                borderRadius="lg"
                px={10}
                py={5}
                w="md"
              >
                <Text py={rem(10)} mb={2}>
                  {t('Number of options')}
                </Text>
                <Stack spacing={3}>
                  <VotingOptionText
                    onChange={({target: {value}}) => {
                      send('SET_OPTIONS', {idx: 0, value})
                    }}
                    label={t('Option 1')}
                  />
                  <VotingOptionText
                    onChange={({target: {value}}) =>
                      send('SET_OPTIONS', {idx: 1, value})
                    }
                    label={t('Option 2')}
                  />
                </Stack>
              </Box>
            </Flex>
          </Stack>
        </Box>
      </Flex>
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
        <SecondaryButton onClick={() => send('PUBLISH')}>
          {t('Publish')}
        </SecondaryButton>
        <PrimaryButton onClick={() => send('LAUNCH')}>
          {t('Launch')}
        </PrimaryButton>
      </Stack>
      <FloatDebug>{current.value}</FloatDebug>
    </Page>
  )
}

export default NewVotingPage
