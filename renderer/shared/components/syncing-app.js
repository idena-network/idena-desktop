import {rem} from 'polished'
import theme from '../theme'
import {useChainState} from '../providers/chain-context'
import {useIdentityState} from '../providers/identity-context'
import useRpc from '../hooks/use-rpc'
import {usePoll} from '../hooks/use-interval'
import Avatar from './avatar'
import {useNodeState, useNodeDispatch} from '../providers/node-context'
import {useAutoUpdateState} from '../providers/update-context'
import Flex from './flex'
import Box from './box'
import {GlobalModals} from './modal'
import {
  useSettingsState,
  useSettingsDispatch,
} from '../providers/settings-context'
import Button from './button'
import Link from './link'
import {BlockText} from './typo'

export default function SyncingApp() {
  return (
    <>
      <GlobalModals />
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
        <style jsx>{`
          section {
            background: rgb(69, 72, 77);
            color: white;
            display: flex;
            flex-direction: column;
            flex: 1;
            height: 100vh;
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
      </section>
    </>
  )
}

function SyncingIdentity() {
  const {currentBlock, highestBlock, wrongTime} = useChainState()
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
      {wrongTime && (
        <section>
          Please check you local clock. The time must be synchronized with
          internet time in order to have connections with other peers.
        </section>
      )}
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

function Spinner() {
  return (
    <>
      <div className="loader-inner line-spin-fade-loader">
        {Array.from({length: 8}, (_, i) => i).map(x => (
          <div key={`spinner-item-${x}`} />
        ))}
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

export function LoadingApp() {
  return (
    <>
      <GlobalModals />
      <section>
        <div>
          <h3>Please wait...</h3>
        </div>
        <style jsx>{`
          section {
            background: rgb(69, 72, 77);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
          }
          section > div {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-direction: column;
            width: 50%;
          }
        `}</style>
      </section>
    </>
  )
}

export function OfflineApp() {
  const {nodeReady, nodeFailed} = useNodeState()
  const {tryRestartNode} = useNodeDispatch()
  const {useExternalNode, runInternalNode} = useSettingsState()
  const {nodeProgress} = useAutoUpdateState()
  const {toggleRunInternalNode, toggleUseExternalNode} = useSettingsDispatch()
  return (
    <>
      <GlobalModals />
      <section>
        <div>
          {!nodeReady &&
            !useExternalNode &&
            runInternalNode &&
            !nodeFailed &&
            nodeProgress && (
              <>
                <Flex width="100%">
                  <img src="/static/idena_white.svg" alt="logo" />
                  <Flex direction="column" justify="space-between" flex="1">
                    <h2>Downloading Idena Node...</h2>

                    <Flex justify="space-between">
                      <div className="gray">Version {nodeProgress.version}</div>
                      <div>
                        {(
                          nodeProgress.transferred /
                          (1024 * 1024)
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{' '}
                        MB <span className="gray">out of</span>{' '}
                        {(nodeProgress.length / (1024 * 1024)).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          }
                        )}{' '}
                        MB
                      </div>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex width="100%" css={{marginTop: 10}}>
                  <progress value={nodeProgress.percentage} max={100} />
                </Flex>
              </>
            )}
          {(useExternalNode || !runInternalNode) && (
            <>
              <h2>Your {useExternalNode ? 'external' : ''} node is offline</h2>
              <br />
              <Box>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!runInternalNode) {
                      toggleRunInternalNode(true)
                    } else {
                      toggleUseExternalNode(false)
                    }
                  }}
                >
                  Run the built-in node
                </Button>
              </Box>
              <br />
              <BlockText color="white">
                If you have already node running, please check your connection{' '}
                <Link color={theme.colors.primary} href="/settings/node">
                  settings
                </Link>
              </BlockText>
            </>
          )}
          {!useExternalNode &&
            runInternalNode &&
            (nodeReady || (!nodeReady && !nodeFailed && !nodeProgress)) && (
              <h3>Idena Node is starting...</h3>
            )}
          {nodeFailed && !useExternalNode && (
            <>
              <h2>Your built-in node is failed</h2>
              <br />
              <Box>
                <Button variant="primary" onClick={tryRestartNode}>
                  Restart built-in node
                </Button>
              </Box>
              <br />
              <BlockText color="white">
                If problem still exists, restart your app or check your
                connection{' '}
                <Link color={theme.colors.primary} href="/settings/node">
                  settings
                </Link>{' '}
              </BlockText>
            </>
          )}
        </div>
        <style jsx>{`
          section {
            background: rgb(69, 72, 77);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
          }
          section > div {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-direction: column;
            width: 50%;
          }

          img {
            width: ${rem(60)};
            height: ${rem(60)};
            margin-right: ${rem(10)};
          }
          section .gray {
            opacity: 0.5;
          }
          progress {
            width: 100%;
            height: ${rem(4, theme.fontSizes.base)};
            background-color: rgba(0, 0, 0, 0.16);
          }
          progress::-webkit-progress-bar {
            background-color: rgba(0, 0, 0, 0.16);
          }
          progress::-webkit-progress-value {
            background-color: ${theme.colors.primary};
          }
          h2 {
            font-size: ${rem(18, theme.fontSizes.base)};
            font-weight: 500;
            margin: 0;
            word-break: break-all;
          }
          span {
            font-size: ${rem(14, theme.fontSizes.base)};
            line-height: ${rem(20, theme.fontSizes.base)};
          }
          li {
            margin-bottom: ${rem(theme.spacings.small8, theme.fontSizes.base)};
          }
        `}</style>
      </section>
    </>
  )
}
