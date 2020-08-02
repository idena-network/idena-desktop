import React from 'react'
import {margin, padding, wordWrap} from 'polished'
import PropTypes from 'prop-types'
import QRCode from 'qrcode.react'
import {useTranslation} from 'react-i18next'
import {useColorMode} from '@chakra-ui/core'
import theme, {rem} from '../../../shared/theme'
import {Box, SubHeading, FormGroup, Field} from '../../../shared/components'

function ReceiveForm({address}) {
  const {t} = useTranslation()
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
          {t(`Receive DNA’s`)}
        </SubHeading>

        <Box
          css={{
            ...margin(rem(theme.spacings.medium24)),
            textAlign: 'center',
          }}
        >
          <QRCode value={address} style={{...margin(0, 'auto')}} />
        </Box>

        <FormGroup>
          <WideField
            label={t('Address')}
            defaultValue={address}
            disabled
            allowCopy
          />
        </FormGroup>
      </Box>
    </Box>
  )
}

const WideField = props => <Field {...props} style={{width: rem(296)}} />

ReceiveForm.propTypes = {
  address: PropTypes.string,
}

export default ReceiveForm
