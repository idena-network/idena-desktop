import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import SidebarNav from './nav'
import NetContext from '../shared/providers/net-provider'
import {Absolute, Box, Text} from '../shared/components'
import theme from '../shared/theme'
import {NotificationContext} from '../shared/providers/notification-provider'
import Notification from './notification'
import ValidationBanner from './validation-banner'
import {ValidationContext} from '../shared/providers/validation-provider'

function Layout({NavMenu = SidebarNav, children}) {
  const {currentPeriod} = useContext(NetContext)

  const {notifications, alerts} = useContext(NotificationContext)

  const {
    shortSessionAnswersSubmitted,
    longSessionAnswersSubmitted,
    intervals,
  } = useContext(ValidationContext)

  return (
    <>
      <main>
        <NavMenu user={{name: 'Alex'}} />
        <div>{children}</div>
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
      </main>
      <Absolute bottom={0} left={0} right={0}>
        {currentPeriod === 'FlipLottery' && (
          <Box bg={theme.colors.danger} p={theme.spacings.normal}>
            <Text color={theme.colors.white}>
              {`Validation starts in ${intervals.FlipLotteryDuration} min`}
            </Text>
          </Box>
        )}
        {currentPeriod === 'ShortSession' && (
          <ValidationBanner
            shouldValidate={!shortSessionAnswersSubmitted}
            duration={intervals.ShortSessionDuration}
            type="short"
          />
        )}
        {currentPeriod === 'LongSession' && (
          <ValidationBanner
            shouldValidate={!longSessionAnswersSubmitted}
            duration={intervals.LongSessionDuration}
            type="long"
          />
        )}
      </Absolute>
      {notifications && (
        <Absolute top="1em" left="0" right="0">
          {notifications.map(notification => (
            <Notification key={notification.title} {...notification} />
          ))}
        </Absolute>
      )}
      {alerts && (
        <Absolute top="1em" left="0" right="0">
          {alerts.map(notification => (
            <Notification
              type="alert"
              key={notification.title}
              {...notification}
            />
          ))}
        </Absolute>
      )}
    </>
  )
}

Layout.propTypes = {
  NavMenu: PropTypes.node,
  children: PropTypes.node,
}

export default Layout
