import React from 'react'
import PropTypes from 'prop-types'
import Flex from '../../../shared/components/flex'
import theme, {rem} from '../../../shared/theme'
import Box from '../../../shared/components/box'

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
          font-size ${rem(64)};
          line-height ${rem(64)};
          color: ${theme.colors.gray2};
          display: inline-block;
          margin: 0 auto;
          margin-bottom: ${rem(18)};
        }
        .text {
          color: ${theme.colors.muted};
          font-size: ${rem(13)};
          line-height: ${rem(18)};
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
