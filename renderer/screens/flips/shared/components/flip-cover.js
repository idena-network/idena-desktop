import React, {useState, useRef, forwardRef} from 'react'
import PropTypes from 'prop-types'
import {
  FiMoreVertical,
  FiEdit2,
  FiXCircle,
  FiUploadCloud,
  FiClock,
} from 'react-icons/fi'
import {position, borderRadius, backgrounds, padding, rem} from 'polished'
import useClickAway from 'react-use/lib/useClickAway'
import useHover from 'react-use/lib/useHover'
import theme from '../../../../shared/theme'
import FlipImage from './flip-image'
import {Box, Text, Link, Absolute} from '../../../../shared/components'
import {composeHint, hasDataUrl} from '../utils/flip'
import FlipType from '../types/flip-type'
import Flex from '../../../../shared/components/flex'
import {FlatButton} from '../../../../shared/components/button'
import Divider from '../../../../shared/components/divider'
import useCoinbaseAddress from '../../../../shared/utils/useCoinbaseAddress'
import useIdentity from '../../../../shared/utils/useIdentity'

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
  const item = hovered => (
    <Box
      px={theme.spacings.normal}
      py={theme.spacings.small}
      bg={hovered ? theme.colors.gray : ''}
    >
      <Flex align="center">
        {React.cloneElement(icon, {
          style: {marginRight: theme.spacings.normal},
        })}
        {href ? (
          <Link href={href} {...props} />
        ) : (
          <FlatButton
            bg={hovered ? theme.colors.gray : ''}
            disabled={disabled}
            onClick={onClick}
            {...props}
          />
        )}
      </Flex>
    </Box>
  )
  // eslint-disable-next-line no-unused-vars
  const [hoveredItem, hovered] = useHover(item)

  return hoveredItem
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
  mined,
  createdAt,
  modifiedAt,
  onDelete,
  onPublish,
  width,
}) {
  const address = useCoinbaseAddress()
  const {canSubmitFlip} = useIdentity(address)

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuRef = useRef()

  useClickAway(menuRef, () => {
    setIsMenuOpen(false)
  })

  const isDraft = type === FlipType.Draft
  const canSubmit = true || (canSubmitFlip && pics.every(hasDataUrl))
  return (
    <Box w={width}>
      <Box my={theme.spacings.small} css={position('relative')}>
        <FlipImage src={pics[0]} />
        {type === FlipType.Published && !mined && (
          <Absolute
            bottom="0"
            left="135px"
            css={{
              ...backgrounds(theme.colors.white),
              ...borderRadius('top', '50%'),
              ...borderRadius('bottom', '50%'),
              lineHeight: 1,
              ...padding(0),
            }}
          >
            <FiClock color={theme.colors.danger} fontSize={rem(24)} />
          </Absolute>
        )}
      </Box>
      <Box my={theme.spacings.normal} css={{marginBottom: 0}} w="150px">
        <Flex justify="space-between" align="center">
          <Text>{composeHint(hint)}</Text>
          <Box css={position('relative')}>
            {isDraft && (
              <FiMoreVertical
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                color={theme.colors.primary}
                style={{cursor: 'pointer'}}
                fontSize={theme.fontSizes.large}
              />
            )}
            {isDraft && isMenuOpen && (
              <Absolute top="2em" right={0}>
                <FlipMenu ref={menuRef}>
                  <FlipMenuItem
                    href={`/flips/edit?id=${id}`}
                    icon={<FiEdit2 color={theme.colors.primary} />}
                  >
                    Edit flip
                  </FlipMenuItem>
                  <FlipMenuItem
                    onClick={canSubmit ? () => onPublish() : null}
                    disabled={!canSubmit}
                    icon={<FiUploadCloud color={theme.colors.primary} />}
                  >
                    Submit flip
                  </FlipMenuItem>
                  <Divider m={theme.spacings.small} />
                  <FlipMenuItem
                    onClick={onDelete}
                    icon={<FiXCircle color={theme.colors.danger} />}
                  >
                    Delete flip
                  </FlipMenuItem>
                </FlipMenu>
              </Absolute>
            )}
          </Box>
        </Flex>
      </Box>
      <Box my={theme.spacings.small}>
        <Text color={theme.colors.muted}>
          {new Date(createdAt).toLocaleString()}
        </Text>
      </Box>
      <Box my={theme.spacings.small}>
        <Text color={theme.colors.muted} fontSize={theme.fontSizes.small}>
          Modified: {new Date(createdAt || modifiedAt).toLocaleString()}
        </Text>
      </Box>
    </Box>
  )
}

FlipCover.propTypes = {
  id: PropTypes.string.isRequired,
  hint: PropTypes.arrayOf(PropTypes.string).isRequired,
  pics: PropTypes.arrayOf(PropTypes.string).isRequired,
  type: PropTypes.oneOf(Object.values(FlipType)),
  mined: PropTypes.bool,
  createdAt: PropTypes.number.isRequired,
  modifiedAt: PropTypes.number.isRequired,
  onDelete: PropTypes.func,
  onPublish: PropTypes.func,
  width: PropTypes.string,
}

export default FlipCover
