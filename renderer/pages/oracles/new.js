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
import {Page, PageTitle} from '../../screens/app/components'
import {Input, FloatDebug} from '../../shared/components/components'
import Layout from '../../shared/components/layout'
import {rem} from '../../shared/theme'
import {
  PrimaryButton,
  IconButton2,
  SecondaryButton,
} from '../../shared/components/button'
import {createVotingMachine} from '../../screens/oracles/machines'
import {
  VotingInlineFormControl,
  VotingOptionText,
} from '../../screens/oracles/components'

export default function NewVoting() {
  const {t} = useTranslation()

  const {isOpen: isOpenAdvanced, onToggle: onToggleAdvanced} = useDisclosure()

  const newVotingMachine = React.useMemo(() => createVotingMachine(), [])
  const [current, send] = useMachine(newVotingMachine)

  return (
    <Layout>
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
            <Stack maxW={rem(600)} spacing={5}>
              <Stack as="form" spacing={3}>
                <VotingInlineFormControl
                  label={t('Title')}
                  onChange={({target: {name, value}}) =>
                    send('CHANGE', {name, value})
                  }
                >
                  <Input name="title" />
                </VotingInlineFormControl>
                <VotingInlineFormControl
                  label={t('Description')}
                  onChange={({target: {name, value}}) =>
                    send('CHANGE', {name, value})
                  }
                >
                  <Textarea
                    name="desc"
                    borderColor="gray.300"
                    px={3}
                    pt="3/2"
                    pb={2}
                    _placeholder={{
                      color: 'muted',
                    }}
                  />
                </VotingInlineFormControl>
                <VotingInlineFormControl
                  label={t('Deadline')}
                  onChange={({target: {name, value}}) =>
                    send('CHANGE', {name, value})
                  }
                >
                  <Input type="date" name="votingStartDate" />
                </VotingInlineFormControl>
                <IconButton2
                  icon="chevron-down"
                  onClick={onToggleAdvanced}
                  my={2}
                >
                  <Flex flex={1} justify="space-between">
                    <Text>{t('Part of the options is hidden')}</Text>
                    <Text>{t('Show all')}</Text>
                  </Flex>
                </IconButton2>
                <Collapse mt={2} isOpen={isOpenAdvanced}>
                  <Stack spacing={3}>
                    <VotingInlineFormControl
                      label={t('Start of voting')}
                      onChange={({target: {name, value}}) =>
                        send('CHANGE', {name, value})
                      }
                    >
                      <Input type="date" name="startDate" />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl
                      label={t('Finish of voting')}
                      onChange={({target: {name, value}}) =>
                        send('CHANGE', {name, value})
                      }
                    >
                      <Input type="date" name="finishDate" />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl
                      label={t('Duration of summing up')}
                      onChange={({target: {name, value}}) =>
                        send('CHANGE', {name, value})
                      }
                    >
                      <Input name="duration" />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl
                      label={t('Winner score')}
                      onChange={({target: {name, value}}) =>
                        send('CHANGE', {name, value})
                      }
                    >
                      <Input name="threshold" />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl
                      label={t('Max committee size')}
                      onChange={({target: {name, value}}) =>
                        send('CHANGE', {name, value})
                      }
                    >
                      <Input name="minCommitteeSize" />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl
                      label={t('Min committee size')}
                      onChange={({target: {name, value}}) =>
                        send('CHANGE', {name, value})
                      }
                    >
                      <Input name="maxCommitteeSize" />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl
                      label={t('Voting deposit')}
                      onChange={({target: {name, value}}) =>
                        send('CHANGE', {name, value})
                      }
                    >
                      <Input name="deposit" />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl
                      label={t('Voting reward')}
                      onChange={({target: {name, value}}) =>
                        send('CHANGE', {name, value})
                      }
                    >
                      <Input name="reward" />
                    </VotingInlineFormControl>
                  </Stack>
                </Collapse>
              </Stack>
              <Flex ml={rem(100)} mb={rem(84)}>
                <Box flex={1} bg="gray.50" borderRadius="lg" px={10} py={5}>
                  <Text py={rem(10)} mb={2}>
                    {t('Number of options')}
                  </Text>
                  <Stack spacing={3}>
                    <VotingOptionText label={t('Option 1')} />
                    <VotingOptionText label={t('Option 2')} />
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
      </Page>
      <FloatDebug>{current.value}</FloatDebug>
    </Layout>
  )
}
