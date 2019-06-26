import React from 'react'
import PropTypes from 'prop-types'
import UserInfo from '../../dashboard/components/user-info'
import ContactToolbar from './contact-toolbar'
import theme from '../../../shared/theme'
import {Box} from '../../../shared/components'
import {Figure} from '../../../shared/components/utils'

function ContactDetails(props) {
  const {address, status, age} = props
  return (
    <div>
      <section>
        <UserInfo {...props} />
        <ContactToolbar />
        <div>
          <Figure label="Status" value={status} />
          <Figure label="Age" value={age} postfix="epochs" />
          <Figure label="Address" value={address} />
        </div>
      </section>
      <section>
        <Box>Edit</Box>
      </section>
      <style jsx>{`
        div {
          padding: 3em;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        section > div {
          background: ${theme.colors.gray};
          border-radius: 4px;
          padding: ${theme.spacings.xlarge};
        }
        div > section:nth-child(2) {
          display: flex;
          align-items: flex-end;
          flex: 1;
        }
      `}</style>
    </div>
  )
}

ContactDetails.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  address: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
}

export default ContactDetails
