/* eslint-disable react/prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import {transparentize, darken} from 'polished'
import {
  Button as ChakraButton,
  PseudoBox,
  Icon,
  useColorMode,
} from '@chakra-ui/core'
import theme, {rem} from '../theme'
import {Tooltip} from './tooltip'

function Button({size, disabled, danger, variant = 'primary', css, ...props}) {
  const isPrimary = variant === 'primary'
  const bgColor = danger ? theme.colors.danger : theme.colors.primary

  const bg = isPrimary ? bgColor : transparentize(0.88, bgColor)
  const color = isPrimary ? theme.colors.white : theme.colors.primary

  return (
    <>
      <button type="button" disabled={disabled} style={css} {...props} />
      <style jsx>{`
        button {
          background: ${bg};
          border: none;
          border-radius: 6px;
          color: ${color};
          cursor: pointer;
          font-size: ${size};
          padding: ${rem(6)} ${rem(16)};
          outline: none;
          transition: all 0.3s ease;
          transition-property: background, color;
          min-height: ${rem(32)};
        }
        button:hover {
          background: ${darken(0.1, bg)};
          color: ${darken(0.05, color)};
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </>
  )
}
Button.defaultProps = {
  ...theme.Button,
}
Button.propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  disabled: PropTypes.bool,
  danger: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

function FlatButton({size, color, disabled, css, ...props}) {
  return (
    <>
      <button type="button" disabled={disabled} style={css} {...props} />
      <style jsx>{`
        button {
          background: none;
          border: none;
          border-radius: 6px;
          color: ${color};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          font-size: ${size};
          padding: 0;
          outline: none;
          ${disabled && `opacity: 0.5`};
          transition: background 0.3s ease, color 0.3s ease;
        }
        button:hover {
          color: ${darken(0.05, color)};
          opacity: 0.9;
          ${disabled && `opacity: 0.5`};
        }
      `}</style>
    </>
  )
}
FlatButton.defaultProps = {
  ...theme.Button,
}
FlatButton.propTypes = Button.propTypes

function IconButton(
  // eslint-disable-next-line react/prop-types
  {icon, children, disabled, active, tooltip, danger, ...props},
  ref
) {
  const color = danger ? theme.colors.danger : theme.colors.primary
  return (
    <Tooltip content={tooltip}>
      <button type="button" disabled={disabled} ref={ref} {...props}>
        {icon}
        <span>{children}</span>
        <style jsx>{`
          button {
            background: ${active ? '#f5f6f7' : 'none'};
            border: none;
            cursor: ${disabled ? 'default' : 'pointer'};
            font-size: 1em;
            display: flex;
            align-items: center;
            text-decoration: none;
            vertical-align: middle;
            position: relative;
            transition: color 0.5s ease;
            ${disabled && `opacity: 0.5`};
          }
          span {
            display: inline-block;
          }
        `}</style>
        <style jsx>{`
          button {
            color: ${color};
            font-weight: 500;
            padding: ${rem(theme.spacings.small8)};
          }
          button:hover {
            color: ${darken(0.1, color)};
          }
          span {
            margin-left: ${children ? theme.spacings.small : '0'};
          }
        `}</style>
      </button>
    </Tooltip>
  )
}

const IconButtonRef = React.forwardRef(IconButton)

IconButtonRef.propTypes = {
  icon: PropTypes.node,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  tooltip: PropTypes.node,
  danger: PropTypes.bool,
}

const BaseButton = React.forwardRef(function(props, ref) {
  const {colorMode} = useColorMode()
  return (
    <ChakraButton
      ref={ref}
      fontWeight={500}
      h={8}
      px={4}
      py="3/2"
      rounded="md"
      _disabled={{
        bg: colorMode === 'light' ? 'gray.300' : 'gray.700',
        color: 'rgb(150 153 158)',
      }}
      {...props}
    />
  )
})
BaseButton.displayName = 'BaseButton'

export const PrimaryButton = React.forwardRef((props, ref) => (
  <BaseButton ref={ref} variantColor="brandBlue" color="white" {...props} />
))
PrimaryButton.displayName = 'PrimaryButton'

export function SecondaryButton(props) {
  const {colorMode} = useColorMode()
  return (
    <PseudoBox
      as="button"
      bg="brandBlue.10"
      color="brandBlue.500"
      fontWeight={500}
      h={8}
      px={4}
      py="3/2"
      rounded="md"
      transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
      _hover={{bg: 'brandBlue.20'}}
      _active={{
        bg: 'brandBlue.50',
        transform: 'scale(0.98)',
      }}
      _focus={{
        shadow: 'outline',
        outline: 'none',
      }}
      _disabled={{
        bg: colorMode === 'light' ? 'gray.50' : 'gray.800',
        color: 'rgb(150 153 158)',
      }}
      // eslint-disable-next-line react/destructuring-assignment
      disabled={props.isDisabled}
      {...props}
    />
  )
}

export function IconButton2({icon, children, ...props}) {
  return (
    <ChakraButton
      variant="ghost"
      variantColor="blue"
      fontWeight={500}
      h={8}
      px={2}
      py="3/2"
      justifyContent="flex-start"
      {...props}
    >
      <Icon name={icon} size={5} mr={2} />
      {children}
    </ChakraButton>
  )
}

export {FlatButton, IconButtonRef as IconButton}
export default Button
