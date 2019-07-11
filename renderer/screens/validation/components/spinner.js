import React from 'react'
import {rem} from 'polished'
import theme from '../../../shared/theme'

// eslint-disable-next-line react/prop-types
function Spinner({size = 30}) {
  return (
    <div>
      <style jsx>{`
        @keyframes donut-spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        div {
          display: inline-block;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: ${theme.colors.primary};
          border-radius: 50%;
          width: ${rem(size)};
          height: ${rem(size)};
          animation: donut-spin 1.2s linear infinite;

          left: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
      `}</style>
    </div>
  )
}

export default Spinner
