import React from 'react'
import PropTypes from 'prop-types'
import {Box, Button, SubHeading, Text} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import theme from '../../../../../shared/theme'

function CreateFlipStep({
  children,
  desc,
  onPrev,
  onNext,
  onSaveDraft,
  last,
  lastSaved,
}) {
  return (
    <Box>
      <Box p={theme.spacings.large}>
        <SubHeading>{desc}</SubHeading>
        {children}
      </Box>
      <Flex justify="space-between">
        <Box>
          <Button onClick={onSaveDraft}>Save as draft</Button>
          {lastSaved && (
            <Text color={theme.colors.muted} fontSize={theme.fontSizes.small}>
              {` `} Last saved: {new Date(lastSaved).toLocaleString()}
            </Text>
          )}
        </Box>
        <Box>
          <Button onClick={onPrev}>Previous</Button>
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
  onSaveDraft: PropTypes.func,
  last: PropTypes.bool,
  lastSaved: PropTypes.number,
  children: PropTypes.node,
}

export default CreateFlipStep
