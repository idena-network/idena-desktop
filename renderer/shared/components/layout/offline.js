/* eslint-disable react/prop-types */
import {
  Button,
  Center,
  Flex,
  Heading,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {HDivider} from '../components'

export function OfflineBanner() {
  const {t} = useTranslation()

  return (
    <Center
      bg="red.500"
      fontWeight={500}
      lineHeight="5"
      py="3"
      w="full"
      position="absolute"
      top={0}
      left={0}
    >
      {t('Offline')}
    </Center>
  )
}

export function TroubleshootingScreen() {
  const {t} = useTranslation()

  return (
    <Stack spacing="6">
      <Stack spacing="1">
        <Heading as="h2" fontSize="lg" fontWeight={500}>
          {t('How to fix the built-in node problem?')}
        </Heading>
        <Text color="muted" fontSize="mdx">
          {t('Try one of the following solutions:', {nsSeparator: '|'})}
        </Text>
      </Stack>
      <TroubleshootingList>
        <TroubleshootingListItem
          title="1. Restart"
          description="Restart the built-in node. If it does not solve the problem try to reboot your computer."
          ActionComponent={
            <TroubleshootingActionButton onClick={() => {}}>
              Restart node
            </TroubleshootingActionButton>
          }
        />
        <TroubleshootingListItem
          title="2. Update"
          description="Download the latest version of the Idena node from Github."
          ActionComponent={
            <TroubleshootingActionButton onClick={() => {}}>
              Update node
            </TroubleshootingActionButton>
          }
        />
        <TroubleshootingListItem
          title="3. Reset"
          description="Delete the blockchain data and re-sync it from scratch."
          ActionComponent={
            <TroubleshootingActionButton variant="danger" onClick={() => {}}>
              Reset node
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
