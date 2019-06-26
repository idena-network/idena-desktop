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
import {
  Box,
  SubHeading,
  Input,
  Label,
  FormGroup,
  Text,
} from '../../../shared/components'
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
          {fullName || receiver}
        </SubHeading>
        <Status mined={mined}>{mined ? 'Mined.' : 'Mining...'}</Status>
      </Box>
      <Flex justify="space-between">
        <FormGroup>
          <Label>First name</Label>
          <Input style={{width: rem(140)}} />
        </FormGroup>
        <FormGroup>
          <Label>Last name</Label>
          <Input style={{width: rem(140)}} />
        </FormGroup>
      </Flex>
      <Field label="Amount" value={amount} readonly={readonly}>
        <Hint label="Fee" value="0.999 DNA" />
        <Hint label="Total amount" value="1000.999 DNA" />
      </Field>
      <Field label="Invitation code" value={code} readonly={readonly} />
      <Field label="Transaction ID" value={hash} readonly={readonly} />
      <Field label="Receiver" value={receiver} readonly={readonly} />
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
function Field({label, value, readonly = false, children}) {
  return (
    <FormGroup>
      <Label style={margin(rem(theme.spacings.small8), 0)}>{label}</Label>
      <Input disabled={readonly} style={{width: rem(296)}} value={value} />
      {children}
    </FormGroup>
  )
}

// eslint-disable-next-line react/prop-types
function Hint({label, value}) {
  return (
    <Flex
      justify="space-between"
      align="center"
      css={margin(rem(theme.spacings.small8), 0)}
    >
      <Text color={theme.colors.muted}>{label}</Text>
      <Text>{value}</Text>
    </Flex>
  )
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

export default DisplayInvite
