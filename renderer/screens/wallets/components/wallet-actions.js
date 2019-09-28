import React from 'react'
import PropTypes from 'prop-types'
import {rgba, rem} from 'polished'
import {FaLongArrowAltDown, FaLongArrowAltUp} from 'react-icons/fa'
import theme from '../../../shared/theme'

import {
  Table,
  TableCol,
  TableRow,
  TableHeaderCol,
} from '../../../shared/components/table'

function RowStatus({type, walletName, ...props}) {
  return (
    <div {...props} className="status">
      <div className="icon">
        {type === 'Sent' ? <FaLongArrowAltUp /> : <FaLongArrowAltDown />}
      </div>
      <div className="content">
        <div className="type">{type}</div>
        <div
          className="name"
          style={{
            color:
              walletName === 'Main' ? theme.colors.primary : theme.colors.muted,
          }}
        >
          {walletName}
        </div>
      </div>
      <style jsx>{`
        .icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          font-size: ${rem(22)};
          padding: ${rem(8)};
          text-align: center;
          float: left;
          margin-right: ${rem(12)};
          background-color: ${type === 'Sent'
            ? rgba(theme.colors.danger, 0.12)
            : rgba(theme.colors.primary, 0.12)};
          color: ${type === 'Sent'
            ? theme.colors.danger
            : theme.colors.primary};
        }
        .content {
          overflow: hidden;
          padding-top: ${rem(3)};
        }
        .name {
          font-size: ${rem(13)};
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

RowStatus.propTypes = {
  type: PropTypes.oneOf(['Sent', 'Received']),
  walletName: PropTypes.string,
}


function WalletTransfer() {
  return (
    <Table>
      <thead>
        <TableRow>
          <TableHeaderCol>Transaction</TableHeaderCol>
          <TableHeaderCol>Date</TableHeaderCol>
          <TableHeaderCol>USD value</TableHeaderCol>
          <TableHeaderCol>DNA value</TableHeaderCol>
        </TableRow>
      </thead>
      <tbody>
        <TableRow>
          <TableCol>
            <RowStatus type="Sent" walletName="Main" />
          </TableCol>
          <TableCol>24.03.2019, 16:42</TableCol>
          <TableCol>2,9914 USD</TableCol>
          <TableCol color={theme.colors.danger}>-200 DNA</TableCol>
        </TableRow>
        <TableRow>
          <TableCol>
            <RowStatus type="Received" walletName="Second" />
          </TableCol>
          <TableCol>24.03.2019, 16:42</TableCol>
          <TableCol>2,9914 USD</TableCol>
          <TableCol>+200 DNA</TableCol>
        </TableRow>
      </tbody>
    </Table>
  )
}

WalletTransfer.propTypes = {}

export default WalletTransfer
