import React from 'react'
import {rem} from 'polished'
import {Absolute, Box} from '.'
import {useChainState} from '../providers/chain-context'
import theme from '../theme'
import {useNotificationDispatch} from '../providers/notification-context'

function SyncStatus() {
  const {progress, alive} = useChainState()
  const {addError} = useNotificationDispatch()

  React.useEffect(() => {
    if (alive !== null && !alive) {
      addError({
        title: `Unable to connect to node`,
      })
    }
  }, [addError, alive, progress])

  if (progress === null || progress !== 1) {
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
