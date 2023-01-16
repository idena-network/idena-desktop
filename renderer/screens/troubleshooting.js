/* eslint-disable react/prop-types */
import {
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {NODE_COMMAND} from '../../main/channels'
import {HDivider} from '../shared/components/components'

export function TroubleshootingScreen() {
  const {t} = useTranslation()

  const {restart, update, reset} = useTroubleshooting()

  return (
    <Stack spacing="6">
      <Stack spacing="1">
        <Heading as="h2" fontSize="lg" fontWeight={500}>
          {t('Ooops, something went wrong')}
        </Heading>
        <Text color="muted" fontSize="mdx">
          {t(`The built-in node is not available. Here's how to fix it.`, {
            nsSeparator: '|',
          })}
        </Text>
      </Stack>
      <TroubleshootingList>
        <TroubleshootingListItem
          title="1. Restart"
          description="Restart the built-in node. If it does not solve the problem try to restart your computer."
          ActionComponent={
            <TroubleshootingActionButton onClick={restart}>
              {t('Restart node')}
            </TroubleshootingActionButton>
          }
        />
        <TroubleshootingListItem
          title="2. Update"
          description="Download the latest version of the Idena node."
          ActionComponent={
            <TroubleshootingActionButton onClick={update}>
              {t('Update node')}
            </TroubleshootingActionButton>
          }
        />
        <TroubleshootingListItem
          title="3. Reset"
          description="Delete the blockchain data and re-sync it from scratch. This will not affect your private key."
          ActionComponent={
            <TroubleshootingActionButton variant="danger" onClick={reset}>
              {t('Reset node')}
            </TroubleshootingActionButton>
          }
        />
        <VisuallyHidden />
      </TroubleshootingList>
    </Stack>
  )
}

function TroubleshootingList({children}) {
  return (
    <Stack
      spacing={0}
      divider={<HDivider borderColor="gray.500" borderRadius={1} />}
    >
      {children}
    </Stack>
  )
}

function TroubleshootingListItem({title, description, ActionComponent}) {
  return (
    <Flex justify="space-between" align="center" w="md">
      <Stack spacing="1" py="6">
        <Text lineHeight="5" fontWeight={500}>
          {title}
        </Text>
        <Text color="muted" lineHeight="5" w="80">
          {description}
        </Text>
      </Stack>
      {ActionComponent}
    </Flex>
  )
}

/** @param {import('@chakra-ui/react').ButtonProps | {variant: "primary" | "danger"}} */
function TroubleshootingActionButton({variant = 'primary', ...props}) {
  return <Button variant={variant} lineHeight="5" w={120} {...props} />
}

function useTroubleshooting() {
  const restart = () => {
    global.ipcRenderer.send(NODE_COMMAND, 'restart-node')
  }

  const update = () => {
    global.ipcRenderer.send(NODE_COMMAND, 'download-node')
    console.log({update: true})
  }

  const reset = () => {
    global.ipcRenderer.send(NODE_COMMAND, 'reset-node')
  }

  return {
    restart,
    update,
    reset,
  }
}
