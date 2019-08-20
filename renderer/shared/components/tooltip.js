import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import {Box} from '.'
import theme from '../theme'

export function Tooltip({children, content, placement, ...props}) {
  return (
    <Box {...props} style={{position: 'relative', display: 'inline-block'}}>
      <div className="tooltip-action">{children}</div>
      <div className={placement ? `tooltip tooltip-${placement}` : `tooltip`}>
        {content}
      </div>
      <style jsx>{`
        .tooltip-action {
          cursor: pointer;
        }
        .tooltip-action:hover + .tooltip {
          opacity: 1;
          visibility: visible;
        }
        .tooltip {
          position: absolute;
          padding: ${rem(6)} ${rem(14)};
          margin: ${rem(5)} 0;
          left: 50%;
          bottom: 100%;
          background-color: ${theme.colors.text};
          color: ${theme.colors.white};
          border-radius: ${rem(6)};
          font-size: ${rem(13)};
          line-height: ${rem(20)};
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transform: translate(-50%, 0);
          transition: all 0.3s ease;
        }
        .tooltip:after {
          top: 100%;
          left: 50%;
          border: solid transparent;
          content: ' ';
          height: 0;
          width: 0;
          position: absolute;
          pointer-events: none;
          border-color: rgba(136, 183, 213, 0);
          border-top-color: ${theme.colors.text};
          border-width: 5px;
          margin-left: -5px;
        }
        .tooltip-bottom {
          top: 100%;
          bottom: auto;
        }
        .tooltip-bottom:after {
          bottom: 100%;
          top: auto;
          border: solid transparent;
          border-color: rgba(136, 183, 213, 0);
          border-top-color: rgba(136, 183, 213, 0);
          border-bottom-color: ${theme.colors.text};
          border-width: 5px;
          margin-left: -5px;
        }
      `}</style>
    </Box>
  )
}

Tooltip.propTypes = {
  content: PropTypes.node,
  children: PropTypes.node,
  placement: PropTypes.string,
}

export function TooltipIcon({icon}) {
  return (
    <span>
      {icon}
      <style jsx>{`
        span {
          margin: ${rem(-8)} 0;
          padding: ${rem(6)};
          font-size: ${rem(20)};
          color: ${theme.colors.primary};
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>
    </span>
  )
}

TooltipIcon.propTypes = {
  icon: PropTypes.node,
}
