import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'next/router'
import SidebarNav from './nav'
import NetContext from '../shared/providers/net-provider'
import {Absolute, Box, Text} from '../shared/components'
import theme from '../shared/theme'
import {NotificationContext} from '../shared/providers/notification-provider'
import ValidationBanner from './validation-banner'
import {ValidationContext} from '../shared/providers/validation-provider'
import Notifications from './notifications'
import {
  sessionRunning,
  flipLotteryRunning,
  shortSessionRunning,
  longSessionRunning,
} from '../shared/utils/validation'

function Layout({NavMenu = SidebarNav, router, children}) {
  const {currentPeriod} = useContext(NetContext)
  const {notifications, alerts} = useContext(NotificationContext)
  const {shortAnswers, longAnswers, intervals} = useContext(ValidationContext)

  return (
    <>
      <main>
        <NavMenu />
        <div>{children}</div>
      </main>
      <Absolute bottom={0} left={0} right={0}>
        {flipLotteryRunning(currentPeriod) && (
          <Box bg={theme.colors.danger} p={theme.spacings.normal}>
            <Text color={theme.colors.white}>
              {`Validation starts in ${Math.round(
                intervals.FlipLotteryDuration / 60
              )} min`}
            </Text>
          </Box>
        )}
        {!router.pathname.startsWith('/validation') &&
          sessionRunning(currentPeriod) && (
            <ValidationBanner
              type={shortSessionRunning(currentPeriod) ? 'short' : 'long'}
              shouldValidate={
                (shortSessionRunning(currentPeriod) && !shortAnswers) ||
                (longSessionRunning(currentPeriod) && !longAnswers)
              }
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
  router: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }),
}

export default withRouter(Layout)
