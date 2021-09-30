/* eslint-disable react/prop-types */
import React from 'react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  FormControl,
  Icon,
  Image,
  Stack,
  Text,
} from '@chakra-ui/core'
import {useIdentityState} from '../../shared/providers/identity-context'
import {SecondaryButton, PrimaryButton} from '../../shared/components/button'
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
  handleCallbackUrl,
} from './utils'
import {
  Avatar,
  Dialog,
  DialogBody,
  DialogFooter,
  ExternalLink,
  FormLabel,
  HDivider,
  Input,
  Tooltip,
} from '../../shared/components/components'
import {areSameCaseInsensitive, viewVotingHref} from '../oracles/utils'
import {callRpc} from '../../shared/utils/utils'
import {useFailToast} from '../../shared/hooks/use-toast'

export function DnaLinkHandler({children}) {
  const router = useRouter()

  const [dnaUrl, setDnaUrl] = React.useState(
    `dna://send/v1?address=0x98D16d7021930b788135dD834983394fF2De9869&amount=100.00000000&comment=BSCADDRESS0xe34c6adfebd4671ba9585ccc2bed36c6f459cd0b&callback_url=http://localhost:5555&callback_format=json`
  )

  const toastFail = useFailToast()

  const {t} = useTranslation()

  React.useEffect(() => {
    if (dnaUrl && !validDnaUrl(dnaUrl))
      toastFail({
        title: t('Invalid DNA link'),
        description: t(`You must provide valid URL including protocol version`),
      })
  }, [dnaUrl, t, toastFail])

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
                  <Image
                    src={callbackFaviconUrl}
                    ignoreFallback
                    borderRadius="md"
                    h={10}
                    w={10}
                  />
                ) : (
                  <Icon name="globe" color="blue.500" size={10} />
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
  onSendTxFailed,
  ...props
}) {
  const {t} = useTranslation()

  const {address: from, balance} = useIdentityState()

  const {
    address: to,
    amount,
    comment,
    callback_url: callbackUrl,
    callback_format: callbackFormat,
  } = parseQuery(url)

  const shouldConfirmTx = amount / balance > DNA_SEND_CONFIRM_TRESHOLD

  const [confirmAmount, setConfirmAmount] = React.useState()

  const areSameAmounts = +confirmAmount === +amount
  const isExceededBalance = +amount > balance

  const [isSubmitting, setIsSubmitting] = React.useState()

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
              color={isExceededBalance ? 'red.500' : 'brandGray.500'}
            >
              <PanelRow justify="flex-start">
                <Box mr={1}>{amount}</Box>
                <Box mt="1/2" lineHeight="shorter">
                  {isExceededBalance && (
                    <Tooltip
                      label={t('The amount is larger than your balance')}
                    >
                      <Icon name="exclamation-mark" size={4} color="red.500" />
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
          isLoading={isSubmitting}
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
              .then(() => setIsSubmitting(true))
              .then(() => sendDna({from, to, amount, comment}))
              .then(async hash => {
                if (isValidUrl(callbackUrl)) {
                  const callbackUrlWithHash = appendTxHash(callbackUrl, hash)

                  global.logger.info('Received dna://send cb url', callbackUrl)
                  global.logger.info(
                    'Append hash to cb url',
                    callbackUrlWithHash.href
                  )

                  await handleCallbackUrl(callbackUrlWithHash, callbackFormat, {
                    // eslint-disable-next-line no-shadow
                    onJson: ({success, error, url}) => {
                      if (success) {
                        onDepositSuccess({hash, url})
                      } else {
                        onDepositError({
                          error:
                            error ??
                            t('{{url}} responded with an unknown format', {
                              url: callbackUrlWithHash.href,
                            }),
                          url: url ?? callbackUrlWithHash,
                        })
                      }
                    },
                    // eslint-disable-next-line no-shadow
                    onHtml: ({url}) => onDepositSuccess({hash, url}),
                  })
                    .catch(error => {
                      global.logger.error(error)
                      onDepositError({
                        error: error?.message,
                        url: callbackUrlWithHash.href,
                      })
                    })
                    .finally(() => setIsSubmitting(false))
                } else {
                  setIsSubmitting(false)
                  global.logger.error('Invalid dna://send cb url', callbackUrl)
                }
              })
              .catch(({message}) => {
                setIsSubmitting(false)
                global.logger.error(message)
                onSendTxFailed(message)
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
  onSendRawTxFailed,
  ...props
}) {
  const {t} = useTranslation()

  const {balance} = useIdentityState()

  const {
    tx: rawTx,
    callback_url: callbackUrl,
    callback_format: callbackFormat,
  } = parseQuery(url)

  const {amount: rawAmount, to} = new Transaction().fromHex(rawTx)

  const amount = rawAmount / 10 ** 18

  const shouldConfirmTx = amount / balance > DNA_SEND_CONFIRM_TRESHOLD

  const [confirmAmount, setConfirmAmount] = React.useState()

  const areSameAmounts = +confirmAmount === +amount
  const isExceededBalance = +amount > balance

  const [isSubmitting, setIsSubmitting] = React.useState()

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
              color={isExceededBalance ? 'red.500' : 'brandGray.500'}
            >
              <PanelRow justify="flex-start">
                <Box mr={1}>{amount}</Box>
                <Box mt="1/2" lineHeight="shorter">
                  {isExceededBalance && (
                    <Tooltip
                      label={t('The amount is larger than your balance')}
                    >
                      <Icon name="exclamation-mark" size={4} color="red.500" />
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
          isLoading={isSubmitting}
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
              .then(() => setIsSubmitting(true))
              .then(() => callRpc('bcn_sendRawTx', rawTx))
              .then(async hash => {
                if (isValidUrl(callbackUrl)) {
                  const callbackUrlWithHash = appendTxHash(callbackUrl, hash)

                  global.logger.info('Received dna://rawTx cb url', callbackUrl)
                  global.logger.info(
                    'Append hash to cb url',
                    callbackUrlWithHash.href
                  )

                  await handleCallbackUrl(callbackUrlWithHash, callbackFormat, {
                    // eslint-disable-next-line no-shadow
                    onJson: ({success, error, url}) => {
                      if (success) {
                        onSendSuccess({hash, url})
                      } else {
                        onSendError({error, url})
                      }
                    },
                    // eslint-disable-next-line no-shadow
                    onHtml: ({url}) => onSendSuccess({hash, url}),
                  })
                    .catch(error => {
                      global.logger.error(error)
                      onSendError({
                        error: error?.message,
                        url: callbackUrlWithHash.href,
                      })
                    })
                    .finally(() => setIsSubmitting(false))
                } else {
                  setIsSubmitting(false)
                  global.logger.error('Invalid dna://send cb url', callbackUrl)
                }
              })
              .catch(({message}) => {
                setIsSubmitting(false)
                global.logger.error(message)
                onSendRawTxFailed(message)
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
    <Stack
      isInline
      align="center"
      bg="red.020"
      borderColor="red.500"
      borderWidth={1}
      borderRadius="md"
      px={3}
      py={2}
      mb={5}
    >
      <Icon name="info" size={4} color="red.500" />
      <Text fontWeight={500} {...props} />
    </Stack>
  )
}

function DnaDialogBody(props) {
  return <DialogBody {...props} />
}

function DnaDialogDetails(props) {
  return <Box bg="gray.50" borderRadius="lg" px={5} {...props} />
}

// eslint-disable-next-line no-unused-vars
function DnaDialogPanel({label, value, children, ...props}) {
  return (
    <Box py={4} mb="1px" {...props}>
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
  return <Box fontWeight={500} wordBreak="break-all" minW={10} {...props} />
}

function DnaDialogPanelDivider() {
  return <HDivider border="none" borderColor="white" mx={-5} />
}

function PanelRow(props) {
  return <Flex align="center" justify="space-between" {...props} />
}

function PanelMediaCell(props) {
  return <Box minW={10} mb={4} {...props} />
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

function AlertText(props) {
  return (
    <Box color="red.500" fontWeight={500} fontSize="sm" mt={1} {...props} />
  )
}

export function DnaSendSucceededDialog({hash, url, ...props}) {
  const {t} = useTranslation()
  return (
    <Dialog closeOnOverlayClick={false} closeOnEsc={false} {...props}>
      <DialogBody color="brandGray.500">
        <Stack spacing={5}>
          <Alert
            status="success"
            bg="green.010"
            borderRadius="lg"
            flexDirection="column"
            justifyContent="center"
            height={132}
          >
            <Stack spacing={2} align="center">
              <AlertIcon size={8} mr={0} />
              <AlertTitle fontSize="lg" fontWeight={500}>
                {t('Successfully sent')}
              </AlertTitle>
            </Stack>
          </Alert>
          <Stack spacing={1}>
            <Stack spacing={1} py={2}>
              <Box color="muted">{t('Tx hash')}</Box>
              <Box wordBreak="break-all" fontWeight={500}>
                {hash}
              </Box>
            </Stack>
            <ExternalLink href={`https://scan.idena.io/transaction/${hash}`}>
              {t('Open in blockchain explorer')}
            </ExternalLink>
          </Stack>
        </Stack>
      </DialogBody>
      <DialogFooter>
        {url ? (
          <PrimaryButton
            onClick={() => {
              global.openExternal(url)
              props.onClose()
            }}
          >
            {t('Continue')}
          </PrimaryButton>
        ) : (
          // eslint-disable-next-line react/destructuring-assignment
          <PrimaryButton onClick={props.onClose}>{t('Close')}</PrimaryButton>
        )}
      </DialogFooter>
    </Dialog>
  )
}

export function DnaSendFailedDialog({
  error,
  url,
  onRetrySucceeded,
  onRetryFailed,
  ...props
}) {
  const {t} = useTranslation()
  return (
    <Dialog closeOnOverlayClick={false} closeOnEsc={false} {...props}>
      <DialogBody>
        <Stack spacing={5}>
          <Alert
            status="error"
            bg="red.010"
            borderRadius="lg"
            flexDirection="column"
            justifyContent="center"
            textAlign="center"
            minH={132}
          >
            <Stack align="center" spacing={1}>
              <AlertIcon name="delete" size={10} mr={0} />
              <Stack spacing={1}>
                <AlertTitle fontSize="lg" fontWeight={500}>
                  {t('Something went wrong')}
                </AlertTitle>
                <Text color="muted" wordBreak="break-all">
                  {error}
                </Text>
              </Stack>
            </Stack>
          </Alert>
        </Stack>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton
          onClick={async () => {
            const requestedUrl = new URL(url)
            await handleCallbackUrl(url, 'json', {
              // eslint-disable-next-line no-shadow
              onJson: ({success, error, url}) => {
                if (success) {
                  onRetrySucceeded({
                    hash: requestedUrl.searchParams.get('tx'),
                    url,
                  })
                } else {
                  onRetryFailed({
                    error:
                      error ??
                      t('{{url}} responded with an unknown format', {
                        url: requestedUrl.href,
                      }),
                    url,
                  })
                }
              },
            }).catch(error => {
              global.logger.error(error)
              onRetryFailed({
                error: error?.message,
                url,
              })
            })
          }}
        >
          {t('Retry')}
        </SecondaryButton>
        <PrimaryButton
          onClick={() => {
            props.onClose()
            global.openExternal(url)
          }}
        >
          {t('Open in browser')}
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
}
