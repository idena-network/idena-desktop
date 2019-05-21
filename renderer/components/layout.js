import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import SidebarNav from './nav'
import NetContext from '../shared/providers/net-provider'
import {Absolute, Box, Link, Fill} from '../shared/components'
import theme from '../shared/theme'
import Flex from '../shared/components/flex'
import {NotificationContext} from '../shared/providers/notification-provider'
import Notification from './notification'

function Layout({NavMenu = SidebarNav, children}) {
  const {currentPeriod, validationSoon} = useContext(NetContext)
  const {notifications} = useContext(NotificationContext)
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
        {validationSoon && (
          <Box bg="red" p={theme.spacings.normal}>
            Validation starts in a minute
          </Box>
        )}
        {currentPeriod === 'ShortSession' && (
          <Box bg={theme.colors.primary} css={{color: theme.colors.white}}>
            <Flex justify="space-between" align="center">
              <Flex>
                <Box p={theme.spacings.normal} css={{position: 'relative'}}>
                  5 min left
                  <Fill bg="rgba(0,0,0,0.1)" css={{display: 'none'}}>
                    &nbsp;
                  </Fill>
                </Box>
                <Box p={theme.spacings.normal}>Idena validation started</Box>
              </Flex>
              <Box p={theme.spacings.normal}>
                <Link href="/validation/short" color={theme.colors.white}>
                  Validate
                </Link>
              </Box>
            </Flex>
          </Box>
        )}
      </Absolute>
      {notifications && (
        <Absolute top="1em" left="0" right="0">
          {notifications.map(notification => (
            <Notification key={notification.title} {...notification} />
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
