import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import WalletCard from './wallet-card'
import Flex from '../../../shared/components/flex'

function WalletList({wallets = []}) {
  return (
    <div className="scroll">
      <div className="scroll-inner">
        <Flex>
          {wallets
            .filter(wallet => wallet.address)
            .map(({address, balance, isStake}) => (
              <WalletCard
                key={address + isStake}
                address={address}
                balance={balance}
                lock={isStake}
                main={!isStake}
              />
            ))}
        </Flex>
      </div>
      <style jsx>{`
        .scroll {
          overflow: hidden;
          width: 100%;
          height: 98px;
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
  wallets: PropTypes.arrayOf(PropTypes.shape(WalletCard.propTypes)).isRequired,
}

export default WalletList
