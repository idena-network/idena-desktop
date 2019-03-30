/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import {Box} from '.'
import theme from '../../theme'

export const FormGroup = ({children}) => <Box m="0 0 1em">{children}</Box>

FormGroup.propTypes = {
  children: PropTypes.node,
}

export const Label = ({htmlFor, ...otherProps}) => (
  <>
    <label htmlFor={htmlFor} {...otherProps} />
    <style jsx>{`
      label {
        color: ${theme.colors.muted};
        display: block;
        margin-bottom: 0.5em;
      }
    `}</style>
  </>
)

Label.propTypes = {
  htmlFor: PropTypes.string.isRequired,
}

export const Input = React.forwardRef(({type = 'text', ...otherProps}, ref) => (
  <>
    <input type={type} ref={ref} {...otherProps} />
    <style jsx>{`
      input {
        background: none;
        border: solid 1px ${theme.colors.gray2};
        box-shadow: none;
        border-radius: 8px;
        color: ${theme.colors.input};
        font-size: 1em;
        outline: none;
        padding: 0.5em 1em;
      }
    `}</style>
  </>
))

Input.propTypes = {
  type: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  ref: PropTypes.object,
}
