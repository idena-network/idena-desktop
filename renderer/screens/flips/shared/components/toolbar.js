import React from 'react'
import PropTypes from 'prop-types'
import {FiPlusSquare} from 'react-icons/fi'
import {Button, Link, Box} from '../../../../shared/components'
import theme from '../../../../shared/theme'
import Flex from '../../../../shared/components/flex'

const NavItem = props => <Button {...props} />

// eslint-disable-next-line react/prop-types
const ToolbarLink = ({href, children}) => (
  <Link href={href} color={theme.colors.primary}>
    <Flex align="center">{children}</Flex>
  </Link>
)

function FlipToolbar({filters, activeFilter, onFilter, shouldShowAddFlip}) {
  return (
    <Flex justify="space-between" align="center">
      <Flex>
        {filters.map(filter => {
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
          <ToolbarLink href="/flips/new">
            <FiPlusSquare />
            <Box mx={theme.spacings.small}>Add flip</Box>
          </ToolbarLink>
        </Flex>
      )}
    </Flex>
  )
}

FlipToolbar.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeFilter: PropTypes.string,
  onFilter: PropTypes.func,
  shouldShowAddFlip: PropTypes.bool.isRequired,
}

export default FlipToolbar
