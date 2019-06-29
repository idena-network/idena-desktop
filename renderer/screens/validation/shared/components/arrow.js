import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../../../shared/theme'

const borderRadius = dir => {
  const side = dir === 'prev' ? 'right' : 'left'
  // return `border-top-${side}-radius: 400px; border-bottom-${side}-radius: 400px`
  return `;`
}

function Arrow({dir}) {
  const prev = dir === 'prev'
  return (
    <div>
      {prev ? '<' : '>'}
      <style jsx>{`
        div {
          display: flex;
          align-items: center;
          ${prev && `justify-content: flex-start`};
          ${!prev && `justify-content: flex-end`};
          width: 560px;

          position: fixed;
          top: 50px;
          bottom: 50px;
          left: 0;

          border-radius: 40%;
          transition: all 0.5s ease;
          transform: translateX(${dir === 'prev' ? '-280px' : '280px'});
        }
        div:hover {
          background: ${theme.colors.white01};
          border-radius: 50%;
        }
      `}</style>
    </div>
  )
}

Arrow.propTypes = {
  dir: PropTypes.oneOf(['prev', 'next']),
}

export default Arrow
