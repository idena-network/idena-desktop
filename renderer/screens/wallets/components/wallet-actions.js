import React from 'react'
import PropTypes from 'prop-types'
import {ellipsis, rgba, rem} from 'polished'
import theme from '../../../shared/theme'
import useWallets from '../../../shared/utils/useWallets'
import Avatar from '../../../shared/components/avatar'
import Flex from '../../../shared/components/flex'

import {
  Table,
  TableCol,
  TableRow,
  TableHeaderCol,
  TableHint,
} from '../../../shared/components/table'

function RowStatus({type, isMining, walletName, ...props}) {
  const txColor = type === 'Sent' ? theme.colors.danger : theme.colors.primary

  const iconColor = isMining ? theme.colors.muted : txColor

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
              walletName === 'Main123'
                ? theme.colors.primary
                : theme.colors.muted,
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
          background-color: ${rgba(iconColor, 0.12)};
          color: ${iconColor};
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
  isMining: PropTypes.bool,
  walletName: PropTypes.string,
}

function WalletTransfer() {
  const {transactions} = useWallets()

  return (
    <Table>
      <thead>
        <TableRow>
          <TableHeaderCol>Transaction</TableHeaderCol>
          <TableHeaderCol>Address</TableHeaderCol>
          <TableHeaderCol className="text-right">Amount, DNA</TableHeaderCol>
          <TableHeaderCol className="text-right">Fee, DNA</TableHeaderCol>
          <TableHeaderCol>Date</TableHeaderCol>
          <TableHeaderCol>Blockchain transaction ID</TableHeaderCol>
        </TableRow>
      </thead>
      <tbody>
        {transactions &&
          transactions
            .filter(tx => tx.type === 'send')
            .map(tx => (
              <TableRow>
                <TableCol>
                  <RowStatus
                    isMining={tx.isMining}
                    type={tx.direction}
                    walletName={tx.wallet && tx.wallet.name}
                  />
                </TableCol>

                <TableCol>
                  <Flex align="center">
                    <Avatar username={tx.counterParty} size={32} />
                    <div>
                      <div>
                        {` ${tx.direction === 'Sent' ? 'To ' : 'From '}
                        ${
                          tx.counterPartyWallet
                            ? `wallet ${tx.counterPartyWallet.name}`
                            : 'address'
                        } 
                         `}
                      </div>
                      <TableHint>{tx.counterParty}</TableHint>
                    </div>
                  </Flex>
                </TableCol>

                <TableCol className="text-right">
                  <div
                    style={{
                      color:
                        tx.signAmount < 0
                          ? theme.colors.danger
                          : theme.colors.text,
                    }}
                  >
                    {tx.signAmount}
                  </div>
                </TableCol>

                <TableCol className="text-right">{tx.fee}</TableCol>
                <TableCol>
                  {tx.timeStamp && new Date(tx.timeStamp).toLocaleString()}
                </TableCol>

                <TableCol>
                  <div> {tx.isMining ? 'Mining...' : 'Confirmed'}</div>
                  <TableHint style={{...ellipsis(rem(190))}}>
                    {tx.isMining ? '' : tx.blockHash}
                  </TableHint>
                </TableCol>
              </TableRow>
            ))}
      </tbody>
    </Table>
  )
}

WalletTransfer.propTypes = {}

export default WalletTransfer
