import React from 'react'
import NextApp, {Container} from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'
import {rem} from 'polished'
import GlobalStyle from '../shared/components/global-style'
import {EpochProvider} from '../shared/providers/epoch-context'
import {
  IdentityProvider,
  useIdentityState,
} from '../shared/providers/identity-context'
import {NotificationProvider} from '../shared/providers/notification-context'
import {TimingProvider} from '../shared/providers/timing-context'
import {ChainProvider, useChainState} from '../shared/providers/chain-context'
import {ValidationProvider} from '../shared/providers/validation-context'
import {List} from '../shared/components'
import {Version, NavItem, Logo} from '../shared/components/sidebar'
import theme from '../shared/theme'
import Avatar from '../shared/components/avatar'
// import Spinner from '../screens/validation/components/spinner'

Router.events.on('routeChangeStart', () => {
  NProgress.start()
})

Router.events.on('routeChangeComplete', () => {
  NProgress.done()
})

Router.events.on('routeChangeError', () => {
  NProgress.done()
})

export default class MyApp extends NextApp {
  render() {
    const {Component, pageProps} = this.props
    return (
      <Container>
        <GlobalStyle />
        <AppShell>
          <Component {...pageProps} />
        </AppShell>
      </Container>
    )
  }
}

function AppShell(props) {
  return (
    <ChainProvider>
      <App {...props} />
    </ChainProvider>
  )
}

function App(props) {
  const {syncing} = useChainState()
  return syncing || syncing == null ? <SyncingApp /> : <SyncedApp {...props} />
}

function SyncingApp() {
  return (
    <IdentityProvider>
      <main>
        <nav>
          <div>
            <Logo />
            <List>
              <NavItem
                href="/contacts"
                icon={<i className="icon icon--menu_contacts" />}
              >
                Contacts
              </NavItem>
              <NavItem
                href="/settings"
                icon={<i className="icon icon--settings" />}
              >
                Settings
              </NavItem>
            </List>
          </div>
          <div>
            <Version updateReady={() => {}} updateLoadingPercent={() => {}} />
          </div>
        </nav>
        <section>
          <div>
            <Spinner size={24} />
            <span>Synchronizing...</span>
          </div>
          <div>
            <SyncingIdentity />
          </div>
        </section>
        <style jsx>{`
          main {
            display: flex;
            padding: 0;
            margin: 0;
            max-height: 100vh;
            overflow: hidden;
          }
          section {
            background: #333;
            color: white;
            display: flex;
            flex-direction: column;
            flex: 1;
          }
          nav {
            background: ${theme.colors.primary2};
            color: ${theme.colors.white};
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100vh;
            padding: ${rem(16)};
            width: ${rem(250)};
            position: relative;
            z-index: 2;
          }
          nav > div:first-child {
            display: flex;
            flex-direction: column;
          }

          .icon {
            margin-left: -4px;
            margin-top: -4px;
            margin-bottom: -3px;
            position: relative;
            top: 1px;
          }
          section > div:first-child {
            background: rgb(255, 163, 102);
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: ${rem(20, 13)};
            padding: ${rem(12, 13)};
            position: relative;
            text-align: center;
          }
          section > div:first-child > span {
            margin-left: ${rem(8, 13)};
          }
          section > div:nth-child(2) {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
          }
        `}</style>
      </main>
    </IdentityProvider>
  )
}

function SyncingIdentity() {
  const {currentBlock, highestBlock} = useChainState()
  const {address} = useIdentityState()
  return (
    <section>
      <section>
        <Avatar
          size={80}
          username={address}
          style={{marginRight: rem(24, theme.fontSizes.base)}}
        />
        <div>
          <h2>{address}</h2>
          <h3>{address}</h3>
        </div>
      </section>
      <section>
        <h2>Synchronizing blocks</h2>
        <div>
          <h3>
            {currentBlock} out of {highestBlock}
          </h3>
          <div>
            <span>Peers connected:</span> 4
          </div>
        </div>
        <progress value={currentBlock} max={highestBlock} />
      </section>
      <section>
        Can not connet to Idena Node. Please make sure the node is running or
        check connection settings.
      </section>
      <style jsx>{`
        section > section {
          margin-bottom: ${rem(40, theme.fontSizes.base)};
          max-width: ${rem(480, theme.fontSizes.base)};
        }
        section > section:first-child {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        h2 {
          font-size: ${rem(18, theme.fontSizes.base)};
          font-weight: 500;
          margin: 0;
          word-break: break-all;
        }
        h3 {
          color: rgba(255, 255, 255, 0.5);
          font-size: ${rem(14, theme.fontSizes.base)};
          font-weight: normal;
          line-height: ${rem(20, theme.fontSizes.base)};
          margin: 0;
          margin-top: ${rem(9, theme.fontSizes.base)};
        }
        section:nth-child(2) {
          display: block;
        }

        section:nth-child(2) h3 {
          margin-top: ${rem(5, theme.fontSizes.base)};
        }
        section:nth-child(2) > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        section:nth-child(2) > div > div {
          font-size: ${rem(13, theme.fontSizes.base)};
          line-height: ${rem(20, theme.fontSizes.base)};
        }
        section:nth-child(2) span {
          color: rgba(255, 255, 255, 0.5);
        }
        progress {
          margin-top: ${rem(11, theme.fontSizes.base)};
          width: 100%;
        }
        section:nth-child(3) {
          padding: ${rem(18, theme.fontSizes.base)}
            ${rem(24, theme.fontSizes.base)};
          background: rgb(255, 102, 102);
          border-radius: ${rem(9, theme.fontSizes.base)};
          font-size: ${rem(14, 13)};
          line-height: ${rem(20, 13)};
        }
      `}</style>
    </section>
  )
}

function SyncedApp(props) {
  return (
    <TimingProvider>
      <NotificationProvider>
        <EpochProvider>
          <IdentityProvider>
            <ValidationProvider {...props} />
          </IdentityProvider>
        </EpochProvider>
      </NotificationProvider>
    </TimingProvider>
  )
}

function Spinner() {
  return (
    <div className="sk-fading-circle">
      <div className="sk-circle1 sk-circle" />
      <div className="sk-circle2 sk-circle" />
      <div className="sk-circle3 sk-circle" />
      <div className="sk-circle4 sk-circle" />
      <div className="sk-circle5 sk-circle" />
      <div className="sk-circle6 sk-circle" />
      <div className="sk-circle7 sk-circle" />
      <div className="sk-circle8 sk-circle" />
      <div className="sk-circle9 sk-circle" />
      <div className="sk-circle10 sk-circle" />
      <div className="sk-circle11 sk-circle" />
      <div className="sk-circle12 sk-circle" />
      <style jsx>{`
        .sk-fading-circle {
          width: 20px;
          height: 20px;
          position: relative;
        }

        .sk-fading-circle .sk-circle {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
        }

        .sk-fading-circle .sk-circle:before {
          content: '';
          display: block;
          margin: 0 auto;
          width: 15%;
          height: 15%;
          background-color: #fff;
          border-radius: 100%;
          -webkit-animation: sk-circleFadeDelay 1.2s infinite ease-in-out both;
          animation: sk-circleFadeDelay 1.2s infinite ease-in-out both;
        }
        .sk-fading-circle .sk-circle2 {
          -webkit-transform: rotate(30deg);
          -ms-transform: rotate(30deg);
          transform: rotate(30deg);
        }
        .sk-fading-circle .sk-circle3 {
          -webkit-transform: rotate(60deg);
          -ms-transform: rotate(60deg);
          transform: rotate(60deg);
        }
        .sk-fading-circle .sk-circle4 {
          -webkit-transform: rotate(90deg);
          -ms-transform: rotate(90deg);
          transform: rotate(90deg);
        }
        .sk-fading-circle .sk-circle5 {
          -webkit-transform: rotate(120deg);
          -ms-transform: rotate(120deg);
          transform: rotate(120deg);
        }
        .sk-fading-circle .sk-circle6 {
          -webkit-transform: rotate(150deg);
          -ms-transform: rotate(150deg);
          transform: rotate(150deg);
        }
        .sk-fading-circle .sk-circle7 {
          -webkit-transform: rotate(180deg);
          -ms-transform: rotate(180deg);
          transform: rotate(180deg);
        }
        .sk-fading-circle .sk-circle8 {
          -webkit-transform: rotate(210deg);
          -ms-transform: rotate(210deg);
          transform: rotate(210deg);
        }
        .sk-fading-circle .sk-circle9 {
          -webkit-transform: rotate(240deg);
          -ms-transform: rotate(240deg);
          transform: rotate(240deg);
        }
        .sk-fading-circle .sk-circle10 {
          -webkit-transform: rotate(270deg);
          -ms-transform: rotate(270deg);
          transform: rotate(270deg);
        }
        .sk-fading-circle .sk-circle11 {
          -webkit-transform: rotate(300deg);
          -ms-transform: rotate(300deg);
          transform: rotate(300deg);
        }
        .sk-fading-circle .sk-circle12 {
          -webkit-transform: rotate(330deg);
          -ms-transform: rotate(330deg);
          transform: rotate(330deg);
        }
        .sk-fading-circle .sk-circle2:before {
          -webkit-animation-delay: -1.1s;
          animation-delay: -1.1s;
        }
        .sk-fading-circle .sk-circle3:before {
          -webkit-animation-delay: -1s;
          animation-delay: -1s;
        }
        .sk-fading-circle .sk-circle4:before {
          -webkit-animation-delay: -0.9s;
          animation-delay: -0.9s;
        }
        .sk-fading-circle .sk-circle5:before {
          -webkit-animation-delay: -0.8s;
          animation-delay: -0.8s;
        }
        .sk-fading-circle .sk-circle6:before {
          -webkit-animation-delay: -0.7s;
          animation-delay: -0.7s;
        }
        .sk-fading-circle .sk-circle7:before {
          -webkit-animation-delay: -0.6s;
          animation-delay: -0.6s;
        }
        .sk-fading-circle .sk-circle8:before {
          -webkit-animation-delay: -0.5s;
          animation-delay: -0.5s;
        }
        .sk-fading-circle .sk-circle9:before {
          -webkit-animation-delay: -0.4s;
          animation-delay: -0.4s;
        }
        .sk-fading-circle .sk-circle10:before {
          -webkit-animation-delay: -0.3s;
          animation-delay: -0.3s;
        }
        .sk-fading-circle .sk-circle11:before {
          -webkit-animation-delay: -0.2s;
          animation-delay: -0.2s;
        }
        .sk-fading-circle .sk-circle12:before {
          -webkit-animation-delay: -0.1s;
          animation-delay: -0.1s;
        }

        @-webkit-keyframes sk-circleFadeDelay {
          0%,
          39%,
          100% {
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
        }

        @keyframes sk-circleFadeDelay {
          0%,
          39%,
          100% {
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
