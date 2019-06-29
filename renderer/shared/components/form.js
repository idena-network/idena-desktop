/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem} from 'polished'
import theme from '../theme'
import {Box} from '.'
import Flex from './flex'
import {Text} from './typo'
import {FlatButton} from './button'
import useClipboard from '../hooks/use-clipboard'

function FormGroup(props) {
  return <Box {...props} />
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
          ${disabled && `background: ${theme.colors.gray2}`};
          ${disabled && 'cursor: not-allowed'};
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

let idx = 0
function Field({label, id, allowCopy, onCopied, children, ...props}) {
  const [{value: copiedText}, copyToClipboard] = useClipboard()
  const inputRef = React.useRef()

  // eslint-disable-next-line no-plusplus
  const uniqId = id || `input${++idx}`
  return (
    <FormGroup css={margin(rem(theme.spacings.medium24), 0, 0)}>
      <Flex justify="space-between" align="center">
        <Label
          htmlFor={uniqId}
          style={margin(0, 0, rem(theme.spacings.small8))}
        >
          {label}
        </Label>
        {allowCopy && (
          <Flex align="center">
            <Text
              color={theme.colors.success}
              fontSize={theme.fontSizes.small}
              css={margin(0, rem(theme.spacings.small8), 0)}
            >
              {copiedText && 'Copied'}
            </Text>
            <FlatButton
              color={theme.colors.primary}
              css={{lineHeight: 1}}
              onClick={() => copyToClipboard(inputRef.current.value)}
            >
              Copy
            </FlatButton>
          </Flex>
        )}
      </Flex>
      <Input id={uniqId} {...props} ref={inputRef} />
      {children}
    </FormGroup>
  )
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string,
  allowCopy: PropTypes.bool,
  onCopied: PropTypes.func,
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
