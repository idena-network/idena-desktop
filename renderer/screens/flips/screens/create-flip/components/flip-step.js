import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import {Box, Button, SubHeading, Text} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import theme from '../../../../../shared/theme'

function FlipStep({
  children,
  title,
  desc,
  onPrev,
  onNext,
  onClose,
  onSubmit,
  last,
  allowSubmit,
}) {
  const shouldClose = last && !allowSubmit
  const shouldSubmit = last && allowSubmit
  const shouldNext = !last
  return (
    <Box>
      <Box>
        <Box my={rem(theme.spacings.medium24)}>
          <SubHeading>{title}</SubHeading>
          {desc && <Text color={theme.colors.muted}>{desc}</Text>}
        </Box>
        {children}
      </Box>
      <Flex justify="flex-end">
        <Box m={`0 ${theme.spacings.xsmall} 0 0`}>
          <Button onClick={onPrev}>Previous</Button>&nbsp;
        </Box>
        <Box>
          {shouldNext && <Button onClick={onNext}>Next</Button>}
          {shouldClose && <Button onClick={onClose}>Close</Button>}
          {shouldSubmit && <Button onClick={onSubmit}>Submit</Button>}
        </Box>
      </Flex>
    </Box>
  )
}

FlipStep.propTypes = {
  title: PropTypes.string.isRequired,
  desc: PropTypes.string,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  last: PropTypes.bool,
  children: PropTypes.node,
  allowSubmit: PropTypes.bool.isRequired,
}

export default FlipStep
