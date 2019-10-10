import React from 'react'
import {useEffect} from 'react'
import {rem, margin, padding, wordWrap} from 'polished'
import PropTypes from 'prop-types'
import {FiLoader} from 'react-icons/fi'
import theme from '../../../shared/theme'
import {
  Box,
  SubHeading,
  FormGroup,
  Field,
  Button,
  Select,
} from '../../../shared/components'

import {useNotificationDispatch} from '../../../shared/providers/notification-context'
import useWallets from '../../../shared/utils/useWallets'

function TransferForm({onSuccess, onFail}) {
  const {wallets, sendTransaction} = useWallets()

  const selectWallets =
    wallets &&
    wallets.filter(wallet => !wallet.isStake).map(wallet => wallet.address)

  const [from, setFrom] = React.useState(
    selectWallets.length > 0 ? selectWallets[0] : null
  )

  useEffect(() => {
    if (!from) {
      setFrom(selectWallets.length > 0 ? selectWallets[0] : null)
    }
  }, [from, selectWallets])

  const [to, setTo] = React.useState()
  const [amount, setAmount] = React.useState()

  const [submitting, setSubmitting] = React.useState(false)

  // const {sendTransaction} = useWalletDispatch()
  const {addNotification, addError} = useNotificationDispatch()

  return (
    <Box
      css={padding(rem(theme.spacings.large48), rem(theme.spacings.medium32))}
    >
      <Box
        css={{
          ...margin(theme.spacings.medium16, 0, theme.spacings.medium32),
        }}
      >
        <SubHeading
          css={{...margin(0, 0, theme.spacings.small8), ...wordWrap()}}
        >
          Send DNA’s
        </SubHeading>

        <FormGroup>
          <Field label="From" select>
            <Select
              name="select"
              id=""
              options={selectWallets}
              value={selectWallets[0]}
              onChange={e => setFrom(e.target.value)}
              border="0"
            />
          </Field>
        </FormGroup>
        <FormGroup>
          <Field label="To" value={to} onChange={e => setTo(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Field
            label="Amount, DNA"
            value={amount}
            type="number"
            onChange={e => setAmount(e.target.value)}
          />
        </FormGroup>
        {/*
        <FormGroup>
          <Field label="Comment" value="" textarea />
        </FormGroup>
        */}
        <FormGroup
          css={margin(rem(theme.spacings.medium24), 0, 0)}
          className="text-right"
        >
          <Button
            disabled={submitting || !to || !from || !amount}
            onClick={async () => {
              try {
                setSubmitting(true)

                const {result, error} = await sendTransaction({
                  from,
                  to,
                  amount,
                })
                setSubmitting(false)

                alert(result)

                if (error) {
                  addError({
                    title: 'Error while sending transaction',
                    body: error.message,
                  })
                } else {
                  addNotification({
                    title: 'Transaction sent',
                    body: result,
                  })
                  if (onSuccess) onSuccess(result)
                }
              } catch (error) {
                setSubmitting(false)
                if (onFail) {
                  addError({
                    title: 'Something went wrong',
                    body: error.message,
                  })
                  onFail(error)
                }
              }
            }}
          >
            {submitting ? <FiLoader /> : 'Transfer'}
          </Button>
        </FormGroup>
      </Box>
    </Box>
  )
}

TransferForm.propTypes = {
  onSuccess: PropTypes.func,
  onFail: PropTypes.func,
}

export default TransferForm
