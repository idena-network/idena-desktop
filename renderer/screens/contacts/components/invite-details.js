/* eslint-disable no-nested-ternary */
import React, {useState, useCallback} from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import {Drawer, Field} from '../../../shared/components'
import theme from '../../../shared/theme'
import {
  useInviteDispatch,
  useInviteState,
} from '../../../shared/providers/invite-context'
import {mapToFriendlyStatus} from '../../../shared/providers/identity-context'

import ContactInfo from './contact-info'
import ContactToolbar from './contact-toolbar'
import {Figure} from '../../../shared/components/utils'
import RenameInvite from './invite-form'

import {useNotificationDispatch} from '../../../shared/providers/notification-context'

function InviteDetails({dbkey, onClose, onSelect}) {
  const [showRenameForm, setShowRenameForm] = useState(false)
  const {updateInvite, deleteInvite, recoverInvite} = useInviteDispatch()
  const {addNotificationWithAction} = useNotificationDispatch()

  const {invites} = useInviteState()

  const invite = invites && invites.find(({id}) => id === dbkey)
  const identity = invite && invite.identity

  const onDelteUndo = React.useCallback(() => {
    recoverInvite(dbkey)
    onSelect(invite)
  }, [dbkey, invite, onSelect, recoverInvite])

  if (!invite) return null

  const {key, receiver, canKill, mining, activated} = invite
  const inviteIsExpired =
    identity &&
    identity.state === 'Undefined' &&
    !canKill &&
    !mining &&
    !activated

  const state = inviteIsExpired
    ? 'Expired invitation'
    : identity && identity.state === 'Invite'
    ? 'Invitation'
    : mining
    ? 'Mining...'
    : identity && mapToFriendlyStatus(identity.state)

  return (
    <div style={{width: rem('700px')}}>
      <section>
        <ContactInfo {...invite} address={receiver} showMining={mining} />

        <ContactToolbar
          onRename={() => {
            setShowRenameForm(true)
          }}
          onDelete={() => {
            const id = dbkey
            deleteInvite(id)
            onClose()
            addNotificationWithAction({
              title: `Invitation deleted`,
              action: onDelteUndo,
              actionName: 'Undo',
            })
          }}
          onKill={
            canKill
              ? () => {
                  /* TODO */
                }
              : null
          }
        />

        <div>
          <Figure label="Status" value={state} />
          {identity &&
            identity.state !== 'Invite' &&
            !inviteIsExpired &&
            !mining && <Figure label="Address" value={receiver} />}

          {!inviteIsExpired && !activated && (
            <WideField
              label="Invitation code"
              defaultValue={key}
              disabled
              allowCopy={!activated}
            />
          )}
        </div>
      </section>

      <Drawer
        show={showRenameForm}
        onHide={() => {
          setShowRenameForm(false)
        }}
      >
        <RenameInvite
          {...invite}
          onSave={async (firstName, lastName) => {
            setShowRenameForm(false)
            const id = dbkey
            await updateInvite(id, firstName, lastName)
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
