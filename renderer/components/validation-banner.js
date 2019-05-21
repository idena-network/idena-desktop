import React, {useState, useContext, useEffect} from 'react'
import PropTypes from 'prop-types'
import {Box, Fill, Link} from '../shared/components'
import Flex from '../shared/components/flex'
import theme from '../shared/theme'
import {useInterval} from '../screens/validation/shared/utils/useInterval'
import {ValidationContext} from '../shared/providers/validation-provider'

function ValidationBanner({shouldValidate, duration, type}) {
  const {timeLeft, onTick} = useContext(ValidationContext)
  const [secondsLeft, setSecondsLeft] = useState(timeLeft || duration * 60)

  useInterval(
    () => {
      setSecondsLeft(secondsLeft - 1)
    },
    secondsLeft > 0 ? 1000 : null
  )

  useEffect(() => {
    onTick(secondsLeft)
  }, [secondsLeft])

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
  duration: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['short', 'long']).isRequired,
}

export default ValidationBanner
