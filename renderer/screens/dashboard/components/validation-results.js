import React from 'react'
import {useMachine} from '@xstate/react'

import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {Snackbar, Notification} from '../../../shared/components/notifications'
import {
  loadPersistentState,
  loadPersistentStateValue,
} from '../../../shared/utils/persist'
import {usePersistence} from '../../../shared/hooks/use-persistent-state'
import {NotificationType} from '../../../shared/providers/notification-context'
import {
  useIdentityState,
  IdentityStatus,
} from '../../../shared/providers/identity-context'
import {createTimerMachine} from '../../../shared/machines'
import {Spinner} from '../../../shared/components/spinner'
import {Box} from '../../../shared/components'
import theme, {rem} from '../../../shared/theme'
import Flex from '../../../shared/components/flex'

// eslint-disable-next-line react/prop-types
export function ValidationResultToast({epoch}) {
  const timerMachine = React.useMemo(
    () =>
      createTimerMachine(
        dayjs(loadPersistentStateValue('validationResults', epoch).epochStart)
          .add(1, 'minute')
          .diff(dayjs(), 'second')
      ),
    [epoch]
  )
  const [current] = useMachine(timerMachine)

  const [state, dispatch] = usePersistence(
    React.useReducer(
      (prevState, seen) => ({
        ...prevState,
        [epoch]: {
          ...prevState[epoch],
          seen,
        },
      }),
      loadPersistentState('validationResults') || {}
    ),
    'validationResults'
  )

  const {address, state: identityStatus} = useIdentityState()

  const isValidationSucceeded = [
    IdentityStatus.Newbie,
    IdentityStatus.Verified,
    IdentityStatus.Human,
  ].includes(identityStatus)

  const {t} = useTranslation()

  const url = `https://scan.idena.io/${
    isValidationSucceeded ? 'reward' : 'answers'
  }?epoch=${epoch}&identity=${address}`

  const notSeen =
    typeof state[epoch] === 'boolean'
      ? !state[epoch]
      : state[epoch] && !state[epoch].seen

  return notSeen ? (
    <Snackbar>
      {current.matches('running') && (
        <Notification
          pinned
          type={NotificationType.Info}
          icon={
            <Flex
              align="center"
              justify="center"
              css={{
                height: rem(20),
                width: rem(20),
                marginRight: rem(12),
              }}
            >
              <Box style={{transform: 'scale(0.35) translateY(-10px)'}}>
                <Spinner color={theme.colors.primary} />
              </Box>
            </Flex>
          }
          title={t('Please wait for the validation report')}
        />
      )}
      {current.matches('stopped') && (
        <Notification
          pinned
          type={NotificationType.Info}
          title={
            isValidationSucceeded
              ? t('See your validation rewards in the blockchain explorer')
              : t('See your validation results in the blockchain explorer')
          }
          action={() => {
            dispatch(true)
            global.openExternal(url)
          }}
          actionName={t('Open')}
        />
      )}
    </Snackbar>
  ) : null
}
