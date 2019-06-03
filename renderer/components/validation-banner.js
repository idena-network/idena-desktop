import React, {useEffect} from 'react'
import PropTypes from 'prop-types'
import {Box, Fill, Link} from '../shared/components'
import Flex from '../shared/components/flex'
import theme from '../shared/theme'
import {capitalize} from '../shared/utils/string'
import useTimer from '../screens/validation/shared/utils/useTimer'

function ValidationBanner({shouldValidate, type, seconds, onTick}) {
  const {secondsLeft} = useTimer({seconds})

  useEffect(() => {
    if (onTick) {
      onTick(secondsLeft)
    }
  }, [onTick, secondsLeft])

  return (
    <Box bg={theme.colors.primary} css={{color: theme.colors.white}}>
      <Flex justify="space-between" align="center">
        <Flex>
          <Box p={theme.spacings.normal} css={{position: 'relative'}}>
            {secondsLeft} seconds left
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
        <Box p={theme.spacings.normal}>
          {shouldValidate && (
            <Link href={`/validation/${type}`} color={theme.colors.white}>
              Validate
            </Link>
          )}
        </Box>
      </Flex>
    </Box>
  )
}

ValidationBanner.propTypes = {
  shouldValidate: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(['short', 'long']).isRequired,
  seconds: PropTypes.number.isRequired,
  onTick: PropTypes.func,
}

export default ValidationBanner
