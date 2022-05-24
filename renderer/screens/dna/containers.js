/* eslint-disable react/prop-types */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Icon,
  Image,
  Stack,
  Text,
} from '@chakra-ui/core'
import {Transaction, dnaToFloat, toHexString} from 'idena-sdk-js'
import {useIdentityState} from '../../shared/providers/identity-context'
import {SecondaryButton, PrimaryButton} from '../../shared/components/button'
import {
  DnaDialog,
  DnaDialogAlert,
  DnaDialogAlertText,
  DnaDialogAvatar,
  DnaDialogStat,
  DnaDialogStatLabel,
  DnaDialogStatValue,
  MediaDnaDialogStat,
  SimpleDnaDialogStat,
} from './components'
import {
  startSession,
  authenticate,
  signNonce,
  isValidUrl,
  sendDna,
  DNA_SEND_CONFIRM_TRESHOLD,
  appendTxHash,
  handleCallbackUrl,
} from './utils'
import {
  Dialog,
  DialogBody,
  DialogFooter,
  ExternalLink,
  Input,
  Tooltip,
  FormControlWithLabel,
} from '../../shared/components/components'
import {callRpc, toLocaleDna} from '../../shared/utils/utils'
import {bufferToHex} from '../../shared/utils/string'

export function DnaSignInDialog({
  token,
  authenticationEndpoint,
  nonceEndpoint,
  callbackUrl,
  faviconUrl,
  onSignInError,
  onClose,
  ...props
}) {
  const {t} = useTranslation()

  const initialRef = React.useRef()

  const {address} = useIdentityState()

  const callbackUrlObject = React.useMemo(() => new URL(callbackUrl), [
    callbackUrl,
  ])

  const callbackFaviconUrl = React.useMemo(
    () => faviconUrl || new URL('favicon.ico', callbackUrlObject.origin),
    [callbackUrlObject.origin, faviconUrl]
  )

  return (
    <DnaDialog
      initialFocusRef={initialRef}
      title={t('Login confirmation')}
      onClose={onClose}
      {...props}
    >
      <DialogBody>
        <Stack spacing={5}>
          <Text>
            {t(
              'Please confirm that you want to use your public address for the website login'
            )}
          </Text>
          <Stack spacing="px" borderRadius="lg" overflow="hidden">
            <MediaDnaDialogStat
              label={t('Website')}
              value={callbackUrlObject.hostname || callbackUrl}
            >
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
            </MediaDnaDialogStat>
            <MediaDnaDialogStat label={t('My address')} value={address}>
              <DnaDialogAvatar address={address} />
            </MediaDnaDialogStat>
            <SimpleDnaDialogStat label={t('Token')} value={token} />
          </Stack>
        </Stack>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose}>{t('Cancel')}</SecondaryButton>
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
                else onSignInError('Invalid callback URL')
              })
              .catch(({message}) => {
                global.logger.error(message)
                if (onSignInError) onSignInError(message)
              })
              .finally(onClose)
          }}
        >
          {t('Confirm')}
        </PrimaryButton>
      </DialogFooter>
    </DnaDialog>
  )
}

export function DnaSendDialog({
  address: to,
  amount,
  comment,
  callbackUrl,
  callbackFormat,
  onDepositSuccess,
  onDepositError,
  onSendTxFailed,
  onClose,
  ...props
}) {
  const {
    t,
    i18n: {language},
  } = useTranslation()

  const {address: from, balance} = useIdentityState()

  const shouldConfirmTx = React.useMemo(
    () => amount / balance > DNA_SEND_CONFIRM_TRESHOLD,
    [amount, balance]
  )

  const [confirmationAmount, setConfirmationAmount] = React.useState()

  const areSameAmounts = React.useMemo(() => +confirmationAmount === +amount, [
    amount,
    confirmationAmount,
  ])

  const isExceededBalance = React.useMemo(() => +amount > balance, [
    amount,
    balance,
  ])

  const [isSubmitting, setIsSubmitting] = React.useState()

  const dna = toLocaleDna(language)

  return (
    <DnaDialog title={t('Confirm transfer')} onClose={onClose} {...props}>
      <DialogBody>
        <Stack spacing={5}>
          <Text>
            {t(
              `You’re about to send iDNA from your wallet to the following address`
            )}
          </Text>
          <DnaDialogAlert>
            {t(`Attention! This is irreversible operation`)}
          </DnaDialogAlert>
          <Stack spacing="px" borderRadius="lg" overflow="hidden">
            <MediaDnaDialogStat label={t('To')} value={to}>
              <DnaDialogAvatar address={to} />
            </MediaDnaDialogStat>
            <DnaDialogStat>
              <DnaDialogStatLabel>{t('Amount')}</DnaDialogStatLabel>
              <DnaDialogStatValue
                color={isExceededBalance ? 'red.500' : 'brandGray.500'}
              >
                {isExceededBalance ? (
                  <Stack isInline spacing={1}>
                    <Text as="span">{dna(amount)}</Text>
                    <Tooltip
                      label={t('The amount is larger than your balance')}
                    >
                      <Icon name="exclamation-mark" size={4} color="red.500" />
                    </Tooltip>
                  </Stack>
                ) : (
                  dna(amount)
                )}
              </DnaDialogStatValue>
            </DnaDialogStat>
            <SimpleDnaDialogStat
              label={t('Available balance')}
              value={dna(balance)}
            />
            <SimpleDnaDialogStat label={t('Comment')} value={comment} />
          </Stack>
          {shouldConfirmTx && (
            <FormControlWithLabel label={t('Enter amount to confirm transfer')}>
              <Input
                isDisabled={isExceededBalance}
                value={confirmationAmount}
                onChange={e => setConfirmationAmount(e.target.value)}
              />
              {Number.isFinite(+confirmationAmount) && !areSameAmounts && (
                <DnaDialogAlertText>
                  {t('Entered amount does not match target amount')}
                </DnaDialogAlertText>
              )}
            </FormControlWithLabel>
          )}
        </Stack>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose}>{t('Cancel')}</SecondaryButton>
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
              .then(() =>
                callRpc('bcn_estimateTx', {
                  to,
                  from,
                  amount,
                  payload: bufferToHex(new TextEncoder().encode(comment)),
                })
              )
              .then(async ({txHash: hash}) => {
                if (isValidUrl(callbackUrl)) {
                  const callbackUrlWithHash = appendTxHash(callbackUrl, hash)

                  global.logger.info('Received dna://send cb url', callbackUrl)
                  global.logger.info(
                    'Append hash to cb url',
                    callbackUrlWithHash.href
                  )

                  await handleCallbackUrl(callbackUrlWithHash, callbackFormat, {
                    onJson: async ({success, error, url}) => {
                      if (success) {
                        await sendDna({from, to, amount, comment})
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
                    onHtml: ({url}) => {
                      sendDna({from, to, amount, comment}).then(() => {
                        onDepositSuccess({hash, url})
                      })
                    },
                  })
                    .catch(error => {
                      global.logger.error(error)
                      onDepositError({
                        error: error?.message,
                        url: callbackUrlWithHash.href,
                      })
                    })
                    .finally(() => setIsSubmitting(false))
                } else if (callbackUrl) {
                  setIsSubmitting(false)
                  global.logger.error('Invalid dna://send cb url', callbackUrl)
                } else {
                  await sendDna({from, to, amount, comment})
                  setIsSubmitting(false)
                  onDepositSuccess({hash})
                }
              })
              .catch(({message}) => {
                setIsSubmitting(false)
                global.logger.error(message)
                onSendTxFailed(message)
              })
              .finally(onClose)
          }}
        >
          {t('Confirm')}
        </PrimaryButton>
      </DialogFooter>
    </DnaDialog>
  )
}

export function DnaRawDialog({
  tx,
  callbackUrl,
  callbackFormat,
  onClose,
  onSendSuccess,
  onSendError,
  onSendRawTxFailed,
  ...props
}) {
  const {
    t,
    i18n: {language},
  } = useTranslation()

  const {address, balance} = useIdentityState()

  const {amount, to} = React.useMemo(() => {
    if (tx) {
      const {amount: txAmount, ...restTx} = new Transaction().fromHex(tx)
      return {amount: +txAmount / 10 ** 18, ...restTx}
    }
    return {amount: null, to: null}
  }, [tx])

  const [confirmationAmount, setConfirmationAmount] = React.useState()

  const shouldConfirmTx = React.useMemo(
    () => amount / balance > DNA_SEND_CONFIRM_TRESHOLD,
    [amount, balance]
  )

  const didConfirmAmount = React.useMemo(
    () => +confirmationAmount === +amount,
    [amount, confirmationAmount]
  )

  const isExceededBalance = React.useMemo(() => +amount > balance, [
    amount,
    balance,
  ])

  const [isSubmitting, setIsSubmitting] = React.useState()

  const dna = toLocaleDna(language)

  return (
    <DnaDialog title={t('Confirm transaction')} onClose={onClose} {...props}>
      <DialogBody>
        <Stack spacing={5}>
          <Text>{t('You’re about to sign and send tx from your wallet')}</Text>
          <DnaDialogAlert>
            {t('Attention! This is irreversible operation')}
          </DnaDialogAlert>
          <Stack spacing="px" borderRadius="lg" overflow="hidden">
            <MediaDnaDialogStat label={t('To')} value={to}>
              <DnaDialogAvatar address={to} />
            </MediaDnaDialogStat>
            <DnaDialogStat>
              <DnaDialogStatLabel>{t('Amount')}</DnaDialogStatLabel>
              <DnaDialogStatValue
                color={isExceededBalance ? 'red.500' : 'brandGray.500'}
              >
                {isExceededBalance ? (
                  <Stack isInline spacing={1}>
                    <Text as="span">{dna(amount)}</Text>
                    <Tooltip
                      label={t('The amount is larger than your balance')}
                    >
                      <Icon name="exclamation-mark" size={4} color="red.500" />
                    </Tooltip>
                  </Stack>
                ) : (
                  dna(amount)
                )}
              </DnaDialogStatValue>
            </DnaDialogStat>
            <SimpleDnaDialogStat
              label={t('Available balance')}
              value={dna(balance)}
            />
            <DnaDialogStat>
              <DnaDialogStatLabel>
                {t('Transaction details')}
              </DnaDialogStatLabel>
              <DnaDialogStatValue>
                <Tooltip label={tx} zIndex="tooltip" wordBreak="break-all">
                  <Text
                    display="-webkit-box"
                    overflow="hidden"
                    style={{
                      '-webkit-box-orient': 'vertical',
                      '-webkit-line-clamp': '2',
                    }}
                    wordBreak="break-all"
                  >
                    {tx}
                  </Text>
                </Tooltip>
              </DnaDialogStatValue>
            </DnaDialogStat>
          </Stack>
          {shouldConfirmTx && (
            <FormControlWithLabel label={t('Enter amount to confirm transfer')}>
              <Input
                isDisabled={isExceededBalance}
                value={confirmationAmount}
                onChange={e => setConfirmationAmount(e.target.value)}
              />
              {Number.isFinite(+confirmationAmount) && !didConfirmAmount && (
                <DnaDialogAlertText>
                  {t('Entered amount does not match target amount')}
                </DnaDialogAlertText>
              )}
            </FormControlWithLabel>
          )}
        </Stack>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose}>{t('Cancel')}</SecondaryButton>
        <PrimaryButton
          isDisabled={
            isExceededBalance || (shouldConfirmTx && !didConfirmAmount)
          }
          isLoading={isSubmitting}
          onClick={async () => {
            new Promise((resolve, reject) => {
              if (shouldConfirmTx) {
                return didConfirmAmount
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
              .then(() => {
                const decodedTx = new Transaction().fromHex(tx)

                return callRpc('dna_sendTransaction', {
                  type: decodedTx.type,
                  from: address,
                  to: decodedTx.to,
                  amount: dnaToFloat(decodedTx.amount),
                  maxFee: dnaToFloat(decodedTx.maxFee),
                  tips: dnaToFloat(decodedTx.tips),
                  nonce: decodedTx.nonce,
                  epoch: decodedTx.epoch,
                  payload: toHexString(decodedTx.payload),
                })
              })
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
                        onSendError({
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
              .finally(onClose)
          }}
        >
          {t('Confirm')}
        </PrimaryButton>
      </DialogFooter>
    </DnaDialog>
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
                    url: url ?? requestedUrl.href,
                  })
                } else {
                  onRetryFailed({
                    error:
                      error ??
                      t('{{url}} responded with an unknown format', {
                        url: requestedUrl.href,
                      }),
                    url: url ?? requestedUrl,
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
