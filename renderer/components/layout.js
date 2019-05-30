import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import SidebarNav from './nav'
import NetContext from '../shared/providers/net-provider'
import {Absolute, Box, Text} from '../shared/components'
import theme from '../shared/theme'
import {NotificationContext} from '../shared/providers/notification-provider'
import ValidationBanner from './validation-banner'
import {ValidationContext} from '../shared/providers/validation-provider'
import Notifications from './notifications'

function Layout({NavMenu = SidebarNav, children}) {
  const {currentPeriod} = useContext(NetContext)
  const {notifications, alerts} = useContext(NotificationContext)
  const {
    shortAnswers,
    longAnswers,
    intervals,
    validationTimer,
    setValidationTimer,
  } = useContext(ValidationContext)

  const validationRunning =
    currentPeriod === 'ShortSession' || currentPeriod === 'LongSession'
  const shortSessionRunning = currentPeriod === 'ShortSession'
  const longSessionRunning = currentPeriod === 'LongSession'

  return (
    <>
      <main>
        <NavMenu />
        <div>{children}</div>
      </main>
      <Absolute bottom={0} left={0} right={0}>
        {currentPeriod === 'FlipLottery' && (
          <Box bg={theme.colors.danger} p={theme.spacings.normal}>
            <Text color={theme.colors.white}>
              {`Validation starts in ${intervals.FlipLotteryDuration} min`}
            </Text>
          </Box>
        )}
        {validationRunning && (
          <ValidationBanner
            type={shortSessionRunning ? 'short' : 'long'}
            shouldValidate={
              (shortSessionRunning && !shortAnswers) ||
              (longSessionRunning && !longAnswers)
            }
            duration={validationTimer || intervals.ShortSessionDuration}
            onTick={setValidationTimer}
          />
        )}
      </Absolute>
      <Notifications notifications={notifications} alerts={alerts} />
      <style jsx>{`
        main {
          display: flex;
          height: 100%;
          padding: 0;
          margin: 0;
        }

        div {
          width: 100%;
        }
      `}</style>
    </>
  )
}

Layout.propTypes = {
  NavMenu: PropTypes.node,
  children: PropTypes.node,
}

export default Layout
