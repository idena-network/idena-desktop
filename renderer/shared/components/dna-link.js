/* eslint-disable react/prop-types */
import React from 'react'
import {margin} from 'polished'
import {useTranslation} from 'react-i18next'
import Modal from './modal'
import Box from './box'
import {SubHeading, Text} from './typo'
import theme, {rem} from '../theme'
import {Figure} from './utils'
import {useIdentityState} from '../providers/identity-context'
import Flex from './flex'
import Button from './button'
import apiClient from '../api/api-client'

export function DnaLinkDialog({url, onHide, ...props}) {
  const {t} = useTranslation()
  const {address} = useIdentityState()

  if (!url) return null

  const {callback_url: callbackUrl, token} = extractQueryParams(url)

  return (
    <Modal show={Boolean(callbackUrl)} width="360px" onHide={onHide} {...props}>
      <Box m="0 0 18px">
        <SubHeading>Login confirmation</SubHeading>
        <Text
          css={{
            display: 'inline-block',
            ...margin(rem(16), 0),
          }}
        >
          Please confirm that you want to use your public address for the
          website login:
        </Text>
        <Box
          bg={theme.colors.gray}
          p={theme.spacings.xlarge}
          css={{
            borderRadius: rem(10),
            ...margin(0, 0, rem(theme.spacings.medium24), 0),
          }}
        >
          <Figure label={t('Website')} value={callbackUrl} />
          <Figure label={t('Address')} value={address} />
          <Figure label={t('Token')} value={token} />
        </Box>
      </Box>
      <Flex align="center" justify="flex-end">
        <Box px="4px">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
        </Box>
        <Box px="4px">
          <Button
            onClick={async () => {
              global.openExternal((await composeCallbackUrl(url)).toString())
              onHide()
            }}
          >
            Proceed to {new URL(callbackUrl).hostname}
          </Button>
        </Box>
      </Flex>
    </Modal>
  )
}

function extractQueryParams(url) {
  const extractedQueryParams = {
    callback_url: null,
    token: null,
    nonce: null,
  }

  const {searchParams} = new URL(decodeURIComponent(url))
  for (const key of Object.keys(extractedQueryParams)) {
    extractedQueryParams[key] = searchParams.get(key)
  }

  return extractedQueryParams
}

async function composeCallbackUrl(inputUrl) {
  // eslint-disable-next-line camelcase
  const {callback_url, token} =
    typeof inputUrl === 'object' ? inputUrl : extractQueryParams(inputUrl)

  const url = new URL(callback_url)

  url.searchParams.set('token', token)
  url.searchParams.set('sign', await sign(token))

  return url
}

async function sign(token) {
  const {
    data: {result, error},
  } = await apiClient().post('/', {
    method: 'dna_sign',
    params: [token],
    id: 1,
  })
  if (error) throw new Error(error)
  return result
}
