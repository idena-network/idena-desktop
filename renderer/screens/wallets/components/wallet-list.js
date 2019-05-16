import React from 'react'
import PropTypes from 'prop-types'
import {margin} from 'polished'
import WalletCard from './wallet-card'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'

function WalletList({wallets = []}) {
  return (
    <Flex css={margin(theme.spacings.normal, 0)}>
      {wallets.map(({address, balance}) => (
        <WalletCard key={address} address={address} balance={balance} />
      ))}
    </Flex>
  )
}

WalletList.propTypes = {
  wallets: PropTypes.arrayOf(PropTypes.shape(WalletCard.propTypes)).isRequired,
}

export default WalletList
