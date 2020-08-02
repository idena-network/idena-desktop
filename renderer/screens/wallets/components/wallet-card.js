import React, {forwardRef, useState, useRef} from 'react'
import PropTypes from 'prop-types'
import {MdMoreVert} from 'react-icons/md'

import {margin, position, borderRadius} from 'polished'
import {useTranslation} from 'react-i18next'
import {useColorMode} from '@chakra-ui/core'
import useClickOutside from '../../../shared/hooks/use-click-outside'
import {Box, Link, Absolute} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme, {rem} from '../../../shared/theme'
import {FlatButton} from '../../../shared/components/button'

import Divider from '../../../shared/components/divider'
import useHover from '../../../shared/hooks/use-hover'

// eslint-disable-next-line react/display-name
const WalletMenu = forwardRef((props, ref) => (
  <Box
    py={theme.spacings.small}
    css={{
      ...borderRadius('top', '10px'),
      ...borderRadius('bottom', '10px'),
      boxShadow:
        '0 4px 6px 0 rgba(83, 86, 92, 0.24), 0 0 2px 0 rgba(83, 86, 92, 0.2)',
    }}
    w="145px"
    ref={ref}
    {...props}
  />
))

function WalletMenuItem({href, onClick, icon, danger, disabled, ...props}) {
  const [hoverRef, isHovered] = useHover()
  const {colorMode} = useColorMode()
  return (
    <Box
      ref={hoverRef}
      px={theme.spacings.normal}
      py={theme.spacings.small}
      bg={isHovered ? theme.colors[colorMode].gray : ''}
    >
      <Flex align="center" onClick={disabled ? null : onClick}>
        {React.cloneElement(icon, {
          style: {
            marginRight: theme.spacings.normal,
            color: danger ? theme.colors.danger : theme.colors.primary,
            opacity: disabled ? 0.5 : 1,
          },
        })}
        {href ? (
          <Link href={href} {...props} />
        ) : (
          <FlatButton
            bg={isHovered ? theme.colors.gray : ''}
            disabled={disabled}
            color={theme.colors[colorMode].text}
            {...props}
          />
        )}
      </Flex>
    </Box>
  )
}

WalletMenuItem.propTypes = {
  href: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  danger: PropTypes.bool,
  hovered: PropTypes.bool,
  disabled: PropTypes.bool,
}

function WalletCard({wallet, main, onSend, onReceive, onWithdrawStake}) {
  const {name, balance, isStake} = wallet

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef()

  useClickOutside(menuRef, () => {
    setIsMenuOpen(false)
  })

  const {t} = useTranslation()

  const {colorMode} = useColorMode()

  return (
    <Box
      bg={main ? theme.colors.primary : theme.colors[colorMode].gray}
      color={main ? theme.colors.white : theme.colors[colorMode].text}
      padding={rem(theme.spacings.medium16)}
      style={{
        borderRadius: rem(8),
        minWidth: rem(195),
        position: 'relative',
        ...margin(0, theme.spacings.medium24, 0, 0),
      }}
      w={rem(315)}
    >
      <div className="title">
        <div className="icn">
          {isStake ? (
            <i className="icon icon--small_lock" />
          ) : (
            <i className="icon icon--small_balance" />
          )}
        </div>
        {name.length > 20 ? `${name.substr(0, 20)}...` : name}
      </div>

      <div className="action">
        <MdMoreVert
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{cursor: 'pointer'}}
        />
      </div>

      <Box my={theme.spacings.normal} css={{marginBottom: 0}} w="150px">
        <Flex justify="space-between" align="center">
          <Box css={position('fixed')}>
            {isMenuOpen && (
              <Absolute top="-1.5em" right="-16em" zIndex={2}>
                <WalletMenu
                  ref={menuRef}
                  bg={
                    colorMode === 'light'
                      ? theme.colors.white
                      : theme.colors.black
                  }
                >
                  <WalletMenuItem
                    onClick={async () => {
                      setIsMenuOpen(false)
                      onSend(wallet)
                    }}
                    disabled={isStake}
                    icon={<i className="icon icon--withdraw" />}
                  >
                    {t('Send')}
                  </WalletMenuItem>
                  <WalletMenuItem
                    onClick={async () => {
                      setIsMenuOpen(false)
                      onReceive(wallet)
                    }}
                    disabled={isStake}
                    icon={<i className="icon icon--deposit" />}
                  >
                    {t('Receive')}
                  </WalletMenuItem>
                  {isStake && <Divider m={theme.spacings.small} />}

                  {isStake && (
                    <WalletMenuItem
                      onClick={async () => {
                        setIsMenuOpen(false)
                        onWithdrawStake(wallet)
                      }}
                      disabled={!isStake}
                      danger
                      icon={<i className="icon icon--delete" />}
                    >
                      {t('Terminate')}
                    </WalletMenuItem>
                  )}
                </WalletMenu>
              </Absolute>
            )}
          </Box>
        </Flex>
      </Box>

      <div
        className="balance"
        style={{color: main ? theme.colors.white : theme.colors.muted}}
      >
        {t('Balance')}
      </div>
      <div className="value">{balance} DNA</div>
      <style jsx>{`
        .title {
          margin-bottom: ${rem(17)};
          font-weight: 500;
        }
        .icn {
          display: inline-block;
          vertical-align: middle;
          margin: 0 ${rem(10)} 0 0;
        }
        .value {
          word-wrap: break-word;
          font-size: ${rem(17)};
          line-height: ${rem(24)};
          font-weight: 500;
        }
        .action {
          padding: ${rem(5)};
          font-size: ${rem(20)};
          position: absolute;
          top: ${rem(10)};
          right: ${rem(8)};
          cursor: pointer;
        }
      `}</style>
    </Box>
  )
}

WalletCard.propTypes = {
  wallet: PropTypes.object,
  main: PropTypes.bool,

  onSend: PropTypes.func,
  onReceive: PropTypes.func,
  onWithdrawStake: PropTypes.func,
}

export default WalletCard
