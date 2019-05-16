import React from 'react'
import PropTypes from 'prop-types'
import Flex from '../../../shared/components/flex'
import {Button, Link, AddIcon} from '../../../shared/components'
import theme from '../../../shared/theme'

const NavItem = props => <Button {...props} />

function FlipToolbar({activeFilter, onFilter, shouldShowAddFlip}) {
  return (
    <Flex justify="space-between" align="center">
      <Flex>
        {['flips', 'drafts'].map(filter => {
          const active = activeFilter === filter
          return (
            <NavItem
              key={filter}
              onClick={() => onFilter(filter)}
              css={{
                background: active ? theme.colors.gray2 : theme.colors.white,
                color: active ? theme.colors.primary : theme.colors.muted,
                textTransform: 'capitalize',
                marginRight: theme.spacings.small,
              }}
            >
              {filter}
            </NavItem>
          )
        })}
      </Flex>
      {shouldShowAddFlip && (
        <Flex>
          <Link href="/flips/new">
            <AddIcon /> New Flip
          </Link>
        </Flex>
      )}
    </Flex>
  )
}

FlipToolbar.propTypes = {
  activeFilter: PropTypes.string,
  onFilter: PropTypes.func,
  shouldShowAddFlip: PropTypes.bool.isRequired,
}

export default FlipToolbar
