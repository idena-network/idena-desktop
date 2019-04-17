import React from 'react'
import PropTypes from 'prop-types'
import {UserInfo} from '../dashboard/user-info'
import ContactToolbar from './contact-toolbar'
import theme from '../../theme'
import {Figure} from '../atoms'
import {Box, Link} from '../../shared/components'

function ContactDetails({
  name,
  lastName,
  fullName = `${name} ${lastName}`,
  addr,
  status,
  age,
}) {
  return (
    <div>
      <UserInfo fullName={fullName} address={addr} />
      <ContactToolbar />
      <div>
        <Figure label="Status" value={status} />
        <Figure label="Age" value={age} postfix="epochs" />
        <Figure label="Address" value={addr} />
      </div>
      <Box>
        <Link href={`/contact-edit?addr=${addr}`}>Edit</Link>
      </Box>
      <style jsx>{`
        div {
          padding: 4em 3em;
        }
        div > div {
          background: ${theme.colors.gray};
          border-radius: 4px;
          padding: ${theme.spacings.xlarge};
        }
      `}</style>
    </div>
  )
}

ContactDetails.propTypes = {
  name: PropTypes.string,
  lastName: PropTypes.string,
  fullName: PropTypes.string,
  addr: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
}

export default ContactDetails
