/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import PropTypes from 'prop-types'
import {rem} from '../../../shared/theme'
import WalletCard from './wallet-card'
import Flex from '../../../shared/components/flex'

function WalletList({
  wallets = [],
  activeWallet,
  onChangeActiveWallet,
  onSend,
  onReceive,
  onWithdrawStake,
}) {
  return (
    <div className="scroll">
      <div className="scroll-inner">
        <Flex>
          {wallets
            .filter(wallet => wallet.address)
            .map((wallet, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onChangeActiveWallet(wallet)
                }}
              >
                <WalletCard
                  wallet={wallet}
                  main={
                    wallet &&
                    activeWallet &&
                    wallet.address === activeWallet.address &&
                    wallet.isStake === activeWallet.isStake
                  }
                  onSend={onSend}
                  onReceive={onReceive}
                  onWithdrawStake={onWithdrawStake}
                />
              </div>
            ))}
        </Flex>
      </div>
      <style jsx>{`
        .scroll {
          overflow: hidden;
          width: 100%;
          min-height: ${rem(100)};
          margin-bottom: ${rem(30)};
        }

        .scroll-inner {
          overflow: hidden;
          overflow-x: auto;
          padding-bottom: 15px;
          height: calc(100% + 15px);
        }
      `}</style>
    </div>
  )
}

WalletList.propTypes = {
  wallets: PropTypes.arrayOf(PropTypes.shape(WalletCard.propTypes)),
  activeWallet: PropTypes.object,
  onChangeActiveWallet: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  onReceive: PropTypes.func.isRequired,
  onWithdrawStake: PropTypes.func.isRequired,
}

export default WalletList
