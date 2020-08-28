import React, {useEffect, useReducer, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Ansi from 'ansi-to-react'
import {FiEye, FiEyeOff} from 'react-icons/fi'
import {
  Box,
  Text,
  Heading,
  Stack,
  Divider,
  InputRightElement,
  InputGroup,
  IconButton,
  Button,
  Flex,
  useToast,
} from '@chakra-ui/core'
import {Switcher} from '../../shared/components'
import theme from '../../shared/theme'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {BASE_API_URL} from '../../shared/api/api-client'
import SettingsLayout from './layout'
import {
  useSettingsState,
  useSettingsDispatch,
} from '../../shared/providers/settings-context'
import {
  useNodeState,
  useNodeDispatch,
} from '../../shared/providers/node-context'
import {NODE_EVENT, NODE_COMMAND} from '../../../main/channels'
import {getLayout} from '../../screens/app/layout'
import {FormLabel, Input, Toast} from '../../shared/components/components'

function NodeSettings() {
  const {t} = useTranslation()

  const toast = useToast()

  const settings = useSettingsState()

  const {
    saveExternalUrl,
    toggleUseExternalNode,
    toggleRunInternalNode,
    saveExternalApiKey,
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
    <Stack spacing={8} mt={8}>
      <Stack isInline spacing={3} align="center">
        <Box>
          <Switcher
            isChecked={settings.runInternalNode}
            onChange={() => {
              toggleRunInternalNode(!settings.runInternalNode)
            }}
            bgOn={theme.colors.primary}
          />
        </Box>
        <Box>
          <Text fontWeight={500}>{t('Run built-in node')}</Text>
          <Text color="muted">
            {t('Use built-in node to have automatic updates')}
          </Text>
        </Box>
        {settings.runInternalNode && nodeFailed && (
          <Box mb={3}>
            <Text color="red.500">{t('Node failed to start')}</Text>
            <SecondaryButton onClick={() => tryRestartNode()}>
              {t('Try restart')}
            </SecondaryButton>
          </Box>
        )}
      </Stack>
      <Stack isInline spacing={3} align="center">
        <Box>
          <Switcher
            isChecked={settings.useExternalNode}
            onChange={() => {
              toggleUseExternalNode(!settings.useExternalNode)
            }}
            bgOn={theme.colors.primary}
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
      {settings.useExternalNode && (
        <Stack spacing={2}>
          <Stack isInline spacing={2} align="center">
            <FormLabel htmlFor="url" fontWeight={400} minW={24}>
              {t('Node address')}
            </FormLabel>
            <Input
              id="url"
              value={state.url}
              w="xs"
              onChange={e => dispatch({type: 'SET_URL', data: e.target.value})}
            />
            <PrimaryButton
              onClick={() => {
                saveExternalUrl(state.url)
                notify()
              }}
            >
              {t('Save')}
            </PrimaryButton>
            <Divider orientation="vertical" />
            <Button
              variant="link"
              variantColor="brandBlue"
              fontWeight={500}
              onClick={() => {
                dispatch({type: 'SET_URL', data: BASE_API_URL})
                saveExternalUrl(BASE_API_URL)
                notify()
              }}
            >
              {t('Use default')}
            </Button>
          </Stack>
          <Stack isInline spacing={2} align="center">
            <FormLabel htmlFor="key" fontWeight={400} minW={24}>
              {t('Node api key')}
            </FormLabel>
            <InputGroup>
              <Input
                id="key"
                value={state.apiKey}
                type={revealApiKey ? 'text' : 'password'}
                w="xs"
                onChange={e =>
                  dispatch({type: 'SET_API_KEY', data: e.target.value})
                }
              ></Input>
              <InputRightElement h="full">
                <IconButton
                  size="xs"
                  icon={revealApiKey ? FiEyeOff : FiEye}
                  bg="white"
                  _hover={null}
                  onClick={() => setRevealApiKey(!revealApiKey)}
                />
              </InputRightElement>
            </InputGroup>
            <PrimaryButton
              onClick={() => {
                saveExternalApiKey(state.apiKey)
                notify()
              }}
            >
              {t('Save')}
            </PrimaryButton>
          </Stack>
        </Stack>
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
  )
}

NodeSettings.getLayout = function getNodeSettingsLayout(page, fallbackApp) {
  return getLayout(<SettingsLayout>{page}</SettingsLayout>, fallbackApp)
}

export default NodeSettings
