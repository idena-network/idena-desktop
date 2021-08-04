import React, {forwardRef} from 'react'
import PropTypes from 'prop-types'
import {borderRadius} from 'polished'
import {Box, Button, Flex} from '@chakra-ui/core'
import theme, {rem} from '../theme'
import useHover from '../hooks/use-hover'
import {TextLink} from './components'

// eslint-disable-next-line react/display-name
export const Menu = forwardRef((props, ref) => (
  <MenuItems ref={ref} w={null} {...props}></MenuItems>
))

export function MenuItems({ref, ...props}) {
  return (
    <Box
      bg={theme.colors.white}
      py={theme.spacings.small}
      style={{
        ...borderRadius('top', '10px'),
        ...borderRadius('bottom', '10px'),
        boxShadow:
          '0 4px 6px 0 rgba(83, 86, 92, 0.24), 0 0 2px 0 rgba(83, 86, 92, 0.2)',
      }}
      w="145px"
      ref={ref}
      {...props}
    />
  )
}

MenuItems.propTypes = {
  ref: PropTypes.object,
}

export function MenuItem({
  href,
  onClick,
  icon,
  danger,
  disabled,
  children,
  ...props
}) {
  const [hoverRef, isHovered] = useHover()
  return (
    <Box
      ref={hoverRef}
      px={theme.spacings.normal}
      py={theme.spacings.small}
      bg={isHovered ? theme.colors.gray : ''}
    >
      <Flex align="center" onClick={disabled ? null : onClick}>
        {href ? (
          <TextLink href={href} {...props} />
        ) : (
          <Button
            bg={isHovered ? theme.colors.gray : ''}
            disabled={disabled}
            style={{display: 'flex'}}
            {...props}
          >
            <Box w={rem(35)}>
              {icon &&
                React.cloneElement(icon, {
                  style: {
                    color: danger ? theme.colors.danger : theme.colors.primary,
                    opacity: disabled ? 0.5 : 1,
                  },
                })}
            </Box>
            <Box
              style={{
                paddingLeft: rem(10),
                paddingRight: rem(10),
                paddingTop: rem(2.5),
                whiteSpace: 'nowrap',
              }}
            >
              {children}
            </Box>
          </Button>
        )}
      </Flex>
    </Box>
  )
}

MenuItem.propTypes = {
  href: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  danger: PropTypes.bool,
  hovered: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node,
}
