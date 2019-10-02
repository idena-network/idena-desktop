import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem} from 'polished'
import {Button} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'

function ValidationActions({onSubmitAnswers, canSubmit, countdown}) {
  return (
    <Flex
      justify="space-between"
      css={{
        ...margin(rem(29), 0, theme.spacings.medium16),
      }}
    >
      <Flex justify="flex-start" css={{flex: 1}}>
        &nbsp;
      </Flex>
      <Flex justify="center" css={{width: '33%'}}>
        {countdown}
      </Flex>
      <Flex justify="flex-end" css={{flex: 1}}>
        {
          <Button onClick={onSubmitAnswers} disabled={!canSubmit}>
            Submit answers
          </Button>
        }
      </Flex>
    </Flex>
  )
}

ValidationActions.propTypes = {
  onSubmitAnswers: PropTypes.func,
  canSubmit: PropTypes.bool,
  countdown: PropTypes.node,
}

export default ValidationActions
