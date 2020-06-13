import React from 'react'
import Box from './box'
import {Tooltip, TooltipControl} from './tooltip'
import theme from '../theme'
import {Text} from './typo'

// eslint-disable-next-line react/prop-types
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
