/* eslint-disable no-nested-ternary */
import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {Drawer, Field} from '../../../shared/components'
import theme from '../../../shared/theme'
import {
  useInviteDispatch,
  useInviteState,
} from '../../../shared/providers/invite-context'
import {mapToFriendlyStatus} from '../../../shared/providers/identity-context'
import ContactInfo from './contact-info'
import ContactToolbar from './contact-toolbar'
import {Figure} from '../../../shared/components/stat'
import RenameInvite from './invite-form'
import KillInvite from './kill-invite-form'
import {useNotificationDispatch} from '../../../shared/providers/notification-context'
import {toLocaleDna} from '../../../shared/utils/utils'

function InviteDetails({dbkey, onClose, onSelect}) {
  const {
    t,
    i18n: {language},
  } = useTranslation()
  const [showRenameForm, setShowRenameForm] = useState(false)
  const [showKillInviteForm, setShowKillInviteForm] = useState(false)
  const {updateInvite, deleteInvite, recoverInvite} = useInviteDispatch()
  const {addNotificationWithAction} = useNotificationDispatch()

  const {invites} = useInviteState()
  const invite = invites && invites.find(({id}) => id === dbkey)

  const identity = invite && invite.identity
  const stake = identity && identity.stake

  const onDeleteUndo = React.useCallback(() => {
    recoverInvite(dbkey)
    onSelect(invite)
  }, [dbkey, invite, onSelect, recoverInvite])

  if (!invite) {
    return null
  }

  const {key, receiver, canKill, mining, terminating, activated} = invite
  const inviteIsExpired =
    identity &&
    identity.state === 'Undefined' &&
    !canKill &&
    !mining &&
    !activated

  const state = inviteIsExpired
    ? t('Expired invitation')
    : identity && identity.state === 'Invite'
    ? t('Invitation')
    : mining
    ? t('Mining...')
    : terminating
    ? t('Terminating...')
    : identity && mapToFriendlyStatus(identity.state)

  const toDna = toLocaleDna(language)

  return (
    <div>
      <section>
        <ContactInfo {...invite} address={receiver} showMining={mining} />

        <ContactToolbar
          onRename={() => setShowRenameForm(true)}
          onDelete={() => {
            const id = dbkey
            deleteInvite(id)
            onClose()
            addNotificationWithAction({
              title: t(`Invitation deleted`),
              action: onDeleteUndo,
              actionName: 'Undo',
            })
          }}
          onKill={
            canKill
              ? () => {
                  setShowKillInviteForm(true)
                }
              : null
          }
        />

        <div>
          <Figure label={t('Status')} value={state} />
          {identity &&
            identity.state !== 'Invite' &&
            !inviteIsExpired &&
            !mining && <Figure label={t('Address')} value={receiver} />}

          {stake > 0 && <Figure label="Stake" value={toDna(stake)} />}

          {!inviteIsExpired && !activated && (
            <WideField
              label={t('Invitation code')}
              value={key}
              disabled
              allowCopy={!activated}
            />
          )}
        </div>
      </section>

      <Drawer show={showRenameForm} onHide={() => setShowRenameForm(false)}>
        <RenameInvite
          {...invite}
          onSave={async (firstName, lastName) => {
            setShowRenameForm(false)
            const id = dbkey
            await updateInvite(id, firstName, lastName)
          }}
        />
      </Drawer>

      <Drawer
        show={showKillInviteForm}
        onHide={() => {
          setShowKillInviteForm(false)
        }}
      >
        <KillInvite
          {...invite}
          state={state}
          stake={stake}
          onSuccess={async () => {
            setShowKillInviteForm(false)
          }}
          onFail={async () => {
            setShowKillInviteForm(false)
          }}
        />
      </Drawer>

      <style jsx>{`
        div {
          padding: 3em;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        section > div {
          background: ${theme.colors.gray};
          border-radius: 4px;
          padding: ${theme.spacings.xlarge};
        }
        div > section:nth-child(2) {
          display: flex;
          align-items: flex-end;
          flex: 1;
        }
      `}</style>
    </div>
  )
}

InviteDetails.propTypes = {
  dbkey: PropTypes.string,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
}

const WideField = props => <Field {...props} style={{width: '100%'}} />

export default InviteDetails
