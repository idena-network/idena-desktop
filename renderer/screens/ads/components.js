/* eslint-disable react/prop-types */
import React, {forwardRef} from 'react'
import {
  Box,
  Divider,
  Flex,
  Image,
  Text,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Menu,
  MenuButton,
  Icon,
  MenuList,
  PseudoBox,
  MenuItem,
  InputGroup,
  NumberInput,
  NumberInputField,
  InputRightAddon,
  FormControl,
  FormLabel,
  Heading,
  Tab,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import theme, {rem} from '../../shared/theme'

export function Toolbar(props) {
  return <Flex mb={8} {...props} />
}

export function FigureGroup(props) {
  return <StatGroup {...props} />
}

export function Figure(props) {
  return <Stat {...props} />
}

export function FigureLabel(props) {
  return (
    <StatLabel color="muted" fontSize={rem(13)} fontWeight={400} {...props} />
  )
}

export function FigureNumber(props) {
  return (
    <StatNumber
      fontSize={rem(18)}
      fontWeight={500}
      minW={rem(116)}
      {...props}
    />
  )
}
export function SmallFigureLabel(props) {
  return <FigureLabel fontSize={rem(11)} {...props} />
}

export function SmallFigureNumber(props) {
  return <FigureNumber fontSize={rem(11)} {...props} />
}

export function SmallTargetFigure({children = 'Any', ...props}) {
  return (
    <FigureNumber fontSize={rem(11)} {...props}>
      {children}
    </FigureNumber>
  )
}

export function AdList(props) {
  return <Stack {...props} />
}

export function AdEntry(props) {
  return <Box {...props} />
}

export function AdImage(props) {
  return <Image rounded="lg" size={rem(60)} {...props} />
}

export function AdEntryDivider(props) {
  return <Divider border="px" borderColor="gray.100" mb={0} {...props} />
}

export function AdTarget(props) {
  return <Flex bg="gray.50" px={4} py={3} my={4} rounded="md" {...props}></Flex>
}

export function NoAds() {
  const {t} = useTranslation()
  return (
    <Flex
      flex={1}
      flexDirection="column"
      align="center"
      justify="center"
      color="muted"
      my="auto"
    >
      {t(`You haven't created any ads yet`)}
    </Flex>
  )
}

export function AdMenu(props) {
  return (
    <Menu autoSelect={false}>
      <MenuButton
        rounded="md"
        py={rem(6)}
        px={rem(2)}
        _hover={{bg: 'gray.50'}}
        _expanded={{bg: 'gray.50'}}
        _focus={{outline: 0}}
      >
        <Icon name="more" size={5} />
      </MenuButton>
      <MenuList
        placement="bottom-end"
        border="none"
        shadow="0 4px 6px 0 rgba(83, 86, 92, 0.24), 0 0 2px 0 rgba(83, 86, 92, 0.2)"
        rounded="lg"
        py={2}
        minWidth="145px"
        {...props}
      />
    </Menu>
  )
}

export function AdMenuItem(props) {
  return (
    <PseudoBox
      as={MenuItem}
      fontWeight={500}
      lineHeight={rem(20)}
      px={3}
      py={rem(6)}
      _hover={{bg: 'gray.50'}}
      _focus={{bg: 'gray.50'}}
      _selected={{bg: 'gray.50'}}
      _active={{bg: 'gray.50'}}
      {...props}
    ></PseudoBox>
  )
}

export function AdMenuItemIcon(props) {
  return <Icon size={5} mr={3} color="brandBlue.500" {...props} />
}

export function AdBanner({cover, title, owner, url}) {
  return (
    <Flex
      align="center"
      justify="space-between"
      borderBottom="1px"
      borderBottomColor="gray.100"
      color="brandGray.500"
      px={4}
      py={2}
    >
      <Stack
        isInline
        spacing={2}
        cursor="pointer"
        onClick={() => global.openExternal(url)}
      >
        <AdImage
          src={cover}
          size={rem(40)}
          fallbackSrc="//placekitten.com/40"
        />
        <Box>
          <Text>{title}</Text>
          <Stack isInline spacing={1}>
            <Image
              src={`https://robohash.org/${owner}`}
              size={rem(16)}
              border="1px"
              borderColor="brandGray.16"
              rounded="md"
            />
            <Text
              color="muted"
              fontSize={rem(11)}
              fontWeight={500}
              lineHeight={rem(16)}
            >
              {owner}
            </Text>
          </Stack>
        </Box>
      </Stack>
      <Box>
        <AdMenu>
          <AdMenuItem>
            <AdMenuItemIcon name="ads" />
            My Ads
          </AdMenuItem>
          <AdMenuItem>
            <AdMenuItemIcon name="cards" />
            View all offers
          </AdMenuItem>
        </AdMenu>
      </Box>
    </Flex>
  )
}

// eslint-disable-next-line react/display-name
export const AdFormTab = forwardRef(({isSelected, ...props}, ref) => (
  <Tab
    ref={ref}
    isSelected={isSelected}
    color="muted"
    fontWeight={500}
    py={2}
    px={4}
    rounded="md"
    _selected={{bg: 'brandBlue.50', color: 'brandBlue.500'}}
    {...props}
  />
))

// eslint-disable-next-line react/prop-types
export function FormSection(props) {
  return <Box {...props} />
}

export function FormSectionTitle(props) {
  return (
    <Heading
      as="h3"
      py="10px"
      mb={2}
      fontSize="14px"
      fontWeight={500}
      {...props}
    />
  )
}

// eslint-disable-next-line react/prop-types
export function AdFormControl({label, id, children}) {
  return (
    <FormControl>
      <Flex align="center">
        <FormLabel htmlFor={id} color="muted" w="120px">
          {label}
        </FormLabel>
        <Box width="360px">{React.cloneElement(children, {id})}</Box>
      </Flex>
    </FormControl>
  )
}

// eslint-disable-next-line react/prop-types
export function AdNumberInput({addon, ...props}) {
  return (
    <InputGroup>
      <NumberInput flex={1} {...props}>
        <NumberInputField
          inputMode="numeric"
          pattern="[0-9]*"
          flex={1}
          roundedRight={0}
        />
      </NumberInput>
      <InputRightAddon bg="gray.50">{addon}</InputRightAddon>
    </InputGroup>
  )
}

export function AdFooter(props) {
  return (
    <Box
      borderTop="1px"
      borderTopColor="gray.300"
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      px={4}
      py={3}
    >
      <Stack isInline spacing={2} justify="flex-end" {...props} />
    </Box>
  )
}
