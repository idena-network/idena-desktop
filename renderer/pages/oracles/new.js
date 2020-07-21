import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Flex,
  Stack,
  Box,
  FormControl,
  Alert,
  AlertIcon,
  Textarea,
  Collapse,
  useDisclosure,
  Text,
} from '@chakra-ui/core'
import {Page, PageTitle} from '../../screens/app/components'
import {FormLabel, Input} from '../../shared/components/components'
import Layout from '../../shared/components/layout'
import {rem} from '../../shared/theme'
import {
  PrimaryButton,
  IconButton2,
  SecondaryButton,
} from '../../shared/components/button'

export default function NewVoting() {
  const {t} = useTranslation()

  const {isOpen: isOpenAdvanced, onToggle: onToggleAdvanced} = useDisclosure()

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
                <VotingInlineFormControl label={t('Title')}>
                  <Input />
                </VotingInlineFormControl>
                <VotingInlineFormControl label={t('Description')}>
                  <Textarea
                    borderColor="gray.300"
                    px={3}
                    pt="3/2"
                    pb={2}
                    _placeholder={{
                      color: 'muted',
                    }}
                  />
                </VotingInlineFormControl>
                <VotingInlineFormControl label={t('Deadline')}>
                  <Input type="date" />
                </VotingInlineFormControl>
                <IconButton2
                  icon="chevron-down"
                  onClick={onToggleAdvanced}
                  mx={1}
                >
                  <Flex flex={1} justify="space-between">
                    <Text>{t('Part of the options is hidden')}</Text>
                    <Text>{t('Show all')}</Text>
                  </Flex>
                </IconButton2>
                <Collapse isOpen={isOpenAdvanced}>
                  <Stack spacing={3}>
                    <VotingInlineFormControl label={t('Start of voting')}>
                      <Input type="date" />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl label={t('Start of voting')}>
                      <Input />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl
                      label={t('Duration of summing up')}
                    >
                      <Input />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl label={t('Winner score')}>
                      <Input />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl label={t('Max committee size')}>
                      <Input />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl label={t('Min committee size')}>
                      <Input />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl label={t('Voting deposit')}>
                      <Input />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl label={t('Voting reward')}>
                      <Input />
                    </VotingInlineFormControl>
                    <VotingInlineFormControl label={t('Options')}>
                      <Input />
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
                    <OptionText label={t('Option 1')} />
                    <OptionText label={t('Option 2')} />
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
          <SecondaryButton onClick={() => console.log('PUBLISH')}>
            {t('Publish')}
          </SecondaryButton>
          <PrimaryButton onClick={() => console.log('LAUNCH')}>
            {t('Launch')}
          </PrimaryButton>
        </Stack>
      </Page>
    </Layout>
  )
}

// eslint-disable-next-line react/prop-types
function VotingInlineFormControl({label, children, ...props}) {
  return (
    <FormControl {...props}>
      <Stack isInline spacing={5}>
        <FormLabel w={rem(100)}>{label}</FormLabel>
        {children}
      </Stack>
    </FormControl>
  )
}

// eslint-disable-next-line react/prop-types
function OptionText({label, ...props}) {
  return (
    <FormControl>
      <Stack isInline spacing={rem(60)} justify="space-between">
        <FormLabel color="muted">{label}</FormLabel>
        <Input w={rem(280)} {...props} />
      </Stack>
    </FormControl>
  )
}
