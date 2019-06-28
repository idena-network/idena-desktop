import React from 'react'
import {rem} from 'polished'
import {Absolute, Box} from '../shared/components'
import {useSyncState} from '../shared/providers/sync-context'
import theme from '../shared/theme'

function SyncStatus() {
  const {syncing, progress} = useSyncState()

  if (!syncing || !Number.isFinite(progress)) {
    return null
  }

  return (
    <Absolute bg={theme.colors.primary} top={0} left={0} right={0}>
      <Box p={rem(theme.spacings.medium24)} css={{textAlign: 'center'}}>
        Syncing...{' '}
        {Number(progress).toLocaleString(undefined, {style: 'percent'})} done
      </Box>
    </Absolute>
  )
}

export default SyncStatus
