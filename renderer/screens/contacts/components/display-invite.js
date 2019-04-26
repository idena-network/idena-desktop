import React from 'react'
import PropTypes from 'prop-types'
import {Box, SubHeading} from '../../../shared/components'
import Avatar from './contact-avatar'
import {Figure} from '../../../shared/components/utils'

function DisplayInvite({id, to, amount, fullName}) {
  return (
    <Box p="2em">
      <Avatar name={fullName} size={4} />
      <Box m="0 0 2em">
        <SubHeading css={{wordBreak: 'break-all'}}>{fullName}</SubHeading>
      </Box>
      <Figure label="txHash" value={id} />
      <Figure label="to" value={to} />
      <Figure label="amount" value={amount || 0} />
    </Box>
  )
}

DisplayInvite.propTypes = {
  id: PropTypes.string,
  to: PropTypes.string,
  amount: PropTypes.number,
  fullName: PropTypes.string,
}

export default DisplayInvite
