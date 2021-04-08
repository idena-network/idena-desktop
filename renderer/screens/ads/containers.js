/* eslint-disable react/prop-types */
import {
  DrawerFooter,
  Flex,
  FormControl,
  Heading,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {PrimaryButton} from '../../shared/components/button'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  FormLabel,
  HDivider,
} from '../../shared/components/components'
import {toLocaleDna} from '../../shared/utils/utils'
import {DnaInput, FillCenter} from '../oracles/components'
import {
  AdImage,
  FigureLabel,
  FigureNumber,
  SmallFigureLabel,
  SmallTargetFigure,
} from './components'
import {adUrlFromBytes} from './utils'

export function PublishAdDrawer({ad, ...props}) {
  const {i18n} = useTranslation()

  return (
    <Drawer {...props}>
      <DrawerHeader>
        <Stack spacing={4}>
          <FillCenter
            alignSelf="flex-start"
            bg="blue.012"
            w={12}
            minH={12}
            rounded="xl"
          >
            <Icon name="ads" size={6} color="brandBlue.500" />
          </FillCenter>
          <Heading fontSize="lg" fontWeight={500}>
            Pay
          </Heading>
        </Stack>
      </DrawerHeader>
      <DrawerBody overflowY="auto" mx={-6}>
        <Stack spacing={6} color="brandGray.500" fontSize="md" p={6} pt={0}>
          <Text>
            In order to make your ads visible for Idena users you need to burn
            more coins than competitors targeting the same audience.
          </Text>
          <Stack spacing={6} bg="gray.50" p={6} rounded="lg">
            <Stack isInline spacing={5}>
              <AdImage src={adUrlFromBytes(ad.cover)} size={60}></AdImage>
              <Text fontWeight={500}>{ad.title}</Text>
            </Stack>
            <Stack spacing={3}>
              <HDivider />
              <Stack>
                <Flex>
                  <FigureLabel>Competitors</FigureLabel>
                  <FigureNumber fontSize="md" fontWeight={500}>
                    1
                  </FigureNumber>
                </Flex>
                <Flex>
                  <FigureLabel>Max price</FigureLabel>
                  <FigureNumber fontSize="md" fontWeight={500}>
                    {toLocaleDna(i18n.language)(0.22)} DNA
                  </FigureNumber>
                </Flex>
              </Stack>
              <HDivider />
              <Stack>
                <Flex>
                  <SmallFigureLabel>Location</SmallFigureLabel>
                  <SmallTargetFigure>{ad.location}</SmallTargetFigure>
                </Flex>
                <Flex>
                  <SmallFigureLabel>Language</SmallFigureLabel>
                  <SmallTargetFigure>{ad.lang}</SmallTargetFigure>
                </Flex>
                <Flex>
                  <SmallFigureLabel>Stake</SmallFigureLabel>
                  <SmallTargetFigure>{ad.stake}</SmallTargetFigure>
                </Flex>
                <Flex>
                  <SmallFigureLabel>Age</SmallFigureLabel>
                  <SmallTargetFigure>{ad.age}</SmallTargetFigure>
                </Flex>
                <Flex>
                  <SmallFigureLabel>OS</SmallFigureLabel>
                  <SmallTargetFigure>{ad.os}</SmallTargetFigure>
                </Flex>
              </Stack>
            </Stack>
          </Stack>
          <FormControl>
            <FormLabel htmlFor="amount">Amount, DNA</FormLabel>
            <DnaInput id="amount" />
          </FormControl>
        </Stack>
      </DrawerBody>
      <DrawerFooter
        pt={6}
        px={8}
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        // top={0}
      >
        <PrimaryButton>Burn</PrimaryButton>
      </DrawerFooter>
    </Drawer>
  )
}
