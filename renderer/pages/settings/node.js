import React, {useEffect, useReducer, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Ansi from 'ansi-to-react'
import {
  Box,
  Text,
  Heading,
  Stack,
  InputRightElement,
  InputGroup,
  IconButton,
  Flex,
  useToast,
  Switch,
} from '@chakra-ui/core'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {BASE_API_URL} from '../../shared/api/api-client'
import {
  useSettingsState,
  useSettingsDispatch,
} from '../../shared/providers/settings-context'
import {
  useNodeState,
  useNodeDispatch,
} from '../../shared/providers/node-context'
import {NODE_EVENT, NODE_COMMAND} from '../../../main/channels'
import {Input, Toast} from '../../shared/components/components'
import {
  SettingsFormControl,
  SettingsFormLabel,
  SettingsSection,
} from '../../screens/settings/components'
import SettingsLayout from '../../screens/settings/layout'

function NodeSettings() {
  const {t} = useTranslation()

  const toast = useToast()

  const settings = useSettingsState()

  const {
    toggleUseExternalNode,
    toggleRunInternalNode,
    setConnectionDetails,
  } = useSettingsDispatch()

  const {nodeFailed} = useNodeState()

  const {tryRestartNode} = useNodeDispatch()

  const logsRef = useRef(null)

  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'SET_URL':
          return {
            ...prevState,
            url: action.data,
          }
        case 'SET_API_KEY': {
          return {
            ...prevState,
            apiKey: action.data,
          }
        }
        case 'SET_CONNECTION_DETAILS': {
          return {
            ...prevState,
            ...action,
          }
        }
        case 'NEW_LOG': {
          const prevLogs =
            prevState.logs.length > 200
              ? prevState.logs.slice(-100)
              : prevState.logs
          return {
            ...prevState,
            logs: [...prevLogs, ...action.data],
          }
        }
        case 'SET_LAST_LOGS': {
          return {
            ...prevState,
            logs: action.data,
          }
        }
        default:
      }
    },
    {
      logs: [],
      url: settings.url,
      apiKey: settings.externalApiKey,
    }
  )

  useEffect(() => {
    const onEvent = (_sender, event, data) => {
      switch (event) {
        case 'node-log':
          if (!settings.useExternalNode) dispatch({type: 'NEW_LOG', data})
          break
        case 'last-node-logs':
          dispatch({type: 'SET_LAST_LOGS', data})
          break
        default:
      }
    }

    global.ipcRenderer.on(NODE_EVENT, onEvent)

    return () => {
      global.ipcRenderer.removeListener(NODE_EVENT, onEvent)
    }
  })

  useEffect(() => {
    if (!settings.useExternalNode) {
      global.ipcRenderer.send(NODE_COMMAND, 'get-last-logs')
    }
  }, [settings.useExternalNode])

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = 9999
    }
  })

  const notify = () =>
    toast({
      // eslint-disable-next-line react/display-name
      render: () => (
        <Toast
          title={t('Settings updated')}
          description={t('Connected to url', {url: state.url})}
        />
      ),
    })

  const [revealApiKey, setRevealApiKey] = useState(false)

  return (
    <SettingsLayout>
      <Stack spacing={8} mt={8}>
        <Stack spacing={4}>
          <Stack isInline spacing={4} align="center">
            <Box>
              <Switch
                isChecked={settings.runInternalNode}
                onChange={() => {
                  toggleRunInternalNode(!settings.runInternalNode)
                }}
              />
            </Box>
            <Box>
              <Text fontWeight={500}>{t('Run built-in node')}</Text>
              <Text color="muted">
                {t('Use built-in node to have automatic updates')}
              </Text>
            </Box>
            {settings.runInternalNode && nodeFailed && (
              <Box>
                <Text color="red.500">{t('Node failed to start')}</Text>
                <SecondaryButton onClick={() => tryRestartNode()}>
                  {t('Try restart')}
                </SecondaryButton>
              </Box>
            )}
          </Stack>
          <Stack isInline spacing={3} align="center">
            <Box>
              <Switch
                isChecked={settings.useExternalNode}
                onChange={() => {
                  toggleUseExternalNode(!settings.useExternalNode)
                }}
              />
            </Box>
            <Box>
              <Text fontWeight={500}>{t('Connect to remote node')}</Text>
              <Text color="muted">
                {t(
                  'Specify the Node address if you want to connect to remote node'
                )}
              </Text>
            </Box>
          </Stack>
        </Stack>

        {settings.useExternalNode && (
          <SettingsSection title={t('Node settings')}>
            <Stack
              spacing={3}
              as="form"
              onSubmit={e => {
                e.preventDefault()
                setConnectionDetails(state)
                notify()
              }}
            >
              <SettingsFormControl>
                <SettingsFormLabel htmlFor="url">
                  {t('Node address')}
                </SettingsFormLabel>
                <Input
                  id="url"
                  value={state.url}
                  onChange={e =>
                    dispatch({type: 'SET_URL', data: e.target.value})
                  }
                />
              </SettingsFormControl>
              <SettingsFormControl>
                <SettingsFormLabel htmlFor="key">
                  {t('Node api key')}
                </SettingsFormLabel>
                <InputGroup w="full">
                  <Input
                    id="key"
                    value={state.apiKey}
                    type={revealApiKey ? 'text' : 'password'}
                    onChange={e =>
                      dispatch({type: 'SET_API_KEY', data: e.target.value})
                    }
                  />
                  <InputRightElement h="full">
                    <IconButton
                      icon={revealApiKey ? 'eye-off' : 'eye'}
                      size="xs"
                      bg={revealApiKey ? 'gray.300' : 'white'}
                      fontSize={20}
                      w={8}
                      _hover={{
                        bg: revealApiKey ? 'gray.300' : 'white',
                      }}
                      onClick={() => setRevealApiKey(!revealApiKey)}
                    />
                  </InputRightElement>
                </InputGroup>
              </SettingsFormControl>
              <Stack isInline spacing={2} align="center" justify="flex-end">
                <SecondaryButton
                  ml="auto"
                  type="button"
                  onClick={() => {
                    dispatch({type: 'SET_URL', data: BASE_API_URL})
                  }}
                >
                  {t('Use default')}
                </SecondaryButton>
                <PrimaryButton type="submit">{t('Save')}</PrimaryButton>
              </Stack>
            </Stack>
          </SettingsSection>
        )}

        {!settings.useExternalNode && (
          <Box>
            <Heading fontWeight={500} fontSize="lg" mb={4}>
              {t('Built-in node log')}
            </Heading>
            <Flex
              ref={logsRef}
              direction="column"
              height="xs"
              overflow="auto"
              wordBreak="break-word"
              borderColor="muted"
              borderWidth="px"
            >
              {state.logs.map((log, idx) => (
                <Ansi key={idx}>{log}</Ansi>
              ))}
            </Flex>
          </Box>
        )}
      </Stack>
    </SettingsLayout>
  )
}

export default NodeSettings
