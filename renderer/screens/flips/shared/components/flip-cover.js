import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {FiMoreVertical, FiEdit2, FiXCircle} from 'react-icons/fi'
import {position, borderRadius} from 'polished'
import theme from '../../../../shared/theme'
import FlipImage from './flip-image'
import {Box, Text, Link, Absolute} from '../../../../shared/components'
import {composeHint} from '../utils/flip'
import FlipType from '../types/flip-type'
import Flex from '../../../../shared/components/flex'
import {FlatButton} from '../../../../shared/components/button'

function FlipMenu(props) {
  return (
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
      {...props}
    />
  )
}

function FlipMenuItem({href, onClick, icon, ...props}) {
  return (
    <Box p={theme.spacings.normal}>
      <Flex align="center">
        {React.cloneElement(icon, {
          style: {marginRight: theme.spacings.normal},
        })}
        {href ? (
          <Link href={href} {...props} />
        ) : (
          <FlatButton onClick={onClick} {...props} />
        )}
      </Flex>
    </Box>
  )
}

function FlipMenuSeparator() {
  return <Box bg={theme.colors.gray2} w="100%" css={{height: '1px'}} />
}

FlipMenuItem.propTypes = {
  href: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.node,
}

function FlipCover({id, hint, pics, type, createdAt, onDelete, width}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isDraft = type === FlipType.Draft
  return (
    <Box w={width}>
      <Box my={theme.spacings.small}>
        <FlipImage src={pics[0]} />
      </Box>
      <Box my={theme.spacings.normal} css={{marginBottom: 0}} w="150px">
        <Flex justify="space-between" align="center">
          <Text>{composeHint(hint)}</Text>
          <Box css={position('relative')}>
            <FiMoreVertical
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              color={theme.colors.primary}
              style={{cursor: 'pointer'}}
              fontSize={theme.fontSizes.large}
            />
            {isMenuOpen && (
              <Absolute top="2em" right={0}>
                <FlipMenu>
                  {isDraft && (
                    <FlipMenuItem
                      href={`/flips/edit?id=${id}`}
                      icon={<FiEdit2 color={theme.colors.primary} />}
                    >
                      Edit flip
                    </FlipMenuItem>
                  )}
                  <FlipMenuSeparator />
                  {isDraft && (
                    <FlipMenuItem
                      onClick={onDelete}
                      icon={<FiXCircle color={theme.colors.danger} />}
                    >
                      Delete flip
                    </FlipMenuItem>
                  )}
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
      <Box />
    </Box>
  )
}

FlipCover.propTypes = {
  id: PropTypes.string.isRequired,
  hint: PropTypes.arrayOf(PropTypes.string).isRequired,
  pics: PropTypes.arrayOf(PropTypes.string).isRequired,
  type: PropTypes.shape(FlipType),
  createdAt: PropTypes.number.isRequired,
  onDelete: PropTypes.func,
  width: PropTypes.string,
}

export default FlipCover
