/* eslint-disable react/prop-types */
import React from 'react'
import {margin, padding} from 'polished'
import {useTranslation} from 'react-i18next'
import Modal from './modal'
import Box from './box'
import {SubHeading, Text} from './typo'
import theme, {rem} from '../theme'
import {Figure} from './utils'
import {useIdentityState} from '../providers/identity-context'
import Flex from './flex'
import Button from './button'
import {
  startSession,
  authenticate,
  signNonce,
  isValidUrl,
  parseQuery,
  sendDna,
  DNA_SEND_CONFIRM_TRESHOLD,
  AlertText,
} from '../utils/dna-link'
import {Input, FormGroup, Label} from './form'

export function DnaSignInDialog({url, onHide, onSigninError}) {
  const {t} = useTranslation()
  const {address} = useIdentityState()

  const {
    callback_url: callbackUrl,
    token,
    nonce_endpoint: nonceEndpoint,
    authentication_endpoint: authenticationEndpoint,
  } = parseQuery(url)

  return (
    <DnaDialog show={Boolean(url)} onHide={onHide}>
      <DnaDialogTitle>Login confirmation</DnaDialogTitle>
      <DnaDialogSubtitle>
        {t(
          'Please confirm that you want to use your public address for the website login'
        )}
      </DnaDialogSubtitle>
      <DnaDialogBody>
        <DnaDialogDetails>
          <Figure label={t('Website')} value={callbackUrl} />
          <Figure label={t('Address')} value={address} />
          <Figure label={t('Token')} value={token} />
        </DnaDialogDetails>
      </DnaDialogBody>
      <DnaDialogFooter>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
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
          Proceed to{' '}
          {isValidUrl(callbackUrl)
            ? new URL(callbackUrl).hostname
            : callbackUrl}
        </Button>
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

  const {address: to, amount, comment} = parseQuery(url)

  const shouldConfirmTx = amount / balance > DNA_SEND_CONFIRM_TRESHOLD

  const [confirmAmount, setConfirmAmount] = React.useState()

  const areSameAmounts = +confirmAmount === +amount
  console.log(confirmAmount, Number.isFinite(+confirmAmount), areSameAmounts)

  return (
    <DnaDialog show={Boolean(url)} onHide={onHide} {...props}>
      <DnaDialogTitle>Confirm transfer</DnaDialogTitle>
      <DnaDialogSubtitle>
        {t(
          `You’re about to send DNA from your wallet to the following address`
        )}
      </DnaDialogSubtitle>
      <DnaDialogBody>
        <DnaDialogDetails>
          <Figure label={t('To')} value={to} />
          <Figure label={t('Amount')} value={amount} />
          <Figure label={t('Comment')} value={comment} />
        </DnaDialogDetails>
        {shouldConfirmTx && (
          <FormGroup style={{...margin(rem(16), 0, 0)}}>
            <Label>{t('Enter amount to confirm transfer')}</Label>
            <Input
              value={confirmAmount}
              onChange={e => setConfirmAmount(e.target.value)}
            />
            {Number.isFinite(+confirmAmount) && !areSameAmounts && (
              <AlertText>Entered amount do not match target amount</AlertText>
            )}
          </FormGroup>
        )}
      </DnaDialogBody>
      <DnaDialogFooter>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          disabled={shouldConfirmTx && !areSameAmounts}
          onClick={async () => {
            new Promise((resolve, reject) => {
              if (shouldConfirmTx) {
                return areSameAmounts
                  ? reject(
                      new Error('Entered amount do not match target amount')
                    )
                  : resolve()
              }
              return resolve()
            })
              .then(() => sendDna({from, to, amount, comment}))
              .then(onDepositSuccess)
              .catch(({message}) => {
                global.logger.error(message)
                if (onDepositError) onDepositError(message)
              })
              .finally(onHide)
          }}
        >
          Confirm
        </Button>
      </DnaDialogFooter>
      <AlertText textAlign="right">
        Attention! This is irreversible operation
      </AlertText>
    </DnaDialog>
  )
}

function DnaDialog(props) {
  return <Modal width={360} {...props}></Modal>
}

function DnaDialogTitle(props) {
  return <SubHeading css={{...margin(0, 0, rem(8))}} {...props} />
}

function DnaDialogSubtitle(props) {
  return (
    <Text
      css={{
        display: 'inline-block',
        ...margin(0, 0, rem(20)),
      }}
      {...props}
    />
  )
}

function DnaDialogBody(props) {
  return <Box style={{...margin(0, 0, rem(24))}} {...props} />
}

function DnaDialogDetails(props) {
  return (
    <Box
      bg={theme.colors.gray}
      css={{
        borderRadius: rem(8),
        ...padding(rem(16), rem(20)),
      }}
      {...props}
    />
  )
}

function DnaDialogFooter({children, ...props}) {
  return (
    <Flex align="center" justify="flex-end" {...props}>
      {React.Children.map(children, (child, idx) =>
        idx === React.Children.count(children) - 1
          ? child
          : React.cloneElement(child, {
              style: {...child.props.style, marginRight: rem(8)},
            })
      )}
    </Flex>
  )
}
