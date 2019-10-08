import React from 'react'
import {rem, margin, padding, wordWrap} from 'polished'
import PropTypes from 'prop-types'
import theme from '../../../shared/theme'
import {
  Box,
  SubHeading,
  FormGroup,
  Field,
  Button,
  Select,
} from '../../../shared/components'

function TransferForm({wallets}) {
  return (
    <Box
      css={padding(rem(theme.spacings.large48), rem(theme.spacings.medium32))}
    >
      <Box
        css={{
          ...margin(theme.spacings.medium16, 0, theme.spacings.medium32),
        }}
      >
        <SubHeading
          css={{...margin(0, 0, theme.spacings.small8), ...wordWrap()}}
        >
          Transfer DNA’s
        </SubHeading>

        <FormGroup>
          <Field label="From" select>
            <Select
              name="select"
              id="select"
              options={
                wallets &&
                wallets
                  .filter(wallet => !wallet.isStake)
                  .map(wallet => wallet.address)
              }
              border="0"
            />
          </Field>
        </FormGroup>
        <FormGroup>
          <Field label="To" value="" />
        </FormGroup>
        <FormGroup>
          <Field label="Amount, DNA" value="" />
        </FormGroup>
        <FormGroup>
          <Field label="Comment" value="" textarea />
        </FormGroup>
        <FormGroup
          css={margin(rem(theme.spacings.medium24), 0, 0)}
          className="text-right"
        >
          <Button>Transfer</Button>
        </FormGroup>
      </Box>
    </Box>
  )
}

TransferForm.propTypes = {
  wallets: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default TransferForm
