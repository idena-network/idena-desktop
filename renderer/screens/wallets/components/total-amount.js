import React from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useColorMode} from '@chakra-ui/core'
import {Box, Text, SubHeading} from '../../../shared/components'
import theme, {rem} from '../../../shared/theme'

function TotalAmount({amount, percentChanges, amountChanges}) {
  const {t} = useTranslation()
  const {colorMode} = useColorMode()
  return (
    <Box>
      <Box>
        <Text color={theme.colors.muted}>{t('Total amount')}</Text>
      </Box>
      <Box>
        <SubHeading>
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
              color: ${theme.colors[colorMode].text};
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
  amountChanges: PropTypes.number,
}

export default TotalAmount
