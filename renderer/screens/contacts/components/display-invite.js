import React from 'react'
import PropTypes from 'prop-types'
import {
  wordWrap,
  margin,
  rem,
  padding,
  borderRadius,
  backgrounds,
} from 'polished'
import {Box, SubHeading, Text, Field, Hint} from '../../../shared/components'
import Avatar from '../../flips/shared/components/avatar'
import useFullName from '../shared/useFullName'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'

function DisplayInvite({
  hash,
  receiver,
  amount,
  mined,
  firstName,
  lastName,
  code,
}) {
  const fullName = useFullName({firstName, lastName})
  const readonly = mined
  return (
    <Box
      css={padding(rem(theme.spacings.large48), rem(theme.spacings.medium32))}
    >
      <Box css={{textAlign: 'center'}}>
        <Avatar username={receiver} size={80} />
      </Box>
      <Box
        css={{
          ...margin(theme.spacings.medium16, 0, theme.spacings.medium32),
          textAlign: 'center',
        }}
      >
        <SubHeading
          css={{...margin(0, 0, theme.spacings.small8), ...wordWrap()}}
        >
          Invite for {fullName || receiver}
        </SubHeading>
        <Status mined={mined}>{mined ? 'Mined.' : 'Mining...'}</Status>
      </Box>
      <Flex justify="space-between">
        <NameField label="First name" value={firstName} />
        <NameField label="Last name" value={lastName} />
      </Flex>
      <WideField label="Amount" value={amount} disabled={readonly}>
        <Hint label="Fee" value="0.999 DNA" />
        <Hint label="Total amount" value="1000.999 DNA" />
      </WideField>
      <WideField label="Invitation code" value={code} disabled={readonly} />
      <WideField label="Transaction ID" value={hash} disabled={readonly} />
      <WideField label="Receiver" value={receiver} disabled={readonly} />
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
          mined ? theme.colors.success012 : 'rgba(255, 163, 102, 0.12)'
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
