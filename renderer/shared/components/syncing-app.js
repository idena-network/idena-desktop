import {margin} from 'polished'
import {useTranslation} from 'react-i18next'
import {Progress} from '@chakra-ui/core'
import theme, {rem} from '../theme'
import {useChainState} from '../providers/chain-context'
import {useIdentityState} from '../providers/identity-context'
import useRpc from '../hooks/use-rpc'
import {usePoll} from '../hooks/use-interval'
import Avatar from './avatar'
import {useNodeState, useNodeDispatch} from '../providers/node-context'
import {useAutoUpdateState} from '../providers/update-context'
import Flex from './flex'
import Box from './box'
import {
  useSettingsState,
  useSettingsDispatch,
} from '../providers/settings-context'
import Button from './button'
import Link from './link'
import {BlockText, SubHeading} from './typo'
import {Spinner} from './spinner'

export default function SyncingApp() {
  const {t} = useTranslation()
  return (
    <section>
      <div>
        <div>
          <Spinner />
        </div>
        <div>{t('Synchronizing...')}</div>
      </div>
      <div>
        <SyncingIdentity />
      </div>
      <style jsx>{`
        section {
          background: ${theme.colors.darkGraphite};
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
          line-height: ${rem(20)};
          padding: ${rem(12)};
          position: relative;
          text-align: center;
        }
        section > div:first-child > div:first-child {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: ${rem(18)};
          transform: scale(0.35) translateY(-8px);
        }
        section > div:nth-child(2) {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
      `}</style>
    </section>
  )
}

function SyncingIdentity() {
  const {currentBlock, highestBlock, genesisBlock, wrongTime} = useChainState()
  const {address} = useIdentityState()
  const [{result: peers}] = usePoll(useRpc('net_peers'), 1000)

  const {t} = useTranslation()

  const startingBlock = genesisBlock || 0

  return (
    <section>
      <section>
        <Avatar size={80} username={address} style={{marginRight: rem(24)}} />
        <div>
          <h2>{address}</h2>
          <h3>{address}</h3>
        </div>
      </section>
      <section>
        <h2>{t('Synchronizing blocks')}</h2>
        <div>
          <h3>
            {t('{{numBlocks}} blocks left', {
              numBlocks: highestBlock - currentBlock,
            })}{' '}
            (
            {t('{{currentBlock}} out of {{highestBlock}}', {
              currentBlock,
              highestBlock: highestBlock || '...',
            })}
            )
          </h3>
          <div>
            <span>{t('Peers connected')}:</span> {(peers || []).length}
          </div>
        </div>
        <Progress
          value={currentBlock}
          min={startingBlock}
          max={highestBlock}
          rounded="2px"
          bg="xblack.016"
          color="brandBlue"
          h={1}
          mt="11px"
        />
      </section>
      {wrongTime && (
        <section>
          {t(
            'Please check your local clock. The time must be synchronized with internet time in order to have connections with other peers.'
          )}
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

export function LoadingApp() {
  const {t} = useTranslation()
  return (
    <section>
      <div>
        <h3>{t('Please wait...')}</h3>
      </div>
      <style jsx>{`
        section {
          background: ${theme.colors.darkGraphite};
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
  )
}

export function OfflineApp() {
  const {nodeReady, nodeFailed} = useNodeState()
  const {tryRestartNode} = useNodeDispatch()
  const {useExternalNode, runInternalNode} = useSettingsState()
  const {nodeProgress} = useAutoUpdateState()
  const {toggleRunInternalNode, toggleUseExternalNode} = useSettingsDispatch()

  const {t} = useTranslation()

  return (
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
                  <h2>{t('Downloading Idena Node...')}</h2>

                  <Flex justify="space-between">
                    <div className="gray">
                      {t('Version {{version}}', {
                        version: nodeProgress.version,
                      })}
                    </div>
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
                <Progress
                  value={nodeProgress.percentage}
                  max={100}
                  rounded="2px"
                  bg="xblack.016"
                  color="brandBlue"
                  h={1}
                  mt="11px"
                />
              </Flex>
            </>
          )}
        {(useExternalNode || !runInternalNode) && (
          <Flex direction="column" css={{}}>
            <SubHeading
              color={theme.colors.white}
              fontSize={rem(18)}
              fontWeight={500}
              css={{
                ...margin(0, 0, rem(20)),
              }}
            >
              {t('Your {{nodeType}} node is offline', {
                nodeType: useExternalNode ? 'external' : '',
              })}
            </SubHeading>
            <Box style={{...margin(0, 0, rem(16))}}>
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
                {t('Run the built-in node')}
              </Button>
            </Box>
            <BlockText color={theme.colors.white05} css={{lineHeight: rem(20)}}>
              If you have already node running, please check your connection{' '}
              <Link color={theme.colors.primary} href="/settings/node">
                settings
              </Link>
            </BlockText>
          </Flex>
        )}
        {!useExternalNode &&
          runInternalNode &&
          (nodeReady || (!nodeReady && !nodeFailed && !nodeProgress)) && (
            <h3>{t('Idena Node is starting...')}</h3>
          )}
        {nodeFailed && !useExternalNode && (
          <>
            <h2>{t('Your built-in node is failed')}</h2>
            <br />
            <Box>
              <Button variant="primary" onClick={tryRestartNode}>
                {t('Restart built-in node')}
              </Button>
            </Box>
            <br />
            <BlockText color="white">
              If problem still exists, restart your app or check your connection{' '}
              <Link color={theme.colors.primary} href="/settings/node">
                settings
              </Link>{' '}
            </BlockText>
          </>
        )}
      </div>
      <style jsx>{`
        section {
          background: ${theme.colors.darkGraphite};
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
  )
}
