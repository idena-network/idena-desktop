import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import Flex from './flex'
import theme from '../theme'
import Box from './box'

export function Placeholder({children, icon, text, ...props}) {
  return (
    <Box
      {...props}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <Flex
        align="center"
        css={{
          height: '100%',
          width: '100%',
          padding: '20px',
          justifyContent: 'center',
        }}
      >
        <div>
          {icon && <div className="icon">{icon}</div>}
          {text && <div className="text">{text}</div>}
          {children && <div>{children}</div>}
        </div>
      </Flex>
      <style jsx>{`
        .icon {
          font-size ${rem(80)};
          line-height ${rem(80)};
          color: ${theme.colors.gray2};
          margin-bottom: ${rem(18)};
        }
        .text {
          color: ${theme.colors.muted};
          font-size: ${rem(16)};
          line-height: ${rem(22)};
        }
      `}</style>
    </Box>
  )
}

Placeholder.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.node,
  text: PropTypes.any,
}
