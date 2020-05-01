/* eslint-disable react/prop-types */
import React from 'react'
import {margin, padding, backgrounds, borderRadius, border} from 'polished'
import {useTranslation} from 'react-i18next'
import Modal from './modal'
import Box from './box'
import {SubHeading, Text} from './typo'
import theme, {rem} from '../theme'
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
import Avatar from './avatar'

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
          <DnaDialogPanel>
            <Flex align="center" justify="space-between">
              <Box>
                <DnaDialogPanelLabel>{t('Website')}</DnaDialogPanelLabel>
                <DnaDialogPanelValue>{callbackUrl}</DnaDialogPanelValue>
              </Box>
              <img
                src={`${callbackUrl}/favicon.ico`}
                alt={`${callbackUrl} favicon`}
                style={{
                  borderRadius: rem(6),
                  height: rem(40),
                  width: rem(40),
                  ...margin(0, 0, 0, rem(16)),
                }}
              />
            </Flex>
          </DnaDialogPanel>
          <DnaDialogPanelDivider />
          <DnaDialogPanel>
            <Flex align="center" justify="space-between">
              <Box>
                <DnaDialogPanelLabel>{t('Address')}</DnaDialogPanelLabel>
                <DnaDialogPanelValue>{address}</DnaDialogPanelValue>
              </Box>
              <Address address={address} />
            </Flex>
          </DnaDialogPanel>
          <DnaDialogPanelDivider />
          <DnaDialogPanel label={t('Token')} value={token} />
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
          <DnaDialogPanel>
            <PanelRow>
              <Box>
                <DnaDialogPanelLabel>{t('To')}</DnaDialogPanelLabel>
                <DnaDialogPanelValue>{to}</DnaDialogPanelValue>
              </Box>
              <Address address={to} />
            </PanelRow>
          </DnaDialogPanel>
          <DnaDialogPanelDivider />
          <DnaDialogPanel label={t('Amount')} value={amount} />
          <DnaDialogPanelDivider />
          <DnaDialogPanel label={t('Comment')} value={comment} />
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
                  ? resolve()
                  : reject(
                      new Error('Entered amount do not match target amount')
                    )
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
  return (
    <Text color={theme.colors.muted} css={{lineHeight: rem(18)}} {...props} />
  )
}

function DnaDialogPanelValue(props) {
  return <Box css={{lineHeight: rem(18), wordBreak: 'break-all'}} {...props} />
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

function Address({address}) {
  return (
    <Avatar
      username={address}
      size={40}
      style={{
        ...backgrounds(theme.colors.white),
        ...borderRadius('top', rem(6)),
        ...borderRadius('bottom', rem(6)),
        border: `solid 1px ${theme.colors.gray2}`,
        ...margin(0, 0, 0, rem(16)),
      }}
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
