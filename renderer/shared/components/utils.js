/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import theme from '../theme'
import {Box, Text, Tooltip, TooltipControl} from '.'
import {Absolute} from './position'

export const Figure = ({label, value, postfix, tooltip}) => (
  <Box m="0 0 1em">
    <div>
      {tooltip ? (
        <Tooltip content={tooltip}>
          <TooltipControl>{label}</TooltipControl>
        </Tooltip>
      ) : (
        <span>{label}</span>
      )}
    </div>
    <Text css={{wordBreak: 'break-all'}}>{value}</Text>
    {postfix && (
      <>
        {' '}
        <Text>{postfix}</Text>
      </>
    )}
    <style jsx>{`
      div {
        color: ${theme.colors.muted};
        display: block;
        margin-bottom: ${theme.spacings.small};
      }
      span {
        position: relative;
        display: inline-block;
      }
    `}</style>
  </Box>
)

Figure.propTypes = {
  label: PropTypes.string,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  postfix: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
}

export function Debug(props) {
  return (
    <Absolute bottom={10} left={10} zIndex={9}>
      <pre {...props} />
      <style jsx>{`
        pre {
          background: whitesmoke;
          border-radius: 0.5rem;
          padding: 1rem;
          opacity: 0.7;
        }
      `}</style>
    </Absolute>
  )
}
