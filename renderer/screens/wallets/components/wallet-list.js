import React from 'react'
import PropTypes from 'prop-types'
import WalletCard from './wallet-card'
import Flex from '../../../shared/components/flex'
import {rem} from 'polished'

function WalletList({wallets = []}) {
  return (
    <div className="scroll">
      <div className="scroll-inner">
        <Flex>
          <WalletCard address="ffff" balance="dddd" main />
          <WalletCard address="ffff" balance="dddd" lock />
          <WalletCard address="ffff" balance="dddd" />

          {wallets.map(({address, balance}) => (
            <WalletCard key={address} address={address} balance={balance} />
          ))}
        </Flex>
      </div>
      <style jsx>{`
        .scroll {
          overflow: hidden;
          width: 100%;
          height: ${rem(180)};
        }

        .scroll-inner {
          overflow: auto;
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
