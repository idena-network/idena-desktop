import React from 'react'
import PropTypes from 'prop-types'
import {rem, padding, margin} from 'polished'
import {useTranslation} from 'react-i18next'
import theme from '../../../shared/theme'
import {Box} from '../../../shared/components'
import Actions from '../../../shared/components/actions'
import IconLink from '../../../shared/components/icon-link'

export default function ContactToolbar({onRename, onDelete}) {
  const {t} = useTranslation()
  return (
    <Box
      py={theme.spacings.large}
      w={rem(700)}
      css={{
        ...padding(rem(theme.spacings.small8), 0),
        ...margin(rem(theme.spacings.medium16), 0),
      }}
    >
      <Actions>
        <IconLink disabled={onRename == null} onClick={onRename}>
          {t('Rename')}
        </IconLink>
        <IconLink
          disabled={onDelete == null}
          icon={<i className="icon icon--small_exit" />}
          onClick={onDelete}
        >
          {t('Delete')}
        </IconLink>

        <IconLink
          disabled={onKill == null}
          icon={<i className="icon icon--delete" />}
          onClick={() => {
            onKill()
          }}
        >
          Terminate
        </IconLink>
      </Actions>
    </Box>
  )
}

ContactToolbar.propTypes = {
  onRename: PropTypes.func,
  onDelete: PropTypes.func,
}
