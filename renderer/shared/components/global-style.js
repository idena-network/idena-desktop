/* eslint-disable no-useless-escape */
import React from 'react'
import theme, {rem} from '../theme'

// eslint-disable-next-line react/display-name
export default () => (
  <style jsx global>{`
    @import url('/static/fonts/icons.css');
    @import url('/static/fonts/inter.css');
    html {
      box-sizing: border-box;
      font-size: 13px;
      font-family: 'Inter var', -apple-system, BlinkMacSystemFont, 'Segoe UI',
        Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica,
        Arial, sans-serif;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    @supports (font-variation-settings: normal) {
      html {
        font-family: 'Inter var', sans-serif;
      }
    }
    body {
      box-sizing: border-box;
      font-size: 1rem;
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }
    body > div,
    main {
      min-height: 100vh;
    }

    #nprogress {
      pointer-events: none;
    }

    #nprogress .bar {
      background: ${theme.colors.primary};

      position: fixed;
      z-index: 999;
      top: 0;
      left: 0;

      width: 100%;
      height: ${rem('3px')};
    }

    #nprogress .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: ${rem('100px')};
      height: 100%;
      box-shadow: 0 0 ${rem('10px')} ${theme.colors.primary},
        0 0 ${rem('5px')} ${theme.colors.primary};
      opacity: 1;

      -webkit-transform: rotate(3deg) translate(0px, ${rem('-4px')});
      -ms-transform: rotate(3deg) translate(0px, ${rem('-4px')});
      transform: rotate(3deg) translate(0px, ${rem('-4px')});
    }

    #nprogress .spinner {
      display: block;
      position: fixed;
      z-index: 1031;
      top: ${rem('15px')};
      right: ${rem('15px')};
    }

    #nprogress .spinner-icon {
      width: ${rem('18px')};
      height: ${rem('18px')};
      box-sizing: border-box;

      border: solid ${rem('2px')} transparent;
      border-top-color: ${theme.colors.primary};
      border-left-color: ${theme.colors.primary};
      border-radius: 50%;

      -webkit-animation: nprogress-spinner 400ms linear infinite;
      animation: nprogress-spinner 400ms linear infinite;
    }

    .nprogress-custom-parent {
      overflow: hidden;
      position: relative;
    }

    .nprogress-custom-parent #nprogress .spinner,
    .nprogress-custom-parent #nprogress .bar {
      position: absolute;
    }

    @-webkit-keyframes nprogress-spinner {
      0% {
        -webkit-transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
      }
    }
    @keyframes nprogress-spinner {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .text-right {
      text-align: right;
    }
  `}</style>
)
