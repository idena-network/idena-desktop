/* eslint-disable no-useless-escape */
import React from 'react'
import theme, {rem} from '../theme'

// eslint-disable-next-line react/display-name
export default () => (
  <style jsx global>{`
    @import url('/fonts/inter.css');
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

    @font-face {
      font-family: 'icons';
      src: url('/fonts/icons.eot');
      src: url('/fonts/icons.ttf') format('truetype'),
        url('/fonts/icons.woff') format('woff'),
        url('/fonts/icons.svg#icons') format('svg');
      font-weight: normal;
      font-style: normal;
      font-display: block;
    }

    [class^='icon--'],
    [class*=' icon--'] {
      font-family: 'icons' !important;
      speak: none;
      font-style: normal;
      font-weight: normal;
      font-variant: normal;
      text-transform: none;
      line-height: 1;
      font-size: 140%;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .icon--add_btn:before {
      content: '\e906';
    }
    .icon--share:before {
      content: '\e900';
    }
    .icon--Info:before {
      content: '\e901';
    }
    .icon--add_contact:before {
      content: '\e902';
    }
    .icon--scan:before {
      content: '\e904';
    }
    .icon--withdraw:before {
      content: '\e905';
    }
    .icon--user:before {
      content: '\e907';
    }
    .icon--delete:before {
      content: '\e909';
    }
    .icon--tick:before {
      content: '\e90a';
    }
    .icon--reject:before {
      content: '\e90b';
    }
    .icon--change:before {
      content: '\e90c';
    }
    .icon--key:before {
      content: '\e941';
    }
    .icon--extrasmall_check:before {
      content: '\e90d';
    }
    .icon--large_pic:before {
      content: '\e90e';
    }
    .icon--left_arrow:before {
      content: '\e90f';
    }
    .icon--add:before {
      content: '\e911';
    }
    .icon--block:before {
      content: '\e912';
    }
    .icon--change:before {
      content: '\e914';
    }
    .icon--coins:before {
      content: '\e915';
    }
    .icon--deposit:before {
      content: '\e916';
    }
    .icon--doc:before {
      content: '\e917';
    }
    .icon--down_arrow:before {
      content: '\e918';
    }
    .icon--download:before {
      content: '\e919';
    }
    .icon--edit:before {
      content: '\e91a';
    }
    .icon--expand:before {
      content: '\e91b';
    }
    .icon--hor_flip:before {
      content: '\e91c';
    }
    .icon--info:before {
      content: '\e91d';
    }
    .icon--laptop:before {
      content: '\e91e';
    }
    .icon--large_exit:before {
      content: '\e91f';
    }
    .icon--move:before {
      content: '\e920';
    }
    .icon--new:before {
      content: '\e921';
    }
    .icon--ok:before {
      content: '\e922';
    }
    .icon--open:before {
      content: '\e923';
    }
    .icon--options:before {
      content: '\e924';
    }
    .icon--photo:before {
      content: '\e925';
    }
    .icon--pic:before {
      content: '\e926';
    }
    .icon--play:before {
      content: '\e927';
    }
    .icon--return:before {
      content: '\e929';
    }
    .icon--search:before {
      content: '\e92a';
    }
    .icon--send:before {
      content: '\e92b';
    }
    .icon--settings:before {
      content: '\e92c';
    }
    .icon--small_exit:before {
      content: '\e92d';
    }
    .icon--thin_arrow_down:before {
      content: '\e92e';
    }
    .icon--thin_arrow_up:before {
      content: '\e92f';
    }
    .icon--timer:before {
      content: '\e930';
    }
    .icon--undo:before {
      content: '\e931';
    }
    .icon--up_arrow:before {
      content: '\e932';
    }
    .icon--update:before {
      content: '\e933';
    }
    .icon--upload:before {
      content: '\e934';
    }
    .icon--ver_flip:before {
      content: '\e935';
    }
    .icon--micro_check:before {
      content: '\e936';
    }
    .icon--right_arrow:before {
      content: '\e937';
    }
    .icon--small_balance:before {
      content: '\e938';
    }
    .icon--small_lock:before {
      content: '\e939';
    }
    .icon--small_status:before {
      content: '\e93a';
    }
    .icon--menu_buy:before {
      content: '\e93b';
    }
    .icon--menu_chats:before {
      content: '\e93c';
    }
    .icon--menu_contacts:before {
      content: '\e93d';
    }
    .icon--menu_wallets:before {
      content: '\e940';
    }
    .icon--menu_gallery:before {
      content: '\e903';
    }
    .icon--menu_editor:before {
      content: '\e908';
    }
  `}</style>
)
