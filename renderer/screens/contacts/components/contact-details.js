import React from 'react'
import PropTypes from 'prop-types'
// eslint-disable-next-line import/no-named-as-default
import UserInfo from '../../dashboard/components/user-info'
import ContactToolbar from './contact-toolbar'
import theme from '../../../shared/theme'
import {Box, Link} from '../../../shared/components'
import {Figure} from '../../../shared/components/utils'

function ContactDetails({
  name,
  lastName,
  fullName = `${name} ${lastName}`,
  addr,
  status = 'Undefined',
  age = 0,
}) {
  return (
    <div>
      <section>
        <UserInfo fullName={fullName} address={addr} />
        <ContactToolbar />
        <div>
          <Figure label="Status" value={status} />
          <Figure label="Age" value={age} postfix="epochs" />
          <Figure label="Address" value={addr} />
        </div>
      </section>
      <section>
        <Box>
          <Link href={`/contacts/screens/contacts/edit?addr=${addr}`}>
            Edit
          </Link>
        </Box>
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
  name: PropTypes.string,
  lastName: PropTypes.string,
  fullName: PropTypes.string,
  addr: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
}

export default ContactDetails
