import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi'
import theme from '../../../shared/theme'

function Arrow({dir, type, ...props}) {
  const prev = dir === 'prev'
  const isShort = type.toLowerCase() === 'short'
  const bg = isShort ? theme.colors.white01 : theme.colors.gray
  const color = isShort ? theme.colors.white : theme.colors.text
  return (
    <div {...props}>
      <span>
        {prev ? (
          <FiChevronLeft fontSize={theme.fontSizes.large} color={color} />
        ) : (
          <FiChevronRight fontSize={theme.fontSizes.large} color={color} />
        )}
      </span>
      <style jsx>{`
        div {
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${rem(600)};
          height: ${rem(600)};

          position: absolute;
          top: 50%;
          ${prev ? 'left: 0' : 'right: 0'};

          border-radius: 50%;
          transition: all 0.5s ease;
          transform: ${`translate(${prev ? '-320px' : '320px'}, -50%);`};
        }
        div:hover {
          background: ${bg};
          border-radius: 50%;
        }
        span {
          left: ${prev ? '75%' : '25%'};
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
      `}</style>
    </div>
  )
}
// transform: translateX(${dir === 'prev' ? '-200px' : '200px'});

Arrow.propTypes = {
  dir: PropTypes.oneOf(['prev', 'next']),
  type: PropTypes.string,
}

export default Arrow
