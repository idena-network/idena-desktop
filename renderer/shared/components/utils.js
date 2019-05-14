/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import theme from '../theme'
import {Box, Text} from '.'

export const Figure = ({label, value, postfix}) => (
  <Box m="0 0 1em">
    <span>{label}</span>
    <Text css={{wordBreak: 'break-all'}}>{value}</Text>
    {postfix && (
      <>
        {' '}
        <Text>{postfix}</Text>
      </>
    )}
    <style jsx>{`
      span {
        color: ${theme.colors.muted};
        display: block;
        margin-bottom: ${theme.spacings.small};
      }
    `}</style>
  </Box>
)

Figure.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  postfix: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
}

export function If({condition, fallback = null, children}) {
  return <>{condition ? children : fallback}</>
}

If.propTypes = {
  condition: PropTypes.bool,
  fallback: PropTypes.node,
  children: PropTypes.node,
}
