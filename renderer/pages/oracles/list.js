import React from 'react'
import {
  Stack,
  RadioGroup,
  Radio,
  Box,
  Text,
  Switch,
  Flex,
  FormLabel,
  Badge,
  Icon,
  Divider,
  Skeleton,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useRouter} from 'next/router'
import {useMachine} from '@xstate/react'
import Layout from '../../shared/components/layout'
import {Page, PageTitle} from '../../screens/app/components'
import {IconLink} from '../../shared/components/link'
import {VotingStatus} from '../../shared/types'
import {Avatar, FloatDebug} from '../../shared/components/components'
import {rem} from '../../shared/theme'
import {toLocaleDna} from '../../shared/utils/utils'
import {SecondaryButton, PrimaryButton} from '../../shared/components/button'
import {votingListMachine} from '../../screens/oracles/machines'
import {VotingStatusBadge} from '../../screens/oracles/components'

export default function VotingListPage() {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const [current] = useMachine(votingListMachine)

  const toDna = toLocaleDna(i18n.language)

  return (
    <Layout>
      <Page>
        <PageTitle mb={10}>{t('Oracle votings')}</PageTitle>
        <Stack isInline spacing={20} w="full">
          <Stack spacing={6} w="md">
            {current.matches('loading')
              ? [...Array(3)].map(() => <Skeleton />)
              : current.context.votings.map(
                  ({
                    title,
                    desc,
                    issuer,
                    status,
                    deadline,
                    totalPrize,
                    votesCount,
                  }) => (
                    <Box>
                      <Stack isInline spacing={2} mb={3}>
                        <VotingStatusBadge status={status}>
                          {t(status)}
                        </VotingStatusBadge>
                        <Badge
                          bg="gray.300"
                          borderRadius="xl"
                          fontSize="sm"
                          textTransform="initial"
                          color="muted"
                          px={3}
                          py={1}
                        >
                          <Stack isInline spacing={1} align="center">
                            <Avatar w={5} h={5} address={issuer} />
                            <Text>{issuer}</Text>
                          </Stack>
                        </Badge>
                      </Stack>
                      <Text fontSize={rem(16)} fontWeight={500} mb={2}>
                        {title}
                      </Text>
                      <Text color="muted" mb={4}>
                        {desc}
                      </Text>
                      <Stack isInline spacing={2} align="center" mb={6}>
                        <Icon name="star" size={4} color="white" />
                        <Text fontWeight={500}>
                          Total prize: {toDna(totalPrize)}
                        </Text>
                      </Stack>
                      <Flex justify="space-between" align="center">
                        <Stack isInline spacing={2}>
                          <PrimaryButton
                            onClick={() => router.push('/oracles/vote')}
                          >
                            {t('Change')}
                          </PrimaryButton>
                          <SecondaryButton>{t('Add fund')}</SecondaryButton>
                        </Stack>
                        <Stack isInline spacing={3}>
                          <Text>
                            <Text as="span" color="muted">
                              {t('Deadline')}:
                            </Text>{' '}
                            <Text as="span">
                              {new Date(deadline).toLocaleDateString()}
                            </Text>
                          </Text>
                          <Divider
                            orientation="vertical"
                            borderColor="gray.300"
                            borderLeft="1px"
                          />
                          <Stack isInline spacing={2} align="center">
                            <Icon name="user" w={4} h={4} />
                            <Text as="span">{votesCount} votes</Text>
                          </Stack>
                        </Stack>
                      </Flex>
                      <Divider borderColor="gray.300" mt={rem(28)} />
                    </Box>
                  )
                )}
          </Stack>
          <Stack spacing={8} align="flex-start" maxW={40}>
            <IconLink
              href="/oracles/new"
              icon="plus-solid"
              px={0}
              _focus={null}
              _hover={null}
            >
              {t('New voting')}
            </IconLink>
            <RadioGroup
              defaultValue={VotingStatus.All}
              variantColor="brandBlue"
              title="Status"
            >
              <Radio borderColor="gray.100" value={VotingStatus.All}>
                All
              </Radio>
              <Radio borderColor="gray.100" value={VotingStatus.Open}>
                Open
              </Radio>
              <Radio borderColor="gray.100" value={VotingStatus.Voted}>
                Voted
              </Radio>
              <Radio borderColor="gray.100" value={VotingStatus.Counting}>
                Counting
              </Radio>
              <Radio borderColor="gray.100" value={VotingStatus.Archive}>
                Archive
              </Radio>
            </RadioGroup>
            <Box>
              <Text color="muted" mb={3}>
                {t('There are hidden votings not available for me')}
              </Text>
              <Stack isInline spacing={3} align="center">
                <Switch id="show-all"></Switch>
                <FormLabel htmlFor="show-all">{t('Show all')}</FormLabel>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Page>
      <FloatDebug>{current.value}</FloatDebug>
    </Layout>
  )
}
