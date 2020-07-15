import React from 'react'
import {
  Skeleton,
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
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import Layout from '../../shared/components/layout'
import {Page, PageTitle} from '../../screens/app/components'
import {IconLink} from '../../shared/components/link'
import {VotingType} from '../../shared/types'
import {Avatar} from '../../shared/components/components'
import {rem} from '../../shared/theme'
import {toLocaleDna} from '../../shared/utils/utils'
import {SecondaryButton, PrimaryButton} from '../../shared/components/button'

export default function OracleList() {
  const {t, i18n} = useTranslation()

  const toDna = toLocaleDna(i18n.language)

  return (
    <Layout>
      <Page>
        <PageTitle mb={10}>{t('Oracle votings')}</PageTitle>
        <Stack isInline spacing={20} w="full">
          <Stack spacing={6} w="md">
            {[...Array(5)].map(x => (
              <Box>
                <Stack isInline spacing={2} mb={3}>
                  <Badge
                    bg="green.020"
                    borderRadius="xl"
                    fontSize="sm"
                    textTransform="initial"
                    color="green.500"
                    px={3}
                    py={1}
                  >
                    {t('Open')}
                  </Badge>
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
                      <Avatar
                        w={5}
                        h={5}
                        address="0x5A3abB61A9c5475B8243B61A9c5475B8243"
                      />
                      <Text>0x5A3abB61A9c5475B8243B61A9c5475B8243</Text>
                    </Stack>
                  </Badge>
                </Stack>
                <Text fontSize={rem(16)} fontWeight={500} mb={2}>
                  Did Trump win the 2020 election? {x}
                </Text>
                <Text color="muted" mb={4}>
                  President Trump on Monday threatened to yank the Republican
                  National Convention from Charlotte, N.C., where it is
                  scheduled to be held in August, accusing the state’s
                  Democratic governor of being...
                </Text>
                <Stack isInline spacing={2} align="center" mb={6}>
                  <Icon name="star" size={4} color="white" />
                  <Text fontWeight={500}>Total prize: {toDna(100000)}</Text>
                </Stack>
                <Flex justify="space-between" align="center">
                  <Stack isInline spacing={2}>
                    <PrimaryButton>{t('Change')}</PrimaryButton>
                    <SecondaryButton>{t('Add fund')}</SecondaryButton>
                  </Stack>
                  <Stack isInline spacing={3}>
                    <Text>
                      <Text as="span" color="muted">
                        {t('Deadline')}:
                      </Text>{' '}
                      <Text as="span">{dayjs().format('D.MM.YYYY')}</Text>
                    </Text>
                    <Divider
                      orientation="vertical"
                      borderColor="gray.300"
                      borderLeft="1px"
                    />
                    <Stack isInline spacing={2} align="center">
                      <Icon name="user" w={4} h={4} />
                      <Text as="span">326 votes</Text>
                    </Stack>
                  </Stack>
                </Flex>
                <Divider borderColor="gray.300" mt={rem(28)} />
              </Box>
            ))}
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
              defaultValue={VotingType.All}
              variantColor="brandBlue"
              title="Status"
            >
              <Radio borderColor="gray.100" value={VotingType.All}>
                All
              </Radio>
              <Radio borderColor="gray.100" value={VotingType.Open}>
                Open
              </Radio>
              <Radio borderColor="gray.100" value={VotingType.Voted}>
                Voted
              </Radio>
              <Radio borderColor="gray.100" value={VotingType.Counting}>
                Counting
              </Radio>
              <Radio borderColor="gray.100" value={VotingType.Archive}>
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
    </Layout>
  )
}
