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
          font-weight: 500;
          margin-bottom: ${rem(10)};
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
      <input type={type} disabled={disabled} ref={ref} {...otherProps} />
      <style jsx>{`
        input {
          background: none;
          box-shadow: none;
          border-radius: 6px;
          font-size: 1em;
          padding: 0.5em 1em;
          width: 100%;
        }
      `}</style>
      <style jsx>{`
        input {
          border: solid 1px ${theme.colors.gray2};
          color: ${theme.colors.input};
          ${disabled && `background: ${theme.colors.gray}`};
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

function Switcher({isChecked, withStatusHint}) {
  return (
    <>
      <label className="switcher">
        <input type="checkbox" checked={isChecked} value={isChecked} />
        <div className="pin" />
        {withStatusHint && <span>{isChecked ? 'On' : 'Off'}</span>}
      </label>

      <style jsx>{`
        .switcher {
          position: relative;
          display: inline-block;
          vertical-align: middle;
          width: 32px;
          height: 16px;
          cursor: pointer;
          z-index: 1;
          user-select: none;
        }
        span {
          font-size: 1rem;
          line-height: 16px;
          font-weight: 500;
          color: ${theme.colors.danger};
          display: inline-block;
          vertical-align: middle;
          margin: 0 8px;
          position: absolute;
          right: 100%;
          top: 0;
          transition: color 0.3s ease;
        }
        .pin {
          background-color: ${theme.colors.danger};
          box-shadow: none;
          border-radius: 100px;
          font-size: 1em;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: background 0.3s ease;
        }
        .pin:before {
          content: '';
          position: absolute;
          left: 3px;
          top: 3px;
          width: 10px;
          height: 10px;
          border-radius: 100px;
          background-color: ${theme.colors.white};
          transition: left 0.3s ease;
        }
        input {
          cursor: pointer;
          position: absolute;
          left: -100%;
          opacity: 0;
          width: 0;
          height: 0;
        }
        input:checked ~ span {
          color: ${theme.colors.primary};
        }
        input:checked ~ .pin {
          background-color: ${theme.colors.primary};
        }
        input:checked ~ .pin:before {
          left: 18px;
        }
      `}</style>
    </>
  )
}

Switcher.propTypes = {
  isChecked: PropTypes.bool,
  withStatusHint: PropTypes.bool,
}

export {FormGroup, Label, Input, Field, Hint, Switcher}
