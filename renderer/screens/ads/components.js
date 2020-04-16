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
  Select,
  Input,
  Textarea,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {hideVisually} from 'polished'
import {rem} from '../../shared/theme'
import {IconButton} from '../../shared/components'
import {AVAILABLE_LANGS} from '../../i18n'
import {adFormMachine} from './machines'
import {COUNTRY_CODES, validImageType, toDataURL} from './utils'

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

export function AdForm({onChange, ...ad}) {
  const [current, send] = useMachine(adFormMachine, {
    context: {
      ...ad,
    },
    actions: {
      change: ctx => onChange(ctx),
    },
  })

  const {title, cover, url, location, lang, age, os, stake} = current.context

  return (
    <Stack spacing={6} w="480px">
      <FormSection>
        <FormSectionTitle>Parameters</FormSectionTitle>
        <Stack isInline spacing={10}>
          <Stack spacing={4} shouldWrapChildren>
            <AdFormField label="Text" id="text" align="flex-start">
              <AdTextarea
                defaultValue={title}
                onBlur={e => send('CHANGE', {title: e.target.value})}
              />
            </AdFormField>
            <AdFormField label="Link" id="link">
              <AdInput
                defaultValue={url}
                onBlur={e => send('CHANGE', {url: e.target.value})}
              />
            </AdFormField>
          </Stack>
          <Stack spacing={4} alignItems="flex-start">
            {cover ? (
              <Image src={cover} size={rem(80)} rounded="lg" />
            ) : (
              <Box bg="gray.50" borderWidth="1px" p={rem(19)} rounded="lg">
                <Icon name="pic" size={rem(40)} color="#d2d4d9" />
              </Box>
            )}
            <Input
              id="cover"
              type="file"
              accept="image/*"
              {...hideVisually()}
              opacity={0}
              onChange={async e => {
                const {files} = e.target
                if (files.length) {
                  const [file] = files
                  if (validImageType(file)) {
                    send('CHANGE', {
                      cover: await toDataURL(file),
                    })
                  }
                }
              }}
            />
            <IconButton
              as={FormLabel}
              htmlFor="cover"
              type="file"
              icon="laptop"
            >
              Upload cover
            </IconButton>
          </Stack>
        </Stack>
      </FormSection>
      <FormSection>
        <FormSectionTitle>Targeting conditions</FormSectionTitle>
        <Stack spacing={4} shouldWrapChildren>
          <AdFormField label="Location" id="location">
            <Select
              value={location}
              onChange={e => send('CHANGE', {location: e.target.value})}
            >
              <option></option>
              {Object.values(COUNTRY_CODES).map(c => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </AdFormField>
          <AdFormField label="Language" id="lang">
            <Select
              value={lang}
              onChange={e => send('CHANGE', {lang: e.target.value})}
            >
              <option></option>
              {AVAILABLE_LANGS.map(l => (
                <option key={l}>{l}</option>
              ))}
            </Select>
          </AdFormField>
          <AdFormField label="Age" id="age">
            <AdNumberInput
              defaulValue={age}
              onBlur={({target: {value}}) => send('CHANGE', {age: value})}
            />
          </AdFormField>
          <AdFormField label="Stake" id="stake">
            <NumberInput>
              <AdNumberInput
                defaultValue={stake}
                onBlur={({target: {value}}) => send('CHANGE', {stake: value})}
              />
            </NumberInput>
          </AdFormField>
          <AdFormField label="OS" id="os">
            <Select
              value={os}
              onChange={e => send('CHANGE', {os: e.target.value})}
            >
              <option></option>
              <option>macOS</option>
              <option>Windows</option>
              <option>Linux</option>
            </Select>
          </AdFormField>
        </Stack>
      </FormSection>
    </Stack>
  )
}

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
export function AdFormField({label, id, children}) {
  return (
    <FormControl as={Flex}>
      <FormLabel htmlFor={id} color="muted" w={rem(120)} pt={2}>
        {label}
      </FormLabel>
      <Box w={rem(360)}>
        {React.cloneElement(children, {
          id,
          fontWeight: 500,
        })}
      </Box>
    </FormControl>
  )
}

export function AdInput(props) {
  return <Input px={3} py={2} {...props} />
}

export function AdTextarea(props) {
  return <Textarea px={3} py={2} {...props} />
}

// eslint-disable-next-line react/prop-types
export function AdNumberInput(props) {
  return (
    <NumberInput w="100%" {...props}>
      <NumberInputField inputMode="numeric" pattern="[0-9]*" px={3} py={2} />
    </NumberInput>
  )
}

export function AdFooter(props) {
  return (
    <Box
      bg="white"
      borderTop="1px"
      borderTopColor="gray.100"
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

export function AdBanner({cover, title, owner, url}) {
  return (
    <Flex
      align="center"
      justify="space-between"
      bg="white"
      borderBottom="1px"
      borderBottomColor="gray.100"
      color="brandGray.500"
      px={4}
      py={2}
      position="sticky"
      top={0}
      zIndex="banner"
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
