import {
  Stack,
  Badge,
  Box,
  Text,
  Heading,
  RadioGroup,
  Radio,
  Flex,
  Divider,
  Icon,
  Stat,
  StatNumber,
  StatLabel,
  FormControl,
  useDisclosure,
  StatHelpText,
  FormHelperText,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import Layout from '../../shared/components/layout'
import {Page} from '../../screens/app/components'
import {
  Avatar,
  Drawer,
  DrawerHeader,
  DrawerBody,
  Input,
  FormLabel,
} from '../../shared/components/components'
import {rem} from '../../shared/theme'
import {
  PrimaryButton,
  SecondaryButton,
  IconButton2,
} from '../../shared/components/button'
import {toLocaleDna} from '../../shared/utils/utils'

export default function VotePage() {
  const {t, i18n} = useTranslation()

  const {
    isOpen: isOpenConfirm,
    onOpen: onOpenConfirm,
    onClose: onCloseConfirm,
  } = useDisclosure()

  const {
    isOpen: isOpenReject,
    onOpen: onOpenReject,
    onClose: onCloseReject,
  } = useDisclosure()

  const {
    isOpen: isOpenFund,
    onOpen: onOpenFund,
    onClose: onCloseFund,
  } = useDisclosure()

  const toDna = toLocaleDna(i18n.language)

  return (
    <Layout>
      <Page pt={8}>
        <Stack isInline spacing={10}>
          <Box maxW="lg">
            <Stack isInline spacing={2} mb={10}>
              <Badge
                bg="green.020"
                borderRadius="xl"
                // fontSize="sm"
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
            <Stack spacing={6}>
              <Box borderRadius="md" bg="gray.50" py={8} px={10}>
                <Heading fontSize={rem(21)} fontWeight={500} mb={4}>
                  Did Trump win the 2020 election?
                </Heading>
                <Text lineHeight="tall">
                  President Trump on Monday threatened to yank the Republican
                  National Convention from Charlotte, N.C., where it is
                  scheduled to be held in August, accusing the state’s
                  Democratic governor of being in a “shutdown mood” that could
                  prevent a fully attended event. President Trump on Monday
                  threatened to yank the Republican National Convention from
                  Charlotte, N.C., where it is scheduled to be held in August,
                  accusing the state’s Democratic governor of being in a
                  “shutdown mood” that could prevent a fully attended event.
                </Text>
              </Box>
              <Box>
                <Text color="muted" fontSize="sm" mb={3}>
                  Choose an option to vote
                </Text>
                <RadioGroup>
                  <Flex
                    justify="space-between"
                    border="1px"
                    borderColor="gray.300"
                    borderRadius="md"
                    px={3}
                    py={2}
                  >
                    <Radio borderColor="gray.100" onClick={onOpenConfirm}>
                      Confirm
                    </Radio>
                    <Text color="muted" fontSize="sm">
                      70% min. votes required
                    </Text>
                  </Flex>
                  <Flex
                    justify="space-between"
                    border="1px"
                    borderColor="gray.300"
                    borderRadius="md"
                    px={3}
                    py={2}
                  >
                    <Radio borderColor="gray.100" onClick={onOpenReject}>
                      Reject
                    </Radio>
                    <Text color="muted" fontSize="sm">
                      70% min. votes required
                    </Text>
                  </Flex>
                </RadioGroup>
              </Box>
              <Flex justify="space-between" align="center">
                <Stack isInline spacing={2}>
                  <PrimaryButton onClick={() => console.log('vote')}>
                    {t('Vote')}
                  </PrimaryButton>
                  <SecondaryButton>{t('Cancel')}</SecondaryButton>
                </Stack>
                <Stack isInline spacing={3}>
                  <Divider
                    orientation="vertical"
                    borderColor="gray.300"
                    borderLeft="1px"
                  />
                  <Stack isInline spacing={2} align="center">
                    <Icon name="user" w={4} h={4} />
                    <Text as="span">642 votes</Text>
                  </Stack>
                </Stack>
              </Flex>
            </Stack>
          </Box>
          <Box mt={20}>
            <Stat mb={8}>
              <StatLabel color="muted" fontSize="md">
                <Stack isInline spacing={2} align="center">
                  <Icon name="star" size={4} color="white" />
                  <Text fontWeight={500}>Total prize</Text>
                </Stack>
              </StatLabel>
              <StatNumber fontSize="lg" fontWeight={500}>
                {toDna(100000)}
              </StatNumber>
              <StatHelpText>
                <IconButton2 icon="add-fund" onClick={onOpenFund}>
                  Add fund
                </IconButton2>
              </StatHelpText>
            </Stat>
            <Stack spacing={6}>
              <Stat>
                <StatLabel color="muted" fontSize="md">
                  Deposit
                </StatLabel>
                <StatNumber fontSize="lg" fontWeight={500}>
                  {toDna(240)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="muted" fontSize="md">
                  Your reward
                </StatLabel>
                <StatNumber fontSize="lg" fontWeight={500}>
                  {toDna(5000)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="muted" fontSize="md">
                  Quorum required
                </StatLabel>
                <StatNumber fontSize="lg" fontWeight={500}>
                  20 votes
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="muted" fontSize="md">
                  Deadline
                </StatLabel>
                <StatNumber fontSize="lg" fontWeight={500}>
                  {dayjs().format('D.MM.YYYY')}
                </StatNumber>
              </Stat>
            </Stack>
          </Box>
        </Stack>
      </Page>

      <Drawer isOpen={isOpenConfirm} onClose={onCloseConfirm}>
        <DrawerHeader mb={8}>
          <Flex
            align="center"
            justify="center"
            bg="blue.012"
            h={12}
            w={12}
            rounded="xl"
          >
            <Icon name="send-out" w={6} h={6} color="blue.500" />
          </Flex>
          <Heading
            color="brandGray.500"
            fontSize="lg"
            fontWeight={500}
            lineHeight="base"
            mt={4}
          >
            {t('Voting: confirm', {nsSeparator: '!'})}
          </Heading>
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing={5}>
            <FormControl>
              <FormLabel mb={2}>Transfer from</FormLabel>
              <Input />
              <Flex justify="space-between">
                <FormHelperText color="muted" fontSize="md">
                  Available
                </FormHelperText>
                <FormHelperText color="muted" fontSize="md">
                  {toDna(80200)}
                </FormHelperText>
              </Flex>
            </FormControl>
            <FormControl>
              <FormLabel mb={2}>To address</FormLabel>
              <Input isDisabled value="0x5A3abB61A9c5475B8243B61A9c5475B82" />
            </FormControl>
            <FormControl>
              <FormLabel mb={2}>Deposit, DNA</FormLabel>
              <Input isDisabled value={240} />
              <Flex justify="space-between">
                <FormHelperText color="muted" fontSize="md">
                  Fee
                </FormHelperText>
                <FormHelperText color="muted" fontSize="md">
                  {toDna(0.01)}
                </FormHelperText>
              </Flex>
              <Flex justify="space-between">
                <FormHelperText color="muted" fontSize="md">
                  Total amount
                </FormHelperText>
                <FormHelperText color="muted" fontSize="md">
                  {toDna(240.01)}
                </FormHelperText>
              </Flex>
            </FormControl>
            <PrimaryButton mt={3} ml="auto">
              {t('Send')}
            </PrimaryButton>
          </Stack>
        </DrawerBody>
      </Drawer>

      <Drawer isOpen={isOpenReject} onClose={onCloseReject}>
        <DrawerHeader>
          <Flex
            align="center"
            justify="center"
            bg="red.012"
            h={12}
            w={12}
            rounded="xl"
          >
            <Icon name="send-out" size={6} color="red.500" />
          </Flex>
          <Heading fontSize="lg" fontWeight={500} color="brandGray.500" mt={4}>
            {t('Voting: reject', {nsSeparator: '!'})}
          </Heading>
        </DrawerHeader>
        <DrawerBody>
          <FormControl>
            <FormLabel>Transfer from</FormLabel>
            <Input />
          </FormControl>
          <FormControl>
            <FormLabel>To address</FormLabel>
            <Input />
          </FormControl>
          <FormControl>
            <FormLabel>Deposit, DNA</FormLabel>
            <Input />
          </FormControl>
          <PrimaryButton>{t('Send')}</PrimaryButton>
        </DrawerBody>
      </Drawer>

      <Drawer isOpen={isOpenFund} onClose={onCloseFund}>
        <DrawerHeader>
          <Flex
            align="center"
            justify="center"
            bg="blue.030"
            h={12}
            w={12}
            rounded="xl"
          >
            <Icon name="send-out" size={6} color="blue.500" />
          </Flex>
          <Heading fontSize="lg" fontWeight={500} color="brandGray.500" mt={4}>
            {t('Add fund', {nsSeparator: '!'})}
          </Heading>
        </DrawerHeader>
        <DrawerBody>
          <FormControl>
            <FormLabel>Transfer from</FormLabel>
            <Input />
          </FormControl>
          <FormControl>
            <FormLabel>To address</FormLabel>
            <Input />
          </FormControl>
          <FormControl>
            <FormLabel>Deposit, DNA</FormLabel>
            <Input />
          </FormControl>
          <PrimaryButton>{t('Send')}</PrimaryButton>
        </DrawerBody>
      </Drawer>
    </Layout>
  )
}
