import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {Box, Fill, Link} from '../shared/components'
import Flex from '../shared/components/flex'
import theme from '../shared/theme'
import {useInterval} from '../screens/validation/shared/utils/useInterval'

function ValidationBanner({shouldValidate, type, duration, onTick}) {
  const [secondsLeft, setSecondsLeft] = useState(duration)

  useInterval(
    () => {
      if (secondsLeft > 0) {
        setSecondsLeft(secondsLeft - 1)
      }
    },
    secondsLeft > 0 ? 1000 : null
  )

  useEffect(() => {
    onTick(secondsLeft)
  }, [onTick, secondsLeft])

  const [fl, ...letters] = type

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
              ? `${fl.toUpperCase().concat(...letters)} session running`
              : `Waiting for the end of validation session`}
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
  duration: PropTypes.number.isRequired,
  onTick: PropTypes.func,
}

export default ValidationBanner
