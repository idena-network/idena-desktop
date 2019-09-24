import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import {Box, Text} from '../../../shared/components'
import theme from '../../../shared/theme'

function TotalAmount({amount, percentChanges, amountChanges}) {
  return (
    <Box>
      <Box>
        <Text color={theme.colors.muted}>Total amount</Text>
      </Box>
      <Box>
        <Text fontSize={rem(24)}>
          <div className="value">{amount} DNA</div>
          <div className="changes">
            {percentChanges}% <span>({amountChanges} USD)</span>
          </div>
          <style jsx>{`
            .value {
              display: inline-block;
              font-weight: 500;
              line-height: 1.4;
            }
            .changes {
              display: inline-block;
              font-size: ${rem(18)};
              color: ${percentChanges < 0
                ? theme.colors.danger
                : theme.colors.success};
              margin-left: ${rem(8)};
            }
            .changes span {
              color: ${theme.colors.muted};
              margin-left: ${rem(6)};
            }
          `}</style>
        </Text>
      </Box>
    </Box>
  )
}

TotalAmount.propTypes = {
  amount: PropTypes.number.isRequired,
  percentChanges: PropTypes.number,
  amountChanges: PropTypes.number,
}

export default TotalAmount
