import React from 'react'
import PropTypes from 'prop-types'
import {UserInfo} from '../dashboard/user-info'
import ContactToolbar from './contact-toolbar'
import theme from '../../theme'
import {Figure} from '../atoms'

function ContactDetails({fullName, address, status, age}) {
  return (
    <div>
      <UserInfo fullName={fullName} address={address} />
      <ContactToolbar />
      <div>
        <Figure label="Status" value={status} />
        <Figure label="Age" value={age} postfix="epochs" />
        <Figure label="Address" value={address} />
      </div>
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
  fullName: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
}

export default ContactDetails
