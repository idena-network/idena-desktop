import React from 'react'
import PropTypes from 'prop-types'
import {Button, Box} from '../../../shared/components'
import Flex from '../../../shared/components/flex'

function ValidationActions({onReportAbuse, onSubmitAnswers, canSubmit}) {
  return (
    <Flex justify="space-between">
      <Flex>
        <Box>
          <Button>Abort</Button>
        </Box>
        <Box>
          <Button onClick={onReportAbuse}>Report abuse</Button>
        </Box>
      </Flex>
      <Flex>
        <Box>
          {canSubmit && (
            <Button onClick={onSubmitAnswers}>Submit answers</Button>
          )}
        </Box>
      </Flex>
    </Flex>
  )
}

ValidationActions.propTypes = {
  onReportAbuse: PropTypes.func,
  onSubmitAnswers: PropTypes.func,
  canSubmit: PropTypes.bool,
}

export default ValidationActions
