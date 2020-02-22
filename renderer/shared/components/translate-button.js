/* eslint-disable react/prop-types */
import {FiGlobe, FiChevronRight} from 'react-icons/fi'
import {padding, margin} from 'polished'
import Box from './box'
import {FlatButton} from './button'
import theme, {rem} from '../theme'
import {Text} from './typo'
import Flex from './flex'

export function TranslateButon({text}) {
  return (
    <Box css={margin(rem(theme.spacings.medium24), 0, 0)}>
      <FlatButton
        color={theme.colors.primary}
        onClick={() =>
          global.openExternal(
            `https://translate.google.com/#view=home&op=translate&sl=auto&tl=${
              global.locale
            }&text=${encodeURIComponent(text)}`
          )
        }
      >
        <Flex align="center" css={{lineHeight: rem(18), ...padding(rem(2), 0)}}>
          <FiGlobe height={rem(12)} width={rem(12)} />
          <Text
            color={theme.colors.primary}
            fontWeight={500}
            css={{lineHeight: 1, ...margin(0, rem(4))}}
          >
            Translate
          </Text>
          <FiChevronRight height={rem(12)} width={rem(12)} />
        </Flex>
      </FlatButton>
    </Box>
  )
}

export function TranslateWords({words}) {
  return (
    <TranslateButon
      text={words.map(({name, desc}) => `${name}\n${desc}`).join('\n')}
    />
  )
}
