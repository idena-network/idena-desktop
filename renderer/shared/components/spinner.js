import React from 'react'

// eslint-disable-next-line react/prop-types
export function Spinner({color = '#fff'}) {
  return (
    <div className="loader-inner line-spin-fade-loader">
      {Array.from({length: 8}, (_, i) => i).map(x => (
        <div key={`spinner-item-${x}`} />
      ))}

      <style jsx>{`
        @keyframes line-spin-fade-loader {
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 1;
          }
        }

        .line-spin-fade-loader {
          position: relative;
        }
        .line-spin-fade-loader > div:nth-child(1) {
          top: 20px;
          left: 0;
          animation: line-spin-fade-loader 1.2s -0.84s infinite ease-in-out;
        }
        .line-spin-fade-loader > div:nth-child(2) {
          top: 13.63636px;
          left: 13.63636px;
          -webkit-transform: rotate(-45deg);
          transform: rotate(-45deg);
          animation: line-spin-fade-loader 1.2s -0.72s infinite ease-in-out;
        }
        .line-spin-fade-loader > div:nth-child(3) {
          top: 0;
          left: 20px;
          -webkit-transform: rotate(90deg);
          transform: rotate(90deg);
          animation: line-spin-fade-loader 1.2s -0.6s infinite ease-in-out;
        }
        .line-spin-fade-loader > div:nth-child(4) {
          top: -13.63636px;
          left: 13.63636px;
          -webkit-transform: rotate(45deg);
          transform: rotate(45deg);
          animation: line-spin-fade-loader 1.2s -0.48s infinite ease-in-out;
        }
        .line-spin-fade-loader > div:nth-child(5) {
          top: -20px;
          left: 0;
          animation: line-spin-fade-loader 1.2s -0.36s infinite ease-in-out;
        }
        .line-spin-fade-loader > div:nth-child(6) {
          top: -13.63636px;
          left: -13.63636px;
          -webkit-transform: rotate(-45deg);
          transform: rotate(-45deg);
          animation: line-spin-fade-loader 1.2s -0.24s infinite ease-in-out;
        }
        .line-spin-fade-loader > div:nth-child(7) {
          top: 0;
          left: -20px;
          -webkit-transform: rotate(90deg);
          transform: rotate(90deg);
          animation: line-spin-fade-loader 1.2s -0.12s infinite ease-in-out;
        }
        .line-spin-fade-loader > div:nth-child(8) {
          top: 13.63636px;
          left: -13.63636px;
          -webkit-transform: rotate(45deg);
          transform: rotate(45deg);
          animation: line-spin-fade-loader 1.2s 0s infinite ease-in-out;
        }
        .line-spin-fade-loader > div {
          background-color: ${color};
          border-radius: 2px;
          margin: 2px;
          animation-fill-mode: both;
          position: absolute;
          width: 5px;
          height: 16px;
        }
      `}</style>
    </div>
  )
}
