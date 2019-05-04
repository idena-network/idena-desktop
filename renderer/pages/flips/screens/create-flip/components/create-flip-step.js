import React from 'react'
import PropTypes from 'prop-types'
import {Box, Button, SubHeading} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import theme from '../../../../../shared/theme'

function CreateFlipStep({children, desc, onPrev, onNext, onSaveDraft}) {
  return (
    <Box>
      <Box p={theme.spacings.large}>
        <SubHeading>{desc}</SubHeading>
        {children}
      </Box>
      <Flex justify="space-between">
        <Button onClick={() => onSaveDraft({})}>Save as draft</Button>
        <Box>
          <Button onClick={onPrev}>Previous</Button>
          <Button onClick={onNext}>Next</Button>
        </Box>
      </Flex>
    </Box>
  )
}

CreateFlipStep.propTypes = {
  desc: PropTypes.string,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onSaveDraft: PropTypes.func.isRequired,
  children: PropTypes.node,
}

export default CreateFlipStep
