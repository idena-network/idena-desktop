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
import {
  useIdentityState,
  useIdentityDispatch,
} from '../../../shared/providers/identity-context'

function KillForm({onSuccess, onFail}) {
  const {address, stake} = useIdentityState()
  const {killMe} = useIdentityDispatch()

  const [to, setTo] = React.useState(address)

  const [submitting, setSubmitting] = React.useState(false)

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
          Terminate identity
        </SubHeading>

        <FormGroup>
          <Field label="To" value={to} onChange={e => setTo(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Field
            disabled
            label="Withraw stake, DNA"
            value={stake}
            type="number"
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
            disabled={submitting || !to}
            onClick={async () => {
              try {
                setSubmitting(true)
                killMe(address)

                const {result, error} = await sendTransaction({
                  from,
                  to,
                  amount,
                })
                setSubmitting(false)

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

KillForm.propTypes = {
  onSuccess: PropTypes.func,
  onFail: PropTypes.func,
}

export default KillForm
