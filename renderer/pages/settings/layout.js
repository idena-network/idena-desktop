import React from 'react'

import PropTypes from 'prop-types'
import {useRouter} from 'next/router'
import Layout from '../../shared/components/layout'
import {Box, Heading} from '../../shared/components'
import theme from '../../shared/theme'
import Flex from '../../shared/components/flex'
import FlipToolbar, {
  FlipToolbarItem,
} from '../../screens/flips/components/toolbar'

function SettingsLayout({children}) {
  const router = useRouter()

  return (
    <Layout>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
        <Box>
          <Heading>Settings</Heading>
          <FlipToolbar>
            <Flex>
              <FlipToolbarItem
                key="privateKey"
                onClick={() => {
                  router.push('/settings')
                }}
                isCurrent={router.pathname === '/settings'}
              >
                Private key
              </FlipToolbarItem>
              <FlipToolbarItem
                key="node"
                onClick={() => {
                  router.push('/settings/node')
                }}
                isCurrent={router.pathname === '/settings/node'}
              >
                Node
              </FlipToolbarItem>
            </Flex>
          </FlipToolbar>
        </Box>
        {children}
      </Box>
    </Layout>
  )
}

SettingsLayout.propTypes = {
  children: PropTypes.object,
}

export default SettingsLayout
