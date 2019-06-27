/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem, border} from 'polished'
import theme from '../theme'
import {Box} from '.'
import Flex from './flex'
import {Text} from './typo'

function FormGroup(props) {
  return <Box m={margin(0, 0, rem(theme.spacings.medium16))} {...props} />
}

FormGroup.propTypes = {
  children: PropTypes.node,
}

function Label({htmlFor, ...otherProps}) {
  return (
    <>
      <label htmlFor={htmlFor} {...otherProps} />
      <style jsx>{`
        label {
          color: ${theme.colors.text};
          display: block;
          margin-bottom: ${theme.spacings.normal};
        }
      `}</style>
    </>
  )
}

Label.propTypes = {
  htmlFor: PropTypes.string.isRequired,
}

const Input = React.forwardRef(
  ({type = 'text', disabled, ...otherProps}, ref) => (
    <>
      <input type={type} ref={ref} {...otherProps} />
      <style jsx>{`
        input {
          background: none;
          box-shadow: none;
          border-radius: 8px;
          font-size: 1em;
          padding: 0.5em 1em;
        }
      `}</style>
      <style jsx>{`
        input {
          border: solid 1px ${theme.colors.gray2};
          color: ${theme.colors.input};
          ${disabled && 'cursor: not-allowed'};
          ${disabled && 'opacity: 0.5'};
        }
        input:focus {
          outline: solid 2px ${theme.colors.primary};
        }
      `}</style>
    </>
  )
)

Input.propTypes = {
  type: PropTypes.string,
  disabled: PropTypes.bool,
}

function Field({label, children, ...props}) {
  return (
    <FormGroup>
      <Label style={margin(rem(theme.spacings.small8), 0)}>{label}</Label>
      <Input {...props} />
      {children}
    </FormGroup>
  )
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
}

function Hint({label, value}) {
  return (
    <Flex
      justify="space-between"
      align="center"
      css={margin(rem(theme.spacings.small8), 0)}
    >
      <Text color={theme.colors.muted}>{label}</Text>
      <Text>{value}</Text>
    </Flex>
  )
}

Hint.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
}

export {FormGroup, Label, Input, Field, Hint}
