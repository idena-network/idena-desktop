import React from 'react'
import Link from 'next/link'
// import PropTypes from 'prop-types'
import {AddIcon} from '../../shared/components'
import theme from '../../theme'

function ContactSearch() {
  return (
    <div>
      <input type="search" placeholder="Search" />
      <Link href="/contact-new">
        <AddIcon />
      </Link>
      <style jsx>{`
        div {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        input[type='search'] {
          background: ${theme.colors.gray};
          border: none;
          border-radius: 8px;
          font-size: 1em;
          margin-right: 1em;
          padding: 0.5em;
          text-align: center;
          flex: 1;
        }
      `}</style>
    </div>
  )
}

// ContactSearch.propTypes = {
//   onNewContact: PropTypes.func,
// }

export default ContactSearch
