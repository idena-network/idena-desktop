import React from 'react'
import PropTypes from 'prop-types'
import {wordWrap, margin, padding, borderRadius, backgrounds} from 'polished'
import {useTranslation} from 'react-i18next'
import {Box, SubHeading, Text, Field, Hint} from '../../../shared/components'
import Avatar from '../../../shared/components/avatar'
import theme, {rem} from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import useFullName from '../../../shared/hooks/use-full-name'

function DisplayInvite({
  hash,
  receiver,
  amount,
  mined,
  firstName,
  lastName,
  code,
}) {
  const {t} = useTranslation()
  const fullName = useFullName({firstName, lastName})
  const readonly = mined
  return (
    <Box
      css={padding(rem(theme.spacings.medium32), rem(theme.spacings.medium32))}
    >
      <Box css={{textAlign: 'center'}}>
        <Avatar username={receiver} size={80} />
      </Box>
      <Box
        css={{
          ...margin(theme.spacings.medium16, 0, 0),
          textAlign: 'center',
        }}
      >
        <SubHeading
          css={{...margin(0, 0, theme.spacings.small8), ...wordWrap()}}
        >
          {t('Invite for')} {fullName || receiver}
        </SubHeading>
        <Status mined={mined}>{mined ? t('Mined.') : t('Mining...')}</Status>
      </Box>
      <Flex justify="space-between">
        <NameField label={t('First name')} defaultValue={firstName} />
        <NameField label={t('Last name')} defaultValue={lastName} />
      </Flex>
      <WideField label={t('Amount')} defaultValue={amount} disabled={readonly}>
        <Hint label={t('Fee')} value="0.999 iDNA" />
        <Hint label={t('Total amount')} value="1000.999 iDNA" />
      </WideField>
      <WideField
        label={t('Invitation code')}
        defaultValue={code}
        disabled={readonly}
        allowCopy
      />
      <WideField
        label={t('Transaction ID')}
        defaultValue={hash}
        disabled={readonly}
        allowCopy
      />
      <WideField
        label={t('Receiver')}
        defaultValue={receiver}
        disabled={readonly}
        allowCopy
      />
    </Box>
  )
}

DisplayInvite.propTypes = {
  hash: PropTypes.string,
  receiver: PropTypes.string,
  amount: PropTypes.number,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  mined: PropTypes.bool,
  code: PropTypes.string,
}

// eslint-disable-next-line react/prop-types
function Status({mined, ...props}) {
  return (
    <Text
      css={{
        ...backgrounds(
          mined ? theme.colors.success02 : 'rgba(255, 163, 102, 0.12)'
        ),
        ...borderRadius('top', rem(12)),
        ...borderRadius('bottom', rem(12)),
        color: mined ? 'rgb(15, 205, 110)' : 'rgb(255, 163, 102)',
        ...padding(rem(theme.spacings.small8)),
      }}
      {...props}
    />
  )
}

const NameField = props => <Field {...props} style={{width: rem(140)}} />
const WideField = props => <Field {...props} style={{width: rem(296)}} />

export default DisplayInvite
