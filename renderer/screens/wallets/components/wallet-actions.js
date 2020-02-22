import React from 'react'
import PropTypes from 'prop-types'
import {ellipsis, rgba, rem} from 'polished'
import {useTranslation} from 'react-i18next'
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

function RowStatus({direction, type, isMining, walletName, ...props}) {
  const txColor =
    direction === 'Sent' ? theme.colors.danger : theme.colors.primary

  const iconColor = isMining ? theme.colors.muted : txColor

  return (
    <div {...props} className="status">
      <div className="icn">
        {direction === 'Sent' ? (
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
              walletName === 'Main123' // TODO multiple wallets support
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
  direction: PropTypes.oneOf(['Sent', 'Received']),
  type: PropTypes.string,
  isMining: PropTypes.bool,
  walletName: PropTypes.string,
}

function WalletTransfer() {
  const {transactions, txFetching} = useWallets()
  const {t} = useTranslation('error')

  return (
    <div>
      <Table>
        <thead>
          <TableRow>
            <TableHeaderCol>{t('translation:Transaction')}</TableHeaderCol>
            <TableHeaderCol>{t('translation:Address')}</TableHeaderCol>
            <TableHeaderCol className="text-right">
              {t('translation:Amount, DNA')}
            </TableHeaderCol>
            <TableHeaderCol className="text-right">
              {t('translation:Fee, DNA')}
            </TableHeaderCol>
            <TableHeaderCol>{t('translation:Date')}</TableHeaderCol>
            <TableHeaderCol>
              {t('translation:Blockchain transaction ID')}
            </TableHeaderCol>
          </TableRow>
        </thead>
        <tbody>
          {transactions &&
            transactions.length > 0 &&
            transactions.map((tx, k) => (
              <TableRow key={k}>
                <TableCol>
                  <RowStatus
                    isMining={tx.isMining}
                    direction={tx.direction}
                    type={tx.typeName}
                    walletName={tx.wallet && tx.wallet.name}
                  />
                </TableCol>

                <TableCol>
                  {(!tx.to && '\u2013') || (
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
                        <TableHint style={{...ellipsis(rem(130))}}>
                          {tx.counterParty}
                        </TableHint>
                      </div>
                    </Flex>
                  )}
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
                    {(tx.type === 'kill' && 'See in Explorer...') ||
                      (tx.amount === '0' ? '\u2013' : tx.signAmount)}
                  </div>
                </TableCol>

                <TableCol className="text-right">
                  {((!tx.isMining || tx.maxFee === '0') &&
                    (tx.usedFee === '0' ? '\u2013' : tx.usedFee)) || (
                    <div>
                      <div> {tx.maxFee} </div>
                      <TableHint>{t('Fee limit')}</TableHint>
                    </div>
                  )}

                  {}
                </TableCol>
                <TableCol>
                  {!tx.timestamp
                    ? '\u2013'
                    : new Date(tx.timestamp * 1000).toLocaleString()}
                </TableCol>

                <TableCol>
                  {(tx.isMining && 'Mining...') || (
                    <div>
                      <div> {t('Confirmed')}</div>
                      <TableHint style={{...ellipsis(rem(130))}}>
                        {tx.isMining ? '' : tx.hash}
                      </TableHint>
                    </div>
                  )}
                </TableCol>
              </TableRow>
            ))}
        </tbody>
      </Table>
      {transactions && transactions.length === 0 && (
        <div
          style={{
            color: theme.colors.muted,
            textAlign: 'center',
            lineHeight: '40vh',
          }}
        >
          {txFetching ? '' : t(`You don't have any transactions yet`)}
        </div>
      )}
    </div>
  )
}

export default WalletTransfer
