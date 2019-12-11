import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import {useTranslation} from 'react-i18next'
import {Box, Text} from '../../../shared/components'
import theme from '../../../shared/theme'

function TotalAmount({amount, percentChanges, amountChanges}) {
  const {t} = useTranslation()
  return (
    <Box>
      <Box>
        <Text color={theme.colors.muted}>{t('Total amount')}</Text>
      </Box>
      <Box>
        <Text fontSize={rem(24)}>
          <div className="value">{amount} DNA</div>
          {false && ( // TODO: show wallet changes
            <div className="changes">
              {percentChanges}% <span>({amountChanges} USD)</span>
            </div>
          )}
          <style jsx>{`
            .value {
              font-weight: 500;
              line-height: 1.4;
            }
            .changes {
              font-weight: 500;
              font-size: ${rem(18)};
              color: ${percentChanges < 0 ? theme.colors.danger : 'inherit'};
            }
            .changes span {
              color: ${theme.colors.muted};
              margin-left: ${rem(6)};
              font-weight: normal;
            }
          `}</style>
        </Text>
      </Box>
    </Box>
  )
}

TotalAmount.propTypes = {
  amount: PropTypes.number,
  percentChanges: PropTypes.number,
  amountChanges: PropTypes.number,
}

export default TotalAmount
