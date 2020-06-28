/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useReducer, useRef, useState } from 'react'
import { margin, padding, borderRadius } from 'polished'
import { useTranslation } from 'react-i18next'
import Ansi from 'ansi-to-react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import {
  Box,
  Input,
  Label,
  Button,
  Switcher,
  Text,
  SubHeading,
} from '../../shared/components'
import theme, { rem } from '../../shared/theme'
import { FlatButton } from '../../shared/components/button'
import Divider from '../../shared/components/divider'
import Flex from '../../shared/components/flex'
import { useNotificationDispatch } from '../../shared/providers/notification-context'
import { BASE_API_URL } from '../../shared/api/api-client'
import SettingsLayout from './layout'
import {
  useSettingsState,
  useSettingsDispatch,
} from '../../shared/providers/settings-context'
import {
  useNodeState,
  useNodeDispatch,
} from '../../shared/providers/node-context'
import { NODE_EVENT, NODE_COMMAND } from '../../../main/channels'

function NodeSettings() {
  const { addNotification } = useNotificationDispatch()
  const { t } = useTranslation()
  const settings = useSettingsState()
  const {
    saveExternalUrl,
    toggleUseExternalNode,
    toggleRunInternalNode,
    saveExternalApiKey,
  } = useSettingsDispatch()
  const { nodeFailed } = useNodeState()
  const { tryRestartNode } = useNodeDispatch()
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
          if (!settings.useExternalNode) dispatch({ type: 'NEW_LOG', data })
          break
        case 'last-node-logs':
          dispatch({ type: 'SET_LAST_LOGS', data })
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
    addNotification({
      title: t('Settings updated'),
      body: t('Connected to url', { url: state.url }),
    })

  const [revealApiKey, setRevealApiKey] = useState(false)

  return (
    <SettingsLayout>

    </SettingsLayout>
  )
}

export default NodeSettings
