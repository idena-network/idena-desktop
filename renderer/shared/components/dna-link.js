/* eslint-disable react/prop-types */
import React from 'react'
import {useRouter} from 'next/router'
import {FormControl, Text} from '@chakra-ui/core'
import {
  margin,
  padding,
  backgrounds,
  borderRadius,
  border,
  wordWrap,
} from 'polished'
import {useTranslation} from 'react-i18next'
import {FiInfo, FiAlertCircle, FiGlobe} from 'react-icons/fi'
import Box from './box'
import theme, {rem} from '../theme'
import {useIdentityState} from '../providers/identity-context'
import Flex from './flex'
import {SecondaryButton, PrimaryButton} from './button'
import {
  startSession,
  authenticate,
  signNonce,
  isValidUrl,
  parseQuery,
  sendDna,
  DNA_SEND_CONFIRM_TRESHOLD,
  validDnaUrl,
  Transaction,
  appendTxHash,
} from '../utils/dna-link'
import {useNotificationDispatch} from '../providers/notification-context'
import {
  Avatar,
  Dialog,
  DialogBody,
  DialogFooter,
  FormLabel,
  Input,
  Tooltip,
} from './components'
import {
  areSameCaseInsensitive,
  viewVotingHref,
} from '../../screens/oracles/utils'
import {callRpc} from '../utils/utils'

export function DnaLinkHandler({children}) {
  const router = useRouter()

  const [dnaUrl, setDnaUrl] = React.useState()

  const {addError} = useNotificationDispatch()

  const {t} = useTranslation()

  React.useEffect(() => {
    if (dnaUrl && !validDnaUrl(dnaUrl))
      addError({
        title: t('Invalid DNA link'),
        body: t(`You must provide valid URL including protocol version`),
      })
  }, [addError, dnaUrl, t])

  React.useEffect(() => {
    if (global.isDev) return
    global.ipcRenderer.invoke('CHECK_DNA_LINK').then(setDnaUrl)
  }, [])

  React.useEffect(() => {
    const handleDnaLink = (_, e) => setDnaUrl(e)
    global.ipcRenderer.on('DNA_LINK', handleDnaLink)
    return () => {
      global.ipcRenderer.removeListener('DNA_LINK', handleDnaLink)
    }
  }, [])

  if (validDnaUrl(dnaUrl) && new URL(dnaUrl).pathname.includes('vote')) {
    const {address} = parseQuery(dnaUrl)
    if (!areSameCaseInsensitive(router.asPath, viewVotingHref(address))) {
      router.push(viewVotingHref(address))
      return null
    }
  }

  return validDnaUrl(dnaUrl) &&
    React.Children.only(children).props.isOpen(dnaUrl)
    ? React.cloneElement(children, {url: dnaUrl, onHide: () => setDnaUrl(null)})
    : null
}

export function DnaSignInDialog({url, onHide, onSigninError}) {
  const {t} = useTranslation()

  const initialRef = React.useRef()

  const {address} = useIdentityState()

  const {
    callback_url: callbackUrl,
    token,
    nonce_endpoint: nonceEndpoint,
    authentication_endpoint: authenticationEndpoint,
    favicon_url: faviconUrl,
  } = parseQuery(url)

  let callbackHostname = callbackUrl
  let callbackFaviconUrl

  if (isValidUrl(callbackUrl)) {
    const parsedCallbackUrl = new URL(callbackUrl)
    callbackHostname = parsedCallbackUrl.hostname || callbackUrl
    try {
      callbackFaviconUrl =
        faviconUrl || new URL('favicon.ico', parsedCallbackUrl.origin)
    } catch {
      global.logger.error(
        'Failed to construct favicon url from callback url',
        callbackUrl,
        parsedCallbackUrl
      )
    }
  }

  return (
    <DnaDialog
      isOpen={url}
      onClose={onHide}
      initialFocusRef={initialRef}
      title={t('Login confirmation')}
    >
      <DnaDialogBody>
        <DnaDialogSubtitle>
          {t(
            'Please confirm that you want to use your public address for the website login'
          )}
        </DnaDialogSubtitle>
        <DnaDialogDetails>
          <DnaDialogPanel>
            <PanelRow>
              <Box>
                <DnaDialogPanelLabel>{t('Website')}</DnaDialogPanelLabel>
                <DnaDialogPanelValue>{callbackHostname}</DnaDialogPanelValue>
              </Box>
              <PanelMediaCell>
                {callbackFaviconUrl ? (
                  <img
                    src={callbackFaviconUrl}
                    alt={`${callbackHostname} favicon`}
                    style={{
                      borderRadius: rem(6),
                      height: rem(40),
                      width: rem(40),
                    }}
                  />
                ) : (
                  <FiGlobe color={theme.colors.primary} size={rem(40)} />
                )}
              </PanelMediaCell>
            </PanelRow>
          </DnaDialogPanel>
          <DnaDialogPanelDivider />
          <DnaDialogPanel>
            <PanelRow>
              <Box>
                <DnaDialogPanelLabel>{t('Address')}</DnaDialogPanelLabel>
                <DnaDialogPanelValue>{address}</DnaDialogPanelValue>
              </Box>
              <PanelMediaCell>
                <Address address={address} />
              </PanelMediaCell>
            </PanelRow>
          </DnaDialogPanel>
          <DnaDialogPanelDivider />
          <DnaDialogPanel label={t('Token')} value={token} />
        </DnaDialogDetails>
      </DnaDialogBody>
      <DnaDialogFooter>
        <SecondaryButton onClick={onHide}>{t('Cancel')}</SecondaryButton>
        <PrimaryButton
          maxH={8}
          maxW={48}
          overflow="hidden"
          wordBreak="break-all"
          ref={initialRef}
          onClick={async () => {
            startSession(nonceEndpoint, {
              token,
              address,
            })
              .then(signNonce)
              .then(signature =>
                authenticate(authenticationEndpoint, {
                  token,
                  signature,
                })
              )
              .then(() => {
                if (isValidUrl(callbackUrl)) global.openExternal(callbackUrl)
                else onSigninError('Invalid callback URL')
              })
              .catch(({message}) => {
                global.logger.error(message)
                if (onSigninError) onSigninError(message)
              })
              .finally(onHide)
          }}
        >
          {t('Confirm')}
        </PrimaryButton>
      </DnaDialogFooter>
    </DnaDialog>
  )
}

export function DnaSendDialog({
  url,
  onHide,
  onDepositSuccess,
  onDepositError,
  ...props
}) {
  const {t} = useTranslation()

  const {address: from, balance} = useIdentityState()

  const {address: to, amount, comment, callback_url: callbackUrl} = parseQuery(
    url
  )

  const shouldConfirmTx = amount / balance > DNA_SEND_CONFIRM_TRESHOLD

  const [confirmAmount, setConfirmAmount] = React.useState()

  const areSameAmounts = +confirmAmount === +amount
  const isExceededBalance = +amount > balance

  return (
    <DnaDialog
      isOpen={url}
      onClose={onHide}
      m={0}
      title={t('Confirm transfer')}
      {...props}
    >
      <DnaDialogBody>
        <DnaDialogSubtitle>
          {t(
            `You’re about to send iDNA from your wallet to the following address`
          )}
        </DnaDialogSubtitle>
        <DnaDialogAlert>
          {t(`Attention! This is irreversible operation`)}
        </DnaDialogAlert>
        <DnaDialogDetails>
          <DnaDialogPanel>
            <PanelRow>
              <Box>
                <DnaDialogPanelLabel>{t('To')}</DnaDialogPanelLabel>
                <DnaDialogPanelValue>{to}</DnaDialogPanelValue>
              </Box>
              <PanelMediaCell>
                <Address address={to} />
              </PanelMediaCell>
            </PanelRow>
          </DnaDialogPanel>
          <DnaDialogPanelDivider />
          <DnaDialogPanel>
            <DnaDialogPanelLabel>{t('Amount')}, iDNA</DnaDialogPanelLabel>
            <DnaDialogPanelValue
              color={
                isExceededBalance ? theme.colors.danger : theme.colors.text
              }
            >
              <PanelRow justify="flex-start">
                <Box style={{...margin(0, rem(4), 0, 0)}}>{amount}</Box>
                <Box
                  style={{
                    lineHeight: rem(theme.fontSizes.base),
                    ...margin(rem(2), 0, 0),
                  }}
                >
                  {isExceededBalance && (
                    <Tooltip
                      label={t('The amount is larger than your balance')}
                    >
                      <FiAlertCircle
                        size={rem(16)}
                        color={theme.colors.danger}
                      />
                    </Tooltip>
                  )}
                </Box>
              </PanelRow>
            </DnaDialogPanelValue>
          </DnaDialogPanel>
          <DnaDialogPanelDivider />
          <DnaDialogPanel
            label={`${t('Available balance')}, iDNA`}
            value={balance}
          />
          <DnaDialogPanelDivider />
          <DnaDialogPanel label={t('Comment')} value={comment} />
        </DnaDialogDetails>
        {shouldConfirmTx && (
          <FormControl mt={5}>
            <FormLabel style={{fontWeight: 500}}>
              {t('Enter amount to confirm transfer')}
            </FormLabel>
            <Input
              disabled={isExceededBalance}
              value={confirmAmount}
              onChange={e => setConfirmAmount(e.target.value)}
            />
            {Number.isFinite(+confirmAmount) && !areSameAmounts && (
              <AlertText>
                {t('Entered amount does not match target amount')}
              </AlertText>
            )}
          </FormControl>
        )}
      </DnaDialogBody>
      <DnaDialogFooter>
        <SecondaryButton onClick={onHide}>{t('Cancel')}</SecondaryButton>
        <PrimaryButton
          isDisabled={isExceededBalance || (shouldConfirmTx && !areSameAmounts)}
          onClick={async () => {
            new Promise((resolve, reject) => {
              if (shouldConfirmTx) {
                return areSameAmounts
                  ? resolve()
                  : reject(
                      new Error(
                        t('Entered amount does not match target amount')
                      )
                    )
              }
              return resolve()
            })
              .then(() => sendDna({from, to, amount, comment}))
              .then(hash => {
                if (isValidUrl(callbackUrl)) {
                  global.logger.info('Received dna://send cb url', callbackUrl)
                  global.logger.info(
                    'Append hash to cb url',
                    appendTxHash(callbackUrl, hash).href
                  )
                  global.openExternal(appendTxHash(callbackUrl, hash).href)
                }
                onDepositSuccess(hash)
              })
              .catch(({message}) => {
                global.logger.error(message)
                if (onDepositError) onDepositError(message)
              })
              .finally(onHide)
          }}
        >
          {t('Confirm')}
        </PrimaryButton>
      </DnaDialogFooter>
    </DnaDialog>
  )
}

export function DnaRawTxDialog({
  url,
  onHide,
  onSendSuccess,
  onSendError,
  ...props
}) {
  const {t} = useTranslation()

  const {balance} = useIdentityState()

  const {tx: rawTx, callback_url: callbackUrl} = parseQuery(url)

  const {amount: rawAmount, to} = new Transaction().fromHex(rawTx)

  const amount = rawAmount / 10 ** 18

  const shouldConfirmTx = amount / balance > DNA_SEND_CONFIRM_TRESHOLD

  const [confirmAmount, setConfirmAmount] = React.useState()

  const areSameAmounts = +confirmAmount === +amount
  const isExceededBalance = +amount > balance

  return (
    <DnaDialog
      isOpen={url}
      onClose={onHide}
      m={0}
      title={t('Confirm transaction')}
      {...props}
    >
      <DnaDialogBody>
        <DnaDialogSubtitle>
          {t('You’re about to sign and send tx from your wallet')}
        </DnaDialogSubtitle>
        <DnaDialogAlert>
          {t('Attention! This is irreversible operation')}
        </DnaDialogAlert>
        <DnaDialogDetails>
          <DnaDialogPanel>
            <PanelRow>
              <Box>
                <DnaDialogPanelLabel>{t('To')}</DnaDialogPanelLabel>
                <DnaDialogPanelValue>{to}</DnaDialogPanelValue>
              </Box>
              <PanelMediaCell>
                <Address address={to} />
              </PanelMediaCell>
            </PanelRow>
          </DnaDialogPanel>
          <DnaDialogPanelDivider />
          <DnaDialogPanel>
            <DnaDialogPanelLabel>{t('Amount')}, iDNA</DnaDialogPanelLabel>
            <DnaDialogPanelValue
              color={
                isExceededBalance ? theme.colors.danger : theme.colors.text
              }
            >
              <PanelRow justify="flex-start">
                <Box style={{...margin(0, rem(4), 0, 0)}}>{amount}</Box>
                <Box
                  style={{
                    lineHeight: rem(theme.fontSizes.base),
                    ...margin(rem(2), 0, 0),
                  }}
                >
                  {isExceededBalance && (
                    <Tooltip
                      label={t('The amount is larger than your balance')}
                    >
                      <FiAlertCircle
                        size={rem(16)}
                        color={theme.colors.danger}
                      />
                    </Tooltip>
                  )}
                </Box>
              </PanelRow>
            </DnaDialogPanelValue>
          </DnaDialogPanel>
          <DnaDialogPanelDivider />
          <DnaDialogPanel
            label={`${t('Available balance')}, iDNA`}
            value={balance}
          />
          <DnaDialogPanelDivider />
          <DnaDialogPanel label={t('Transaction details')}>
            <Tooltip label={rawTx} zIndex="tooltip" wordBreak="break-all">
              <Text
                display="-webkit-box"
                overflow="hidden"
                style={{
                  '-webkit-box-orient': 'vertical',
                  '-webkit-line-clamp': '2',
                }}
                wordBreak="break-all"
              >
                {rawTx}
              </Text>
            </Tooltip>
          </DnaDialogPanel>
        </DnaDialogDetails>
        {shouldConfirmTx && (
          <FormControl mt={5}>
            <FormLabel style={{fontWeight: 500}}>
              {t('Enter amount to confirm transfer')}
            </FormLabel>
            <Input
              disabled={isExceededBalance}
              value={confirmAmount}
              onChange={e => setConfirmAmount(e.target.value)}
            />
            {Number.isFinite(+confirmAmount) && !areSameAmounts && (
              <AlertText>
                {t('Entered amount does not match target amount')}
              </AlertText>
            )}
          </FormControl>
        )}
      </DnaDialogBody>
      <DnaDialogFooter>
        <SecondaryButton onClick={onHide}>{t('Cancel')}</SecondaryButton>
        <PrimaryButton
          isDisabled={isExceededBalance || (shouldConfirmTx && !areSameAmounts)}
          onClick={async () => {
            new Promise((resolve, reject) => {
              if (shouldConfirmTx) {
                return areSameAmounts
                  ? resolve()
                  : reject(
                      new Error(
                        t('Entered amount does not match target amount')
                      )
                    )
              }
              return resolve()
            })
              .then(() => callRpc('bcn_sendRawTx', rawTx))
              .then(hash => {
                if (isValidUrl(callbackUrl)) {
                  global.logger.info('Received dna://rawTx cb url', callbackUrl)
                  global.openExternal(appendTxHash(callbackUrl, hash).href)
                }
                onSendSuccess(hash)
              })
              .catch(({message}) => {
                global.logger.error(message)
                if (onSendError) onSendError(message)
              })
              .finally(onHide)
          }}
        >
          {t('Confirm')}
        </PrimaryButton>
      </DnaDialogFooter>
    </DnaDialog>
  )
}

function DnaDialog(props) {
  return <Dialog {...props} />
}

function DnaDialogSubtitle(props) {
  return <Text mb={5} {...props} />
}

function DnaDialogAlert(props) {
  return (
    <Flex
      align="center"
      css={{
        ...backgrounds(theme.colors.danger02),
        ...border('1px', 'solid', theme.colors.danger),
        ...borderRadius('top', rem(6)),
        ...borderRadius('bottom', rem(6)),
        ...padding(rem(8), rem(12)),
        ...margin(0, 0, rem(20), 0),
      }}
    >
      <FiInfo size={rem(16)} color={theme.colors.danger} fontWeight={500} />
      <Text fontWeight={500} ml={2} {...props} />
    </Flex>
  )
}

function DnaDialogBody(props) {
  return <DialogBody {...props} />
}

function DnaDialogDetails(props) {
  return (
    <Box
      bg={theme.colors.gray}
      css={{
        borderRadius: rem(8),
        ...padding(0, rem(20)),
      }}
      {...props}
    />
  )
}

// eslint-disable-next-line no-unused-vars
function DnaDialogPanel({label, value, children, ...props}) {
  return (
    <Box
      css={{
        ...padding(rem(16), 0),
        ...margin(0, 0, '1px'),
      }}
      {...props}
    >
      {label && <DnaDialogPanelLabel>{label}</DnaDialogPanelLabel>}
      {value && <DnaDialogPanelValue>{value}</DnaDialogPanelValue>}
      {children}
    </Box>
  )
}

function DnaDialogPanelLabel(props) {
  return <Text color="muted" lineHeight="short" {...props} />
}

function DnaDialogPanelValue(props) {
  return (
    <Box
      css={{
        color: theme.colors.text,
        fontWeight: 500,
        lineHeight: rem(20),
        ...wordWrap('break-all'),
        minWidth: rem(40),
      }}
      {...props}
    />
  )
}

function DnaDialogPanelDivider() {
  return (
    <hr
      style={{
        border: 'none',
        ...border('top', '1px', 'solid', theme.colors.white),
        ...margin(0, rem(-20)),
      }}
    />
  )
}

function PanelRow(props) {
  return <Flex align="center" justify="space-between" {...props} />
}

function PanelMediaCell(props) {
  return (
    <Box
      style={{
        minWidth: rem(40),
        ...margin(0, 0, 0, rem(16)),
      }}
      {...props}
    />
  )
}

function DnaDialogFooter(props) {
  return <DialogFooter {...props} />
}

function Address({address}) {
  return (
    <Avatar
      address={address}
      size={10}
      bg="white"
      borderRadius="md"
      borderWidth={1}
      borderColor="gray.300"
    />
  )
}

function AlertText({textAlign = 'initial', ...props}) {
  return (
    <Box
      color={theme.colors.danger}
      style={{
        fontWeight: theme.fontWeights.medium,
        fontSize: rem(11),
        ...margin(rem(12), 0, 0),
        textAlign,
      }}
      {...props}
    />
  )
}
