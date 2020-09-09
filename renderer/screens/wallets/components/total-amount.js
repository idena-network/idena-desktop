import React from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {Box, Text, SubHeading} from '../../../shared/components'
import theme, {rem} from '../../../shared/theme'

function TotalAmount({amount, percentChanges}) {
  const {t} = useTranslation()
  return (
    <Box>
      <Box>
        <Text color={theme.colors.muted}>{t('Total amount')}</Text>
      </Box>
      <Box>
        <SubHeading>
          <div className="value">{amount} iDNA</div>

          <style jsx>{`
            .value {
              font-weight: 500;
              line-height: 1.4;
            }
            .changes {
              font-weight: 500;
              color: ${percentChanges < 0 ? theme.colors.danger : 'inherit'};
            }
            .changes span {
              color: ${theme.colors.muted};
              margin-left: ${rem(6)};
              font-weight: normal;
            }
          `}</style>
        </SubHeading>
      </Box>
    </Box>
  )
}

TotalAmount.propTypes = {
  amount: PropTypes.number,
  percentChanges: PropTypes.number,
}

export default TotalAmount
