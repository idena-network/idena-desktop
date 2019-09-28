import React from 'react'
import {rem} from 'polished'
import Flex from '../../../shared/components/flex'
import {Button, Input, Select} from '../../../shared/components'
import {Figure} from '../../../shared/components/utils'

function WalletTransfer() {
  return (
    <Flex css={{flexWrap: 'wrap'}}>
      <div style={{flexBasis: 0, flexGrow: 1, maxWidth: '100%'}}>
        <Figure label="Status" />
        <Select
          name="select"
          id="select"
          options={['Main', 'Second']}
          border="6px 0 0 6px"
        />
      </div>
      <div
        style={{flexBasis: 0, flexGrow: 1, maxWidth: '100%', margin: '0 -1px'}}
      >
        <Figure label="To" />
        <Select
          name="select"
          id="select"
          options={['Main', 'Second']}
          border="0"
        />
      </div>
      <div style={{flexBasis: 0, flexGrow: 1, maxWidth: '100%'}}>
        <Figure label="Amount, DNA" />
        <Input type="text" value="2,000" border="0 6px 6px 0" />
      </div>
      <div
        style={{
          flex: '0 0 auto',
          width: 'auto',
          maxWidth: '100%',
          marginLeft: rem(10),
        }}
      >
        <Figure label="&nbsp;" />
        <Button variant="secondary">Transfer</Button>
      </div>
    </Flex>
  )
}

WalletTransfer.propTypes = {}

export default WalletTransfer
