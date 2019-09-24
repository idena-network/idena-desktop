import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem} from 'polished'
import {FiCreditCard, FiLock} from 'react-icons/fi'
import {Box} from '../../../shared/components'
import theme from '../../../shared/theme'

function WalletCard({address, balance, main, lock}) {
  return (
    <Box
      bg={main ? theme.colors.primary : theme.colors.gray}
      color={main ? theme.colors.white : theme.colors.primary2}
      padding={rem(theme.spacings.medium16)}
      style={{
        borderRadius: rem(8),
        minWidth: rem(195),
        ...margin(0, theme.spacings.medium24, 0, 0),
      }}
      w={rem(195)}
    >
      <div className="title">
        <div className="icon">{lock ? <FiLock /> : <FiCreditCard />}</div>
        {address}
      </div>
      <div
        className="balance"
        style={{color: main ? theme.colors.white : theme.colors.muted}}
      >
        Balance
      </div>
      <div className="value">{balance} DNA</div>
      <style jsx>{`
        .title {
          margin-bottom: ${rem(17)};
          font-weight: 500;
        }
        .icon {
          display: inline-block;
          vertical-align: middle;
          margin: ${rem(1)} ${rem(10)} 0 0;
        }
        .value {
          word-wrap: break-word;
          font-size: ${rem(17)};
          line-height: ${rem(24)};
          font-weight: 500;
        }
      `}</style>
    </Box>
  )
}

WalletCard.propTypes = {
  main: PropTypes.bool,
  lock: PropTypes.bool,
  address: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
}

export default WalletCard
