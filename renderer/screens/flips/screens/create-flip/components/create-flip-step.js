import React from 'react'
import PropTypes from 'prop-types'
import {Box, Button, SubHeading} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import theme from '../../../../../shared/theme'

function CreateFlipStep({children, desc, onPrev, onNext, last}) {
  return (
    <Box>
      <Box p={theme.spacings.large}>
        <SubHeading>{desc}</SubHeading>
        {children}
      </Box>
      <Flex justify="flex-end">
        <Box m={`0 ${theme.spacings.xsmall} 0 0`}>
          <Button onClick={onPrev}>Previous</Button>&nbsp;
        </Box>
        <Box>
          <Button onClick={onNext}>{last ? 'Submit flip' : 'Next'}</Button>
        </Box>
      </Flex>
    </Box>
  )
}

CreateFlipStep.propTypes = {
  desc: PropTypes.string,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  last: PropTypes.bool,
  children: PropTypes.node,
}

export default CreateFlipStep
