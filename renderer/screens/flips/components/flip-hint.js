import React from 'react'
import PropTypes from 'prop-types'
import {padding, margin} from 'polished'
import {FiRotateCcw} from 'react-icons/fi'
import {useTranslation} from 'react-i18next'
import theme, {rem} from '../../../shared/theme'
import {Box, BlockText, Text} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import {TranslateWords} from '../../../shared/components/translate-button'
import {FlatButton} from '../../../shared/components/button'

function FlipHint({hint, onChange}) {
  const {t} = useTranslation()
  const bntLabel = hint && hint.id >= 0 ? `(#${hint.id + 1})` : '(#1)'
  return (
    <Box>
      <Box
        bg={theme.colors.gray}
        css={{
          borderRadius: rem(8),
          ...padding(rem(32), 0, rem(32), rem(40)),
          ...margin(0, 'auto'),
          width: rem(560),
        }}
      >
        <Flex css={{minHeight: rem(40)}}>
          {hint.words &&
            hint.words.map(({name, desc}) => (
              <Box key={name} w={rem(220)} css={{...margin(0, rem(40), 0, 0)}}>
                <BlockText fontWeight={500}>{name}</BlockText>
                <BlockText color={theme.colors.muted}>{desc}</BlockText>
              </Box>
            ))}
        </Flex>
        <TranslateWords words={hint.words} />
      </Box>
      <Box w={rem(560)} css={margin(rem(theme.spacings.medium16), 'auto', 0)}>
        <FlatButton
          color={theme.colors.primary}
          css={{fontWeight: 500}}
          variant="secondary"
          onClick={onChange}
        >
          <Flex
            align="center"
            css={{lineHeight: rem(18), ...padding(rem(2), 0)}}
          >
            <FiRotateCcw height={rem(12)} width={rem(12)} />
            <Text
              color={theme.colors.primary}
              fontWeight={500}
              css={{lineHeight: 1, ...margin(0, 0, 0, rem(4))}}
            >
              {t('Change words')} {bntLabel}
            </Text>
          </Flex>
        </FlatButton>
      </Box>
    </Box>
  )
}

FlipHint.propTypes = {
  hint: PropTypes.object,
  onChange: PropTypes.func,
}

export default FlipHint
