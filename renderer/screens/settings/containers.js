/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  Box,
  Button,
  Flex,
  FormControl,
  Icon,
  IconButton,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useClipboard,
  useToast,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import QrCode from 'qrcode.react'
import {useMachine} from '@xstate/react'
import {createMachine} from 'xstate'
import {assign} from 'xstate/lib/actions'
import {FiEye, FiEyeOff} from 'react-icons/fi'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {
  Dialog,
  DialogBody,
  DialogFooter,
  FormLabel,
  Input,
  Toast,
} from '../../shared/components/components'
import {FillCenter} from '../oracles/components'
import {callRpc, eitherState} from '../../shared/utils/utils'
import {useNodeDispatch} from '../../shared/providers/node-context'
import {importKey} from '../../shared/api'
import {useSettingsDispatch} from '../../shared/providers/settings-context'
import {AVAILABLE_LANGS, isoLangs} from '../../i18n'

export function ExportPrivateKeyDialog({onClose, ...props}) {
  const {t} = useTranslation()

  const [current, send] = useMachine(
    createMachine({
      initial: 'password',
      states: {
        password: {
          on: {
            CHANGE_PASSWORD: {
              actions: [
                assign({
                  password: (_, {value}) => value,
                }),
              ],
            },
            ENCODE: 'encoding',
          },
        },
        encoding: {
          invoke: {
            src: ({password}) => callRpc('dna_exportKey', password),
            onDone: 'encoded',
            onError: 'fail',
          },
        },
        encoded: {
          entry: [
            assign({
              encodedPrivateKey: (_, {data}) => data,
            }),
          ],
        },
        fail: {},
      },
    })
  )

  const {encodedPrivateKey} = current.context

  const is = state => eitherState(current, state)

  const [revealPassword, setRevealPassword] = React.useState()

  const {onCopy} = useClipboard(encodedPrivateKey)

  return (
    <Dialog
      size={400}
      title={t('Export private key')}
      onClose={onClose}
      {...props}
    >
      <DialogBody minH={48}>
        {is('password') && (
          <Stack spacing={5}>
            <Text color="muted" fontSize="mdx">
              {t('Create a new password to export your private key')}
            </Text>
            <FormControl>
              <FormLabel>{t('New password')}</FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  type={revealPassword ? 'text' : 'password'}
                  onChange={e => {
                    send('CHANGE_PASSWORD', {value: e.target.value})
                  }}
                />
                <InputRightElement h="full">
                  <IconButton
                    icon={revealPassword ? FiEyeOff : FiEye}
                    size="xs"
                    bg={revealPassword ? 'gray.300' : 'white'}
                    w={8}
                    _hover={{
                      bg: revealPassword ? 'gray.300' : 'white',
                    }}
                    onClick={() => setRevealPassword(!revealPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Stack>
        )}
        {is('encoded') && (
          <Stack spacing={5}>
            <Text color="muted" fontSize="mdx">
              {t(
                'Scan QR by your mobile phone or copy code below for export privatekey.'
              )}
            </Text>
            <FillCenter>
              <QrCode value="pk" />
            </FillCenter>
            <FormControl>
              <Stack spacing={1}>
                <Flex justify="space-between" align="center">
                  <FormLabel>{t('Encrypted private key')}</FormLabel>
                  <Button
                    variant="link"
                    variantColor="blue"
                    fontWeight={500}
                    _hover={null}
                    _active={null}
                    onClick={onCopy}
                  >
                    {t('Copy')}
                  </Button>
                </Flex>
                <Input type="password" value={encodedPrivateKey} isDisabled />
              </Stack>
            </FormControl>
          </Stack>
        )}
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose}>{t('Cancel')}</SecondaryButton>
        {is('password') && (
          <PrimaryButton
            onClick={() => {
              send('ENCODE')
            }}
          >
            {t('Export')}
          </PrimaryButton>
        )}
      </DialogFooter>
    </Dialog>
  )
}

export function ImportPrivateKeyDialog(props) {
  const {t} = useTranslation()

  const toast = useToast()

  const {importNodeKey} = useNodeDispatch()

  const [password, setPassword] = React.useState()

  const [key, setKey] = React.useState()

  const submit = async () => {
    try {
      const {error} = await importKey(key, password)
      if (error) {
        toast({
          status: 'error',
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast
              title={t('Error while importing key')}
              description={error.message}
              status="error"
            />
          ),
        })
      } else {
        importNodeKey()
        toast({
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast
              title={t('Success')}
              description={t(
                'Key was imported, please, wait, while node is restarting'
              )}
            />
          ),
        })
        setKey('')
        setPassword('')
      }
    } catch (e) {
      toast({
        status: 'error',
        // eslint-disable-next-line react/display-name
        render: () => (
          <Toast
            title={t('Error while importing key')}
            description={t(
              'Internal node is not available, try again in a few seconds'
            )}
            status="error"
          />
        ),
      })
    }
  }

  return (
    <Dialog title={t('Import private key')} {...props}>
      <DialogBody>
        <form
          onSubmit={async e => {
            e.preventDefault()
            await submit()
          }}
        >
          <Stack spacing={5}>
            <Text color="muted" fontSize="mdx">
              {t('Create a new password to export your private key')}
            </Text>
            <FormControl>
              <FormLabel htmlFor="key">{t('Encrypted private key')}</FormLabel>
              <Input
                value={key}
                type="text"
                onChange={e => setKey(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">{t('Password')}</FormLabel>
              <Input
                value={password}
                type="password"
                mr={4}
                onChange={e => setPassword(e.target.value)}
              />
            </FormControl>
          </Stack>
        </form>
      </DialogBody>
      <DialogFooter>
        {/* eslint-disable-next-line react/destructuring-assignment */}
        <SecondaryButton onClick={props.onClose}>{t('Close')}</SecondaryButton>
        <PrimaryButton type="submit" disabled={!password || !key}>
          {t('Import')}
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
}

export function LocaleSwitcher() {
  const {i18n} = useTranslation()

  const {changeLanguage} = useSettingsDispatch()

  return (
    <Menu autoSelect={false}>
      <MenuButton
        borderColor="gray.300"
        borderWidth={1}
        rounded="md"
        py={2}
        px={3}
        w="sm"
        _focus={{shadow: 'outline', outline: 'none'}}
      >
        <Flex justify="space-between">
          <Box>
            {isoLangs[i18n.language]?.nativeName} (
            {i18n.language?.toUpperCase()})
          </Box>
          <Icon name="chevron-down" />
        </Flex>
      </MenuButton>
      <MenuList
        placement="auto-end"
        border="none"
        shadow="0 4px 6px 0 rgba(83, 86, 92, 0.24), 0 0 2px 0 rgba(83, 86, 92, 0.2)"
        rounded="lg"
        py={2}
        minW={40}
        h={48}
        overflowY="auto"
      >
        {AVAILABLE_LANGS.map(lang => (
          <MenuItem
            key={lang}
            fontWeight={500}
            px={3}
            py="3/2"
            _hover={{bg: 'gray.50'}}
            _focus={{bg: 'gray.50'}}
            _selected={{bg: 'gray.50'}}
            _active={{bg: 'gray.50'}}
            onClick={() => {
              i18n.changeLanguage(lang)
              changeLanguage(lang)
            }}
          >
            {isoLangs[lang].nativeName} ({lang.toUpperCase()})
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}
