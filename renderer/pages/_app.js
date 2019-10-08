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
import useRpc from '../shared/hooks/use-rpc'
import {usePoll} from '../shared/hooks/use-interval'

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
            <div>
              <Spinner size={24} />
            </div>
            <div>Synchronizing...</div>
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
          section > div:first-child > div:first-child {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: ${rem(18, 13)};
            transform: scale(0.35);
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
  const [{result: peers}] = usePoll(useRpc('net_peers'), 1000)
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
            <span>Peers connected:</span> {(peers || []).length}
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
    <>
      <div className="loader-inner line-spin-fade-loader">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
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
          top: -10px;
          left: -4px;
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
          background-color: #fff;
          width: 4px;
          height: 35px;
          border-radius: 2px;
          margin: 2px;
          -webkit-animation-fill-mode: both;
          animation-fill-mode: both;
          position: absolute;
          width: 5px;
          height: 15px;
        }
      `}</style>
    </>
  )
}
