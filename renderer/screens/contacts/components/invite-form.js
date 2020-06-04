import React from 'react'
import PropTypes from 'prop-types'
import {wordWrap, margin, padding} from 'polished'
import {useTranslation} from 'react-i18next'
import {
  Box,
  Button,
  FormGroup,
  SubHeading,
  Field,
} from '../../../shared/components'
import Avatar from '../../../shared/components/avatar'
import theme, {rem} from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import useFullName from '../../../shared/hooks/use-full-name'

import useUsername from '../../../shared/hooks/use-username'

function RenameInvite({receiver, firstName, lastName, onSave}) {
  const {t} = useTranslation()

  const fullName = useFullName({firstName, lastName})

  const address = receiver
  const username = useUsername({address})

  const [newFirstName, setNewFirstName] = React.useState(firstName)
  const [newLastName, setNewLastName] = React.useState(lastName)

  return (
    <Box
      css={padding(rem(theme.spacings.medium32), rem(theme.spacings.medium32))}
    >
      <Box css={{textAlign: 'center'}}>
        <Avatar username={username} size={80} />
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
          {fullName || receiver}
        </SubHeading>
      </Box>

      <Flex justify="space-between">
        <NameField
          label={t('First name')}
          id="firstNameEidt"
          defaultValue={firstName}
          onChange={e => setNewFirstName(e.target.value)}
        />
        <NameField
          label={t('Last name')}
          id="lastNameEdit"
          defaultValue={lastName}
          onChange={e => setNewLastName(e.target.value)}
        />
      </Flex>

      <FormGroup css={margin(rem(theme.spacings.medium24), 0, 0)}>
        <Button onClick={() => onSave(newFirstName, newLastName)}>
          {t('Done')}
        </Button>
      </FormGroup>
    </Box>
  )
}

RenameInvite.propTypes = {
  receiver: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  onSave: PropTypes.func,
}

const NameField = props => <Field {...props} style={{width: rem(140)}} />

export default RenameInvite
