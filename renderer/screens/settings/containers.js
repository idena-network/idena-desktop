/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  Button,
  Flex,
  FormControl,
  IconButton,
  InputGroup,
  InputRightElement,
  Select,
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
import {
  InfoButton,
  PrimaryButton,
  SecondaryButton,
} from '../../shared/components/button'
import {
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  FormLabel,
  Input,
  Toast,
  Tooltip,
} from '../../shared/components/components'
import {FillCenter} from '../oracles/components'
import {callRpc, eitherState} from '../../shared/utils/utils'
import {useNodeDispatch} from '../../shared/providers/node-context'
import {importKey} from '../../shared/api/dna'
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
                    icon={revealPassword ? 'eye-off' : 'eye'}
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
                'Scan QR by your mobile phone or copy code below for export private key.'
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
        <SecondaryButton onClick={onClose}>{t('Close')}</SecondaryButton>
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

  const [shouldResetNode, setShouldResetNode] = React.useState()

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
        importNodeKey(shouldResetNode)
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

  const [revealPassword, setRevealPassword] = React.useState()

  return (
    <Dialog title={t('Import private key')} {...props}>
      <form
        onSubmit={async e => {
          e.preventDefault()
          await submit()
          props.onClose()
        }}
      >
        <DialogBody>
          <Stack spacing={5} mt={3}>
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
              <InputGroup>
                <Input
                  id="password"
                  value={password}
                  type={revealPassword ? 'text' : 'password'}
                  onChange={e => setPassword(e.target.value)}
                />
                <InputRightElement h="full">
                  <IconButton
                    icon={revealPassword ? 'eye-off' : 'eye'}
                    size="xs"
                    bg={revealPassword ? 'gray.300' : 'white'}
                    w={8}
                    _hover={{
                      bg: revealPassword ? 'gray.300' : 'white',
                    }}
                    onClick={() => {
                      setRevealPassword(!revealPassword)
                    }}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl>
              <Stack isInline>
                <Checkbox
                  isChecked={shouldResetNode}
                  onChange={e => {
                    setShouldResetNode(e.target.checked)
                  }}
                >
                  {t('Re-sync node from scratch')}
                </Checkbox>
                <Tooltip
                  label={t(
                    'Please re-sync the node if you want to have an up-to-date transaction history for the new address. It will take some time to re-sync.'
                  )}
                  zIndex="tooltip"
                >
                  <InfoButton />
                </Tooltip>
              </Stack>
            </FormControl>
          </Stack>
        </DialogBody>
        <DialogFooter>
          {/* eslint-disable-next-line react/destructuring-assignment */}
          <SecondaryButton type="button" onClick={props.onClose}>
            {t('Close')}
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={!password || !key}>
            {t('Import')}
          </PrimaryButton>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

export function LocaleSwitcher() {
  const {i18n} = useTranslation()

  const {changeLanguage} = useSettingsDispatch()

  return (
    <Select
      value={i18n.language}
      borderColor="gray.300"
      h={8}
      onChange={e => {
        const nextLanguage = e.target.value
        i18n.changeLanguage(nextLanguage)
        changeLanguage(nextLanguage)
      }}
    >
      {AVAILABLE_LANGS.map(lang => (
        <option key={lang} value={lang}>
          {isoLangs[lang].nativeName} ({lang.toUpperCase()})
        </option>
      ))}
    </Select>
  )
}
