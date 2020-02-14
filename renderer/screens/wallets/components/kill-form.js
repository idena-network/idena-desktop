import React from 'react'
import {rem, margin, padding} from 'polished'
import PropTypes from 'prop-types'
import {FiLoader} from 'react-icons/fi'
import {useTranslation} from 'react-i18next'

import theme from '../../../shared/theme'
import {
  Box,
  Text,
  SubHeading,
  FormGroup,
  Field,
  Button,
} from '../../../shared/components'

import {useNotificationDispatch} from '../../../shared/providers/notification-context'
import Avatar from '../../../shared/components/avatar'
import {
  useIdentityState,
  useIdentityDispatch,
} from '../../../shared/providers/identity-context'

function KillForm({onSuccess, onFail}) {
  const {t} = useTranslation(['walets', 'error'])
  const {address, stake} = useIdentityState()
  const {killMe} = useIdentityDispatch()

  const [to, setTo] = React.useState()

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
        <Box css={{textAlign: 'center'}}>
          <Avatar username={address} size={80} />
        </Box>
        <Box
          css={{
            ...margin(theme.spacings.medium16, 0, theme.spacings.medium32),
            textAlign: 'center',
          }}
        >
          <SubHeading css={{...margin(0, 0, theme.spacings.small8)}}>
            {t('Terminate identity')}
          </SubHeading>
          <Text>
            {t(`Terminate your identity and withdraw the stake. Your identity status
            will be reset to 'Not validated'.`)}
          </Text>
        </Box>

        <FormGroup>
          <Field
            disabled
            label={t('Withraw stake, DNA')}
            value={stake}
            type="number"
          />
        </FormGroup>

        <FormGroup>
          <Field
            label={t('To address')}
            value={to}
            onChange={e => setTo(e.target.value)}
          />
        </FormGroup>

        <FormGroup
          css={margin(rem(theme.spacings.medium24), 0, 0)}
          className="text-right"
        >
          <Button
            disabled={submitting || !to}
            danger
            onClick={async () => {
              try {
                setSubmitting(true)

                const {result, error} = await killMe({to})
                setSubmitting(false)

                if (error) {
                  addError({
                    title: t('error:Error while sending transaction'),
                    body: error.message,
                  })
                } else {
                  addNotification({
                    title: t('error:Transaction sent'),
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
            {submitting ? <FiLoader /> : t('Terminate')}
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
