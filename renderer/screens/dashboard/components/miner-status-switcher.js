import React, {useState} from 'react'
import {
  Box,
  BlockHeading,
  FormGroup,
  Label,
  Switcher,
} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'

// eslint-disable-next-line react/prop-types
function MinerStatusSwitcher() {
  const [switcherActive, setSwitcherState] = useState(true)

  return (
    <Box m="0 0 24px 0">
      <FormGroup onClick={() => setSwitcherState(!switcherActive)}>
        <BlockHeading>Status</BlockHeading>
        <div className="form-control">
          <Flex align="center" justify="space-between">
            <Label htmlFor="switcher" style={{margin: 0, cursor: 'pointer'}}>
              Miner
            </Label>
            <Box>
              <Switcher withStatusHint checked={switcherActive} />
            </Box>
          </Flex>
        </div>
        <style jsx>{`
          .form-control {
            border: solid 1px ${theme.colors.gray2};
            color: ${theme.colors.input};
            background: ${theme.colors.white};
            border-radius: 6px;
            font-size: 1em;
            padding: 0.5em 1em 0.65em;
            cursor: pointer;
          }
        `}</style>
      </FormGroup>
    </Box>
  )
}

export default MinerStatusSwitcher
