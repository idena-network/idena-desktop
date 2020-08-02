import React, {forwardRef} from 'react'
import PropTypes from 'prop-types'
import {borderRadius} from 'polished'

import {useColorMode} from '@chakra-ui/core'
import {Box, Link} from '.'
import Flex from './flex'
import theme, {rem} from '../theme'
import {FlatButton} from './button'

import useHover from '../hooks/use-hover'

// eslint-disable-next-line react/display-name
export const Menu = forwardRef((props, ref) => (
  <MenuItems ref={ref} w={null} {...props}></MenuItems>
))

export function MenuItems({ref, ...props}) {
  const {colorMode} = useColorMode()
  return (
    <Box
      bg={colorMode === 'light' ? theme.colors.white : theme.colors.black}
      py={theme.spacings.small}
      css={{
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
  const {colorMode} = useColorMode()
  return (
    <Box
      ref={hoverRef}
      px={theme.spacings.normal}
      py={theme.spacings.small}
      bg={isHovered ? theme.colors[colorMode].gray : ''}
    >
      <Flex align="center" onClick={disabled ? null : onClick}>
        {href ? (
          <Link href={href} {...props} />
        ) : (
          <FlatButton
            bg={isHovered ? theme.colors.gray : ''}
            disabled={disabled}
            color={theme.colors[colorMode].text}
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
          </FlatButton>
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
