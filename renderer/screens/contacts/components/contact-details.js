import React from 'react'
import PropTypes from 'prop-types'
import UserInfo from '../../dashboard/components/user-info'
import ContactToolbar from './contact-toolbar'
import theme from '../../../shared/theme'
import {Figure} from '../../../shared/components/utils'
import {
  mapToFriendlyStatus,
  useIdentityState,
} from '../../../shared/providers/identity-context'

function ContactDetails(props) {
  const identity = useIdentityState
  const {address, state, age} = identity
  return (
    <div>
      <section>
        <UserInfo {...identity} {...props} />
        <ContactToolbar />
        <div>
          {state && (
            <Figure label="Status" value={mapToFriendlyStatus(state)} />
          )}
          {Number.isFinite(age) && (
            <Figure label="Age" value={age} postfix="epochs" />
          )}
          <Figure label="Address" value={address} />
        </div>
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
}

export default ContactDetails
