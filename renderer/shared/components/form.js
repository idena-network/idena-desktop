/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import {margin, transparentize} from 'polished'
import {FiChevronDown} from 'react-icons/fi'
import {useColorMode} from '@chakra-ui/core'
import theme, {rem} from '../theme'
import Box from './box'
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
  const {colorMode} = useColorMode()
  return (
    <>
      <label htmlFor={htmlFor} {...otherProps} />
      <style jsx>{`
        label {
          color: ${theme.colors[colorMode].text};
          display: block;
          margin-bottom: ${rem(10)};
        }
      `}</style>
    </>
  )
}

Label.propTypes = {
  htmlFor: PropTypes.string.isRequired,
}

function Select({options, ...props}) {
  const {disabled} = props
  const {colorMode} = useColorMode()
  return (
    <div>
      <select {...props}>
        {options.map(option => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="icon">
        <FiChevronDown />
      </span>
      <style jsx>{`
        div {
          position: relative;
        }
        .icon {
          position: absolute;
          right: ${rem(8)};
          top: ${rem(9)};
          font-size: ${rem(20)};
          color: ${theme.colors.muted};
          pointer-events: none;
        }
        select:focus {
          outline: none;
          z-index: 2;
          border-color: ${theme.colors.primary};
          box-shadow: inset 0 0 0 2px ${theme.colors.primary};
        }
        select {
          position: relative;
          padding: ${rem(theme.spacings.small8)} ${rem(theme.spacings.medium32)}
            ${rem(theme.spacings.small8)} ${rem(theme.spacings.medium16)};
          appearance: none;
          border: 0;
          background: ${colorMode === 'light'
            ? 'none'
            : theme.colors.dark.gray2};
          box-shadow: none;
          border-radius: 6px;
          font-size: 1em;
          width: 100%;
          cursor: pointer;
          width: 100%;
          box-shadow: inset 0 0 0 1px
            ${colorMode === 'light' ? theme.colors.gray2 : theme.colors.gray6};
          color: ${theme.colors[colorMode].text};
          ${disabled && `background: ${theme.colors.gray}`};
          ${disabled && 'cursor: not-allowed'};
        }
      `}</style>
    </div>
  )
}

Select.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  options: PropTypes.array,
  disabled: PropTypes.bool,
}

// eslint-disable-next-line react/display-name
const Input = React.forwardRef(function(
  {type = 'text', disabled, border, ...otherProps},
  ref
) {
  const {colorMode} = useColorMode()
  return (
    <>
      <input type={type} disabled={disabled} ref={ref} {...otherProps} />
      <style jsx>{`
        input {
          position: relative;
          background: none;
          box-shadow: none;
          border-radius: ${border || '6px'};
          border: 0;
          font-size: 1em;
          padding: ${rem(theme.spacings.small8)} ${rem(theme.spacings.medium16)};
          width: 100%;
          box-shadow: inset 0 0 0 1px
            ${colorMode === 'light' ? theme.colors.gray2 : theme.colors.gray6};
          color: ${theme.colors[colorMode].text};
          ${disabled &&
            `background: ${
              colorMode === 'light' ? theme.colors.gray : theme.colors.gray6
            }`};
          ${disabled && 'cursor: not-allowed'};
        }
        input:focus {
          outline: none;
          z-index: 2;
          border-color: ${theme.colors.primary};
          box-shadow: inset 0 0 0 2px ${theme.colors.primary};
        }
      `}</style>
    </>
  )
})

Input.propTypes = {
  type: PropTypes.string,
  border: PropTypes.string,
  disabled: PropTypes.bool,
}

// eslint-disable-next-line react/display-name
function Textarea({disabled, ...otherProps}) {
  return (
    <>
      <textarea disabled={disabled} {...otherProps} />
      <style jsx>{`
        textarea {
          position: relative;
          background: none;
          box-shadow: none;
          border-radius: 6px;
          border: 0;
          font-size: 1em;
          padding: ${rem(theme.spacings.medium16)};
          width: 100%;
          box-shadow: inset 0 0 0 1px ${theme.colors.gray2};
          color: ${theme.colors.text};
          ${disabled && `background: ${theme.colors.gray}`};
          ${disabled && 'cursor: not-allowed'};
          resize: none;
        }
        textarea:focus {
          outline: none;
          z-index: 2;
          border-color: ${theme.colors.primary};
          box-shadow: inset 0 0 0 2px ${theme.colors.primary};
        }
      `}</style>
    </>
  )
}

Textarea.propTypes = {
  disabled: PropTypes.bool,
}

let idx = 0
function Field({label, id, allowCopy, children, textarea, select, ...props}) {
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
              css={{fontWeight: 500, lineHeight: 1}}
              onClick={() => copyToClipboard(inputRef.current.value)}
            >
              Copy
            </FlatButton>
          </Flex>
        )}
      </Flex>
      {!select && !textarea && <Input id={uniqId} {...props} ref={inputRef} />}
      {textarea && <Textarea id={uniqId} {...props} ref={inputRef} />}
      {children}
    </FormGroup>
  )
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string,
  allowCopy: PropTypes.bool,
  select: PropTypes.bool,
  textarea: PropTypes.bool,
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

function Switcher({
  isChecked,
  withStatusHint,
  isInProgress,
  bgOn = theme.colors.primary,
  bgOff = theme.colors.gray4,
  ...props
}) {
  const {disabled} = props
  return (
    <>
      <label className="switcher">
        <input
          type="checkbox"
          checked={isChecked}
          className={isInProgress && 'in-progress'}
          value={isChecked}
          disabled={disabled}
          {...props}
        />
        <div className="pin" />
        {withStatusHint && (
          <span>
            {/* eslint-disable-next-line no-nested-ternary */}
            {isInProgress ? 'Waiting...' : isChecked ? 'On' : 'Off'}
          </span>
        )}
      </label>

      <style jsx>{`
        .switcher {
          position: relative;
          display: inline-block;
          vertical-align: middle;
          width: 32px;
          height: 16px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          z-index: 1;
          user-select: none;
        }
        span {
          font-size: ${rem(13)};
          line-height: 16px;
          font-weight: 500;
          color: ${bgOff};
          display: inline-block;
          vertical-align: middle;
          margin: 0 8px;
          position: absolute;
          right: 100%;
          top: 0;
          transition: color 0.3s ease;
        }
        .pin {
          background-color: ${bgOff};
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
          color: ${bgOn};
        }
        input:checked ~ .pin {
          background-color: ${bgOn};
        }
        input:disabled ~ span {
          color: ${transparentize(0.4, isChecked ? bgOn : bgOff)};
        }
        input:disabled ~ .pin {
          background-color: ${transparentize(0.4, isChecked ? bgOn : bgOff)};
        }
        input:checked ~ .pin:before {
          left: 18px;
        }
        input.in-progress ~ span {
          color: ${theme.colors.warning};
        }
        input.in-progress ~ .pin {
          background-color: ${theme.colors.warning};
        }
        input.in-progress ~ .pin:before {
          left: 11px;
        }
      `}</style>
    </>
  )
}

Switcher.propTypes = {
  isChecked: PropTypes.bool,
  isInProgress: PropTypes.bool,
  withStatusHint: PropTypes.bool,
  disabled: PropTypes.bool,
  bgOn: PropTypes.string,
  bgOff: PropTypes.string,
}

export {FormGroup, Label, Input, Field, Hint, Switcher, Select}
