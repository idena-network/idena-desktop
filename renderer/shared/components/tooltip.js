import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import {Box} from '.'
import theme from '../theme'

export function Tooltip({children, content, placement, pinned, ...props}) {
  return (
    <Box {...props} style={{position: 'relative', display: 'inline-block'}}>
      <div className="tooltip-action">{children}</div>
      <div
        className={`tooltip ${pinned ? 'tooltip--pinned' : ''}
          ${placement ? `tooltip-${placement}` : ''}`}
      >
        {content}
      </div>
      <style jsx>{`
        .tooltip-action {
          cursor: pointer;
        }
        .tooltip-action:hover + .tooltip,
        .tooltip.tooltip--pinned {
          opacity: 1;
          visibility: visible;
        }
        .tooltip {
          position: absolute;
          padding: ${rem(6)} ${rem(14)};
          margin: ${rem(10)} 0;
          left: 50%;
          bottom: 100%;
          background-color: ${theme.colors.text};
          color: ${theme.colors.white};
          border-radius: ${rem(6)};
          font-size: ${rem(13)};
          line-height: ${rem(20)};
          white-space: pre;
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
        .tooltip-top-left,
        .tooltip-top-right {
          transform: translate(0, 0);
        }
        .tooltip-top-left {
          left: 0;
        }
        .tooltip-top-left:after {
          left: 10%;
        }
        .tooltip-top-right {
          right: 0;
          left: auto;
        }
        .tooltip-top-right:after {
          left: auto;
          right: 10%;
        }
      `}</style>
    </Box>
  )
}

Tooltip.propTypes = {
  content: PropTypes.node,
  children: PropTypes.node,
  large: PropTypes.bool,
  placement: PropTypes.string,
  pinned: PropTypes.bool,
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

export function TooltipControl({children}) {
  return (
    <span>
      {children}
      <style jsx>{`
        span {
          display: inline-block;
          vertical-align: middle;
          border-bottom: 1px dotted #96999e;
        }
      `}</style>
    </span>
  )
}

TooltipControl.propTypes = {
  children: PropTypes.node,
}
