import React from 'react'
import PropTypes from 'prop-types'
import {Figure} from '../atoms'

export const NetProfile = ({addr, balance}) => (
  <div>
    <Figure label="Address" value={addr} />
    <Figure label="Status" value="Validated" />
    <Figure label="Stake" value={balance.stake} postfix="DNA" />
    <Figure label="Balance" value={balance.balance} postfix="DNA" />
    <Figure label="Age" value="24 epochs" />
    <Figure label="Next validation" value={new Date().toLocaleString()} />
    <style jsx>{`
      div {
        background: rgb(245, 246, 247);
        border-radius: 4px;
        padding: 2em;
      }
    `}</style>
  </div>
)

NetProfile.propTypes = {
  addr: PropTypes.string.isRequired,
  balance: PropTypes.shape({stake: PropTypes.number, balance: PropTypes.number}).isRequired,
}

export default NetProfile
