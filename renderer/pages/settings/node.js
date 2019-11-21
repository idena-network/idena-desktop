/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {useState} from 'react'
import {margin, rem} from 'polished'

import {
  Box,
  Input,
  Label,
  Button,
  Switcher,
  Text,
} from '../../shared/components'
import theme from '../../shared/theme'
import {FlatButton} from '../../shared/components/button'
import Divider from '../../shared/components/divider'
import Flex from '../../shared/components/flex'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
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

function NodeSettings() {
  const {addNotification} = useNotificationDispatch()
  const settings = useSettingsState()
  const {
    saveExternalUrl,
    toggleUseInternalNode,
    toggleRunInternalNode,
    toggleTransferModal,
  } = useSettingsDispatch()
  const {nodeFailed} = useNodeState()
  const {tryRestartNode} = useNodeDispatch()

  const [url, setUrl] = useState(settings.url)

  const notify = () =>
    addNotification({
      title: 'Settings updated',
      body: `Connected to ${url}`,
    })

  return (
    <SettingsLayout>
      <Box py={theme.spacings.xlarge}>
        <Flex align="center">
          <Box>
            <Switcher
              isChecked={settings.runInternalNode}
              onChange={() => {
                if (settings.runInternalNode) {
                  toggleRunInternalNode(false)
                } else if (settings.userBeforeInternalNode) {
                  toggleTransferModal(true)
                } else {
                  toggleRunInternalNode(true)
                }
              }}
              bgOn={theme.colors.primary}
            />
          </Box>
          <div
            style={{
              ...margin(
                0,
                0,
                0,
                rem(theme.spacings.small12, theme.fontSizes.base)
              ),
            }}
          >
            <strong>Run built-in node</strong>
            <div>Use built-in node to have automatic updates</div>
          </div>
          {settings.runInternalNode && nodeFailed && (
            <div
              style={{
                ...margin(
                  0,
                  0,
                  0,
                  rem(theme.spacings.small12, theme.fontSizes.base)
                ),
              }}
            >
              <Text css={{color: theme.colors.warning}}>
                Node failed to start
              </Text>
              <Button
                variant="secondary"
                css={{marginLeft: 10}}
                onClick={() => tryRestartNode()}
              >
                Try restart
              </Button>
            </div>
          )}
        </Flex>
      </Box>
      <Box py={theme.spacings.large}>
        <Flex align="center">
          <Box>
            <Switcher
              isChecked={!settings.useInternalNode}
              onChange={() => {
                toggleUseInternalNode(!settings.useInternalNode)
              }}
              bgOn={theme.colors.primary}
            />
          </Box>
          <div
            style={{
              ...margin(
                0,
                0,
                0,
                rem(theme.spacings.small12, theme.fontSizes.base)
              ),
            }}
          >
            <strong>Connect to remote node</strong>
            <div>
              Specify the Node address if you want to connect to remote node
            </div>
          </div>
        </Flex>
      </Box>
      <Box
        py={theme.spacings.xlarge}
        style={{display: !settings.useInternalNode ? 'flex' : 'none'}}
      >
        <Flex align="center">
          <Label htmlFor="url">Node address</Label>
          <Input
            id="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            style={{
              ...margin(0, theme.spacings.normal, 0, 0),
              width: rem(300),
            }}
          />
          <Button
            onClick={() => {
              saveExternalUrl(url)
              notify()
            }}
          >
            Save
          </Button>
          <Divider vertical m={theme.spacings.small} />
          <FlatButton
            color={theme.colors.primary}
            onClick={() => {
              setUrl(BASE_API_URL)
              saveExternalUrl(BASE_API_URL)
              notify()
            }}
          >
            Use default
          </FlatButton>
        </Flex>
      </Box>
    </SettingsLayout>
  )
}

export default NodeSettings
