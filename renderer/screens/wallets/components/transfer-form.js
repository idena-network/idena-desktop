import React, {useEffect} from 'react'
import {margin, padding, wordWrap} from 'polished'
import PropTypes from 'prop-types'
import {FiLoader} from 'react-icons/fi'
import {useTranslation} from 'react-i18next'
import {useColorMode} from '@chakra-ui/core'
import theme, {rem} from '../../../shared/theme'
import {
  Box,
  SubHeading,
  FormGroup,
  Field,
  Button,
  Select,
} from '../../../shared/components'
import {useNotificationDispatch} from '../../../shared/providers/notification-context'
import {useWallets} from '../../../shared/hooks/use-wallets'

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

  const {addNotification, addError} = useNotificationDispatch()

  const {t} = useTranslation('error')

  const {colorMode} = useColorMode()

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
          color={theme.colors[colorMode].text}
        >
          {t(`translation:Send DNA’s`)}
        </SubHeading>

        <FormGroup>
          <Field label={t('translation:From')} select>
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
          <Field
            label={t('translation:To')}
            onChange={e => setTo(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Field
            label={t('translation:Amount, DNA')}
            type="number"
            onChange={e => setAmount(e.target.value)}
          />
        </FormGroup>
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

                if (error) {
                  addError({
                    title: t('error:Error while sending transaction'),
                    body: error.message,
                  })
                } else {
                  addNotification({
                    title: t('translation:Transaction sent'),
                    body: result,
                  })
                  if (onSuccess) onSuccess(result)
                }
              } catch (error) {
                setSubmitting(false)
                if (onFail) {
                  addError({
                    title: t('error:Something went wrong'),
                    body: error.message,
                  })
                  onFail(error)
                }
              }
            }}
          >
            {submitting ? <FiLoader /> : t('translation:Transfer')}
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
