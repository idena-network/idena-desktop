import React from 'react'
import PropTypes from 'prop-types'
import {rem, margin, border, padding} from 'polished'
import {Box, Button, SubHeading, Text} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'

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
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const shouldClose = last && !allowSubmit
  const shouldSubmit = last && allowSubmit
  const shouldNext = !last
  return (
    <Box>
      <Box>
        <Box my={rem(theme.spacings.medium32)}>
          <SubHeading>{title}</SubHeading>
          {desc && <Text color={theme.colors.muted}>{desc}</Text>}
        </Box>
        {children}
      </Box>
      <Flex
        justify="flex-end"
        css={{
          ...border('top', '1px', 'solid', theme.colors.gray2),
          ...margin(rem(40), rem(-80), 0),
          ...padding(rem(theme.spacings.small12), rem(theme.spacings.medium16)),
        }}
      >
        <Button
          variant="secondary"
          onClick={onPrev}
          css={margin(0, rem(theme.spacings.small8), 0)}
        >
          Previous step
        </Button>
        {shouldNext && <Button onClick={onNext}>Next step</Button>}
        {shouldClose && <Button onClick={onClose}>Close</Button>}
        {shouldSubmit && (
          <Button
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              await onSubmit()
              setIsSubmitting(false)
            }}
          >
            Submit
          </Button>
        )}
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
