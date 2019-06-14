import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem, wordWrap} from 'polished'
import {Box, Text} from '../../../shared/components'
import theme from '../../../shared/theme'

// eslint-disable-next-line react/prop-types
const WhiteText = ({css, ...props}) => (
  <Text
    color={theme.colors.white}
    css={{display: 'block', ...wordWrap('break-word'), ...css}}
    {...props}
  />
)

function WalletCard({address, balance}) {
  return (
    <Box
      bg={theme.colors.primary}
      padding={theme.spacings.large}
      css={{
        borderRadius: rem(10),
        ...margin(theme.spacings.normal, 0),
        maxWidth: '25%',
      }}
    >
      <WhiteText css={{...margin(0, 0, theme.spacings.normal)}}>
        {address}
      </WhiteText>
      <WhiteText>Balance</WhiteText>
      <WhiteText>{balance} DNA</WhiteText>
    </Box>
  )
}

WalletCard.propTypes = {
  address: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
}

export default WalletCard
