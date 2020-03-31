import React, {useState, useRef, forwardRef} from 'react'
import NextLink from 'next/link'
import PropTypes from 'prop-types'
import {
  FiMoreVertical,
  FiEdit2,
  FiXCircle,
  FiUploadCloud,
  FiClock,
} from 'react-icons/fi'
import {position, borderRadius, backgrounds, padding, margin} from 'polished'
import {useTranslation} from 'react-i18next'
import theme, {rem} from '../../../shared/theme'
import FlipImage from './flip-image'
import {Box, Text, Link, Absolute, Tooltip} from '../../../shared/components'
import {composeHint, hasDataUrl} from '../utils/flip'
import Flex from '../../../shared/components/flex'
import {FlatButton} from '../../../shared/components/button'
import Divider from '../../../shared/components/divider'
import {useIdentityState} from '../../../shared/providers/identity-context'
import useClickOutside from '../../../shared/hooks/use-click-outside'
import useHover from '../../../shared/hooks/use-hover'
import {FlipType} from '../../../shared/utils/useFlips'
import {useChainState} from '../../../shared/providers/chain-context'
import IconLink from '../../../shared/components/icon-link'

// eslint-disable-next-line react/display-name
const FlipMenu = forwardRef((props, ref) => (
  <Box
    bg={theme.colors.white}
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

function FlipMenuItem({href, onClick, icon, disabled, ...props}) {
  const [hoverRef, isHovered] = useHover()
  return (
    <Box
      ref={hoverRef}
      px={theme.spacings.normal}
      py={theme.spacings.small}
      bg={isHovered ? theme.colors.gray : ''}
    >
      <Flex align="center">
        {React.cloneElement(icon, {
          style: {marginRight: theme.spacings.normal},
        })}
        {href ? (
          <Link href={href} {...props} />
        ) : (
          <FlatButton
            bg={isHovered ? theme.colors.gray : ''}
            disabled={disabled}
            onClick={onClick}
            {...props}
          />
        )}
      </Flex>
    </Box>
  )
}

FlipMenuItem.propTypes = {
  href: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  hovered: PropTypes.bool,
  disabled: PropTypes.bool,
}

function FlipCover({
  id,
  hint,
  pics,
  type,
  createdAt,
  modifiedAt,
  width,
  onSubmit,
  onDelete,
}) {
  const {t} = useTranslation()

  const {canSubmitFlip} = useIdentityState()
  const {syncing} = useChainState()

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuRef = useRef()

  useClickOutside(menuRef, () => {
    setIsMenuOpen(false)
  })

  const isDraft = type === FlipType.Draft
  const isPublished = type === FlipType.Published
  const isDeleting = type === FlipType.Deleting
  const isPending = isDeleting || type === FlipType.Publishing
  const canSubmit =
    global.isDev || (!syncing && canSubmitFlip && pics.every(hasDataUrl))

  return (
    <Box w={width} style={{...margin(0, rem(40), 0, 0)}}>
      <Box my={theme.spacings.small} css={position('relative')}>
        <FlipImage src={pics[0]} gradient={isPending} />
        {isPending && (
          <Absolute
            bottom="8px"
            left="8px"
            css={{
              ...backgrounds(theme.colors.white),
              ...borderRadius('top', '50%'),
              ...borderRadius('bottom', '50%'),
              lineHeight: 1,
              ...padding(0),
            }}
          >
            <Flex align="center">
              <FiClock
                color={theme.colors.white}
                fontSize={rem(24)}
                title={isDeleting ? t('Deleting...') : t('Mining...')}
              />
              <Text color={theme.colors.white} css={{paddingLeft: rem(4)}}>
                {isDeleting ? t('Deleting...') : t('Mining...')}
              </Text>
            </Flex>
          </Absolute>
        )}
      </Box>
      <Box my={theme.spacings.normal} css={{marginBottom: 0}} w="150px">
        <Flex justify="space-between" align="center">
          <FlipCardTitle>{composeHint(hint)}</FlipCardTitle>
          <Box css={position('relative')}>
            {(isDraft || isPublished) && (
              <FiMoreVertical
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                color={theme.colors.primary}
                style={{cursor: 'pointer'}}
                fontSize={theme.fontSizes.large}
              />
            )}
            {isDraft && isMenuOpen && (
              <Absolute top="2em" right={0} zIndex={2}>
                <FlipMenu ref={menuRef}>
                  <FlipMenuItem
                    href={`/flips/edit?id=${id}`}
                    icon={<FiEdit2 color={theme.colors.primary} />}
                  >
                    {t('Edit flip')}
                  </FlipMenuItem>
                  <FlipMenuItem
                    onClick={async () => {
                      setIsMenuOpen(false)
                      onSubmit()
                    }}
                    disabled={!canSubmit}
                    icon={<FiUploadCloud color={theme.colors.primary} />}
                  >
                    {t('Submit flip')}
                  </FlipMenuItem>
                  <Divider m={theme.spacings.small} />
                  <FlipMenuItem
                    onClick={() => {
                      setIsMenuOpen(false)
                      onDelete()
                    }}
                    icon={<FiXCircle color={theme.colors.danger} />}
                  >
                    {t('Delete flip')}
                  </FlipMenuItem>
                </FlipMenu>
              </Absolute>
            )}
            {isPublished && isMenuOpen && (
              <Absolute top="2em" right={0} zIndex={2}>
                <FlipMenu ref={menuRef}>
                  <FlipMenuItem
                    onClick={() => {
                      setIsMenuOpen(false)
                      onDelete()
                    }}
                    icon={<FiXCircle color={theme.colors.danger} />}
                  >
                    {t('Delete flip')}
                  </FlipMenuItem>
                </FlipMenu>
              </Absolute>
            )}
          </Box>
        </Flex>
      </Box>
      <Box>
        <FlipCardSubtitle>
          {new Date(modifiedAt || createdAt).toLocaleString()}
        </FlipCardSubtitle>
      </Box>
    </Box>
  )
}

FlipCover.propTypes = {
  id: PropTypes.string.isRequired,
  hint: PropTypes.object.isRequired,
  pics: PropTypes.arrayOf(PropTypes.string).isRequired,
  type: PropTypes.oneOf(Object.values(FlipType)),
  createdAt: PropTypes.number.isRequired,
  modifiedAt: PropTypes.number,
  width: PropTypes.string,
  onSubmit: PropTypes.func,
  onDelete: PropTypes.func,
}

// eslint-disable-next-line react/prop-types
export function MissingFlip({hint}) {
  const {t} = useTranslation()
  return (
    <Box
      style={{
        ...padding(rem(8), 0),
        width: '25%',
      }}
    >
      <EmptyFlipBox cursor="auto">
        <img src="/static/flips-cant-icn.svg" alt="Missing on client flip" />
      </EmptyFlipBox>
      <Box
        style={{
          ...margin(rem(16), 0, 0),
        }}
      >
        <FlipCardTitle>{composeHint(hint)}</FlipCardTitle>
        <FlipCardSubtitle>{t('Missing on client')}</FlipCardSubtitle>
      </Box>
    </Box>
  )
}

// eslint-disable-next-line react/prop-types
export function RequiredFlip({idx}) {
  const {t} = useTranslation()
  return (
    <Box
      style={{
        ...padding(rem(8), 0),
        width: '25%',
      }}
    >
      <NextLink href="/flips/new">
        <EmptyFlipBox hoverColor={theme.colors.primary}>
          <AddIcon />
        </EmptyFlipBox>
      </NextLink>
      <Box
        style={{
          ...margin(rem(16), 0, 0),
        }}
      >
        <FlipCardTitle>Flip #{idx + 1}</FlipCardTitle>
        <FlipCardSubtitle>{t('Required')}</FlipCardSubtitle>
      </Box>
    </Box>
  )
}

// eslint-disable-next-line react/prop-types
export function OptionalFlip({idx, disabled}) {
  const {t} = useTranslation()
  return (
    <Box
      style={{
        ...padding(rem(8), 0),
        width: '25%',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {disabled ? (
        <EmptyFlipBox>
          <Tooltip content={t('Create required flips first')}>
            <AddIcon />
          </Tooltip>
        </EmptyFlipBox>
      ) : (
        <NextLink href="/flips/new">
          <EmptyFlipBox>
            <EmptyFlipImage />
          </EmptyFlipBox>
        </NextLink>
      )}
      <Box
        style={{
          ...margin(rem(16), 0, 0),
        }}
      >
        <FlipCardTitle>Flip #{idx + 1}</FlipCardTitle>
        <FlipCardSubtitle>{t('Optional')}</FlipCardSubtitle>
      </Box>
    </Box>
  )
}

// eslint-disable-next-line react/prop-types
function EmptyFlipBox({cursor = 'pointer', hoverColor, ...props}) {
  return (
    <Flex
      justify="center"
      align="center"
      hoverColor={hoverColor}
      css={{
        border: `dashed 2px ${theme.colors.gray4}`,
        borderRadius: rem(8),
        color: theme.colors.muted,
        cursor,
        height: rem(150),
        width: rem(150),
      }}
      {...props}
    />
  )
}

function EmptyFlipImage() {
  return <IconLink href="/flips/new" icon={<AddIcon />}></IconLink>
}

// eslint-disable-next-line react/prop-types
function AddIcon() {
  return <i className="icon icon--add_btn" style={{fontSize: rem(40)}} />
}

function FlipCardTitle(props) {
  return (
    <Box>
      <Text fontWeight={500} style={{...margin(0, 0, '1px')}} {...props} />
    </Box>
  )
}

function FlipCardSubtitle(props) {
  return <Text color={theme.colors.muted} {...props} />
}

export default FlipCover
