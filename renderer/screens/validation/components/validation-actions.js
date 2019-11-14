import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem} from 'polished'
import {Button} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'
import {
  useValidationState,
  useValidationDispatch,
  QUALIFICATION_REQUESTED,
} from '../../../shared/providers/validation-context'

function ValidationActions({onSubmitAnswers, countdown}) {
  const {canSubmit, stage} = useValidationState()
  const dispatch = useValidationDispatch()
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
        <Button
          onClick={() =>
            stage === 'long'
              ? dispatch({type: QUALIFICATION_REQUESTED})
              : onSubmitAnswers()
          }
          disabled={!canSubmit}
        >
          {stage === 'long' ? 'Next' : 'Submit answers'}
        </Button>
      </Flex>
    </Flex>
  )
}

ValidationActions.propTypes = {
  onSubmitAnswers: PropTypes.func,
  countdown: PropTypes.node,
}

export default ValidationActions
