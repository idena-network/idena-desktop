import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem} from 'polished'
import {Button, Tooltip} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'

function ValidationActions({
  onReportAbuse,
  onSubmitAnswers,
  canSubmit,
  canAbuse,
  countdown,
}) {
  return (
    <Flex
      justify="space-between"
      css={{
        ...margin(rem(29), 0, theme.spacings.medium16),
      }}
    >
      <Flex justify="flex-start" css={{flex: 1}}>
        <Tooltip
          content={
            canAbuse
              ? 'Mark flip as inappropriate'
              : `Please wait while the flip is loading`
          }
          placement="top-left"
          pinned={!canAbuse}
        >
          <Button onClick={onReportAbuse} disabled={!canAbuse}>
            Report abuse
          </Button>
        </Tooltip>
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
  onReportAbuse: PropTypes.func,
  onSubmitAnswers: PropTypes.func,
  canSubmit: PropTypes.bool,
  canAbuse: PropTypes.bool,
  countdown: PropTypes.node,
}

export default ValidationActions
