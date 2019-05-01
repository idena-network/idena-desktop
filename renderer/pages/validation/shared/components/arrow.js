import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../../../shared/theme'

const borderRadius = dir => {
  const side = dir === 'prev' ? 'right' : 'left'
  return `border-top-${side}-radius: 100%; border-bottom-${side}-radius: 100%`
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
          height: 100%;
          width: 100%;
        }
        div:hover {
          background: ${theme.colors.gray3};
          ${borderRadius(dir)};
          transition: all cubic-bezier(0.075, 0.82, 0.165, 1);
        }
      `}</style>
    </div>
  )
}

Arrow.propTypes = {
  dir: PropTypes.oneOf(['prev', 'next']),
}

export default Arrow
