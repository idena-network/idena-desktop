import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import {Box, Fill, Link} from '../shared/components'
import Flex from '../shared/components/flex'
import theme from '../shared/theme'
import {useInterval} from '../screens/validation/shared/utils/useInterval'
import {capitalize} from '../shared/utils/string'
import {ValidationContext} from '../shared/providers/validation-provider'

function ValidationBanner({shouldValidate, type}) {
  const {validationTimer, setValidationTimer} = useContext(ValidationContext)

  useInterval(
    () => {
      setValidationTimer(validationTimer - 1)
    },
    validationTimer > 1 ? 1000 : null
  )

  return (
    <Box bg={theme.colors.primary} css={{color: theme.colors.white}}>
      <Flex justify="space-between" align="center">
        <Flex>
          <Box p={theme.spacings.normal} css={{position: 'relative'}}>
            {validationTimer} seconds left
            <Fill bg="rgba(0,0,0,0.1)" css={{display: 'none'}}>
              &nbsp;
            </Fill>
          </Box>
          <Box p={theme.spacings.normal}>
            {shouldValidate
              ? `${capitalize(type)} session running`
              : `Waiting for the end of ${type} session`}
          </Box>
        </Flex>
        {shouldValidate && (
          <Box p={theme.spacings.normal}>
            <Link href={`/validation/${type}`} color={theme.colors.white}>
              Validate
            </Link>
          </Box>
        )}
      </Flex>
    </Box>
  )
}

ValidationBanner.propTypes = {
  shouldValidate: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(['short', 'long']).isRequired,
}

export default ValidationBanner
