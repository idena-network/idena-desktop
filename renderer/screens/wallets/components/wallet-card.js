import React, {forwardRef, useState, useRef} from 'react'
import PropTypes from 'prop-types'
import {MdMoreVert} from 'react-icons/md'

import {margin, position, borderRadius, rem} from 'polished'
import useClickOutside from '../../../shared/hooks/use-click-outside'
import {Box, Link, Absolute} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'
import {FlatButton} from '../../../shared/components/button'

import Divider from '../../../shared/components/divider'
import useHover from '../../../shared/hooks/use-hover'

// eslint-disable-next-line react/display-name
const WalletMenu = forwardRef((props, ref) => (
  <Box
    bg={theme.colors.white}
    py={rem(theme.spacings.small8)}
    css={{
      ...borderRadius('top', '8px'),
      ...borderRadius('bottom', '8px'),
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
  return (
    <Box ref={hoverRef}>
      <Flex align="center" onClick={disabled ? null : onClick}>
        {href ? (
          <>
            {React.cloneElement(icon, {
              style: {
                marginRight: theme.spacings.normal,
                color: danger ? theme.colors.danger : theme.colors.primary,
                opacity: disabled ? 0.5 : 1,
              },
            })}
            <Link href={href} {...props} />
          </>
        ) : (
          <FlatButton
            disabled={disabled}
            icon={icon}
            style={{
              fontWeight: 500,
              borderRadius: 0,
              display: 'block',
              width: '100%',
              textAlign: 'left',
              paddingTop: theme.spacings.small8,
              paddingBottom: theme.spacings.small8,
              paddingLeft: theme.spacings.normal,
              paddingRight: theme.spacings.normal,
              backgroundColor: isHovered ? theme.colors.gray : '',
            }}
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

  return (
    <Box
      bg={main ? theme.colors.primary : theme.colors.gray}
      color={main ? theme.colors.white : theme.colors.primary2}
      padding={rem(theme.spacings.medium16)}
      style={{
        borderRadius: rem(8),
        width: rem(232),
        minWidth: rem(232),
        height: '100%',
        position: 'relative',
        zIndex: main ? 1 : 0,
        ...margin(0, theme.spacings.medium24, 0, 0),
      }}
      w={rem(295)}
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
        <span className="action-icon">
          <MdMoreVert
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{cursor: 'pointer'}}
          />
        </span>
        <Flex justify="space-between" align="center">
          <Box css={position('fixed')}>
            {isMenuOpen && (
              <Absolute
                top="100%"
                right="-17px"
                zIndex={2}
                css={{marginTop: '5px'}}
              >
                <WalletMenu ref={menuRef}>
                  <WalletMenuItem
                    onClick={async () => {
                      setIsMenuOpen(false)
                      onSend(wallet)
                    }}
                    disabled={isStake}
                    icon="withdraw"
                  >
                    Send
                  </WalletMenuItem>
                  <WalletMenuItem
                    onClick={async () => {
                      setIsMenuOpen(false)
                      onReceive(wallet)
                    }}
                    disabled={isStake}
                    icon="deposit"
                  >
                    Receive
                  </WalletMenuItem>
                  {// TODO kill identity action
                  false && isStake && <Divider m={theme.spacings.small} />}

                  {// TODO kill identity action
                  false && isStake && (
                    <WalletMenuItem
                      onClick={async () => {
                        setIsMenuOpen(false)
                        onWithdrawStake(wallet)
                      }}
                      disabled={!isStake}
                      danger
                      icon="delete"
                    >
                      Withdraw
                    </WalletMenuItem>
                  )}
                </WalletMenu>
              </Absolute>
            )}
          </Box>
        </Flex>
      </div>

      <div
        className="balance"
        style={{color: main ? theme.colors.white : theme.colors.muted}}
      >
        Balance
      </div>
      <div className="value">
        <span>{balance}</span>
        DNA
      </div>
      <style jsx>{`
        .title {
          margin-bottom: ${rem(25)};
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
        .value span {
          max-width: calc(100% - 40px);
          overflow: hidden;
          display: inline-block;
          vertical-align: bottom;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 3px;
         }
        .action {
          padding: ${rem(5)};
          position: absolute;
          top: ${rem(10)};
          right: ${rem(8)};
          cursor: pointer;
        }
        .action-icon {
          font-size: ${rem(20)};
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
