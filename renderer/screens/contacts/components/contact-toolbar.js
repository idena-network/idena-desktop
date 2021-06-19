import React from 'react'
import {Box} from '@chakra-ui/core'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Actions from '../../../shared/components/actions'
import IconLink from '../../../shared/components/icon-link'

export default function ContactToolbar({onRename, onDelete, onKill, ...props}) {
  const {t} = useTranslation()
  return (
    <Box {...props}>
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
          onClick={onKill}
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
  onKill: PropTypes.func,
}
