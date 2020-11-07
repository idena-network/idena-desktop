/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {rem, position} from 'polished'
import {FiChevronRight} from 'react-icons/fi'

import {useTranslation} from 'react-i18next'
import {Stack, Icon} from '@chakra-ui/core'
import useClickOutside from '../../../shared/hooks/use-click-outside'

import {Box, Absolute} from '../../../shared/components'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'

FlipRatingTooltip.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export function FlipRatingTooltip({onClose}) {
  const {t} = useTranslation()

  const rewards = [
    `${t('Basic reward')}`,
    `${t('Reward')} x2`,
    `${t('Reward')} x4`,
    `${t('Reward')} x8`,
  ]

  const contextMenuRef = useRef()
  useClickOutside(contextMenuRef, () => {
    onClose()
  })

  return (
    <Box>
      <Flex>
        <Box css={position('relative')}>
          <Box ref={contextMenuRef} minWidth={400}>
            <Absolute bottom="100%" left={8} zIndex={100}>
              <Box
                style={{
                  border: '5px solid transparent',
                  borderTop: '5px solid #45484d',
                }}
              ></Box>
            </Absolute>

            <Absolute bottom="100%" left={-20} zIndex={100}>
              <Box
                style={{
                  marginBottom: rem(10),
                  padding: rem(12),
                  borderRadius: rem(12),
                  backgroundColor: '#45484d',
                  color: '#f5f5f5',
                }}
              >
                <Box
                  style={{
                    marginBottom: rem(12),
                    padding: rem(2),
                    fontSize: rem(12),
                  }}
                >
                  {t('Earn up to x8 extra rewards for secure flips')}
                </Box>
                {rewards.map((val, i) => (
                  <Flex inline marginBottom={rem(10)} key={i}>
                    <Box
                      style={{
                        inlineSize: 'max-content',
                        minWidth: rem(80),
                        padding: rem(3),
                        fontSize: rem(10),
                        color: '#a0a0a0',
                      }}
                    >
                      {val}
                    </Box>
                    <StarsRating rating={i + 1} blackAndWhite />
                  </Flex>
                ))}

                <Box
                  style={{
                    marginTop: rem(12),
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    global.openExternal(`https://idena.io/?view=secureflip`)
                  }}
                >
                  <Flex inline>
                    <Box
                      style={{
                        padding: rem(2),
                        fontSize: rem(10),
                      }}
                    >
                      {t('Read more about secure flips')}
                    </Box>
                    <FiChevronRight
                      style={{
                        marginTop: rem(3),
                      }}
                      fontSize={rem(13)}
                    />
                  </Flex>
                </Box>
              </Box>
            </Absolute>
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}

StarsRating.propTypes = {
  rating: PropTypes.number,
  blackAndWhite: PropTypes.bool,
}

export function StarsRating({rating = 0, blackAndWhite = false}) {
  return (
    <Stack
      backgroundColor={blackAndWhite ? '#45484d' : '#f5f5f5'}
      marginLeft={rem(6)}
      marginRight={rem(6)}
      borderRadius={rem(12)}
      isInline
      px={2}
      py={1}
    >
      <Flex>
        <StarRating isActive={rating > 0} blackAndWhite={blackAndWhite} />
        <StarRating isActive={rating > 1} blackAndWhite={blackAndWhite} />
        <StarRating isActive={rating > 2} blackAndWhite={blackAndWhite} />
        <StarRating isActive={rating > 3} blackAndWhite={blackAndWhite} />
      </Flex>
    </Stack>
  )
}

StarRating.propTypes = {
  isActive: PropTypes.bool,
  blackAndWhite: PropTypes.bool,
}

export function StarRating({isActive = true, blackAndWhite = false}) {
  const activeColor = blackAndWhite ? 'white' : theme.colors.primary
  const color = blackAndWhite ? '#525252' : 'gray.100'
  return (
    <Icon
      name="star"
      size={3}
      color={isActive ? activeColor : color}
      marginLeft={rem(3)}
      marginRight={rem(3)}
    />
  )
}
