import React from 'react'
import PropTypes from 'prop-types'
import {margin, padding, borderRadius, backgrounds} from 'polished'
import {useTranslation} from 'react-i18next'
import {SubHeading, FormGroup, Text, Box} from '../../../shared/components'
import theme, {rem} from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import Avatar from '../../../shared/components/avatar'
import useUsername from '../../../shared/hooks/use-username'

import useFullName from '../../../shared/hooks/use-full-name'

function ContactInfo({address, firstName, lastName, mining, showMining}) {
  const {t} = useTranslation()

  const fullName = useFullName({firstName, lastName})
  const username = useUsername({address})

  return (
    <Flex
      align="center"
      css={{
        ...margin(rem(theme.spacings.medium24), 0),
      }}
    >
      <Avatar username={username} />
      <Box my={rem(theme.spacings.medium24)}>
        <SubHeading>{fullName || username}</SubHeading>
        <Box>
          <Text color={theme.colors.muted} css={{wordBreak: 'break-all'}}>
            {address}
          </Text>

          {showMining && (
            <>
              <FormGroup css={margin(rem(theme.spacings.medium24), 0, 0)}>
                <Status mined={!mining}>
                  {' '}
                  {!mining ? t('Mined') : t('Mining...')}{' '}
                </Status>
              </FormGroup>
            </>
          )}
        </Box>
      </Box>
    </Flex>
  )
}

ContactInfo.propTypes = {
  address: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  mining: PropTypes.bool,
  showMining: PropTypes.bool,
}

// eslint-disable-next-line react/prop-types
function Status({mined, ...props}) {
  return (
    <Text
      css={{
        ...backgrounds(
          mined ? theme.colors.success02 : 'rgba(255, 163, 102, 0.12)'
        ),
        ...borderRadius('top', rem(12)),
        ...borderRadius('bottom', rem(12)),
        color: mined ? 'rgb(15, 205, 110)' : 'rgb(255, 163, 102)',
        ...padding(rem(theme.spacings.small8)),
      }}
      {...props}
    />
  )
}

export default ContactInfo
