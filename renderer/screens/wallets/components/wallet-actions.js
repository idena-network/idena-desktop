import React from 'react'
import PropTypes from 'prop-types'
import {rgba, rem} from 'polished'
import theme from '../../../shared/theme'

import {
  Table,
  TableCol,
  TableRow,
  TableHeaderCol,
  TableHint,
} from '../../../shared/components/table'

function RowStatus({type, walletName, ...props}) {
  return (
    <div {...props} className="status">
      <div className="icn">
        {type === 'Sent' ? (
          <i className="icon icon--up_arrow" />
        ) : (
          <i className="icon icon--down_arrow" />
        )}
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
        .icn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
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
          font-weight: 500;
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
          <TableHeaderCol>Address</TableHeaderCol>
          <TableHeaderCol>Comment</TableHeaderCol>
          <TableHeaderCol>Date and time</TableHeaderCol>
          <TableHeaderCol className="text-right">DNA value</TableHeaderCol>
        </TableRow>
      </thead>
      <tbody>
        <TableRow>
          <TableCol>
            <RowStatus type="Sent" walletName="Main" />
          </TableCol>
          <TableCol>
            <div>To contact</div>
            <TableHint>Oxe67DE87789987998878888</TableHint>
          </TableCol>
          <TableCol>—</TableCol>
          <TableCol>24.03.2019, 16:42</TableCol>
          <TableCol className="text-right">
            <div style={{color: theme.colors.danger}}>-200 DNA</div>
            <TableHint>2,9914 USD</TableHint>
          </TableCol>
        </TableRow>
        <TableRow>
          <TableCol>
            <RowStatus type="Received" walletName="Second" />
          </TableCol>
          <TableCol>
            <div>To Friedhelm Hagen</div>
            <TableHint>0x5A3abB61A9c5475B8243</TableHint>
          </TableCol>
          <TableCol>New tires</TableCol>
          <TableCol>24.03.2019, 16:42</TableCol>
          <TableCol className="text-right">
            <div>+200 DNA</div>
            <TableHint>2,9914 USD</TableHint>
          </TableCol>
        </TableRow>
      </tbody>
    </Table>
  )
}

WalletTransfer.propTypes = {}

export default WalletTransfer
