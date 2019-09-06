/* eslint-disable no-nested-ternary */
import React, {useState} from 'react'
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

function InviteDetails({dbkey}) {
  const [showRenameForm, setShowRenameForm] = useState(false)
  const {updateInvite} = useInviteDispatch()

  const {invites} = useInviteState()
  const invite = invites && invites.find(({id}) => id === dbkey)
  const identity = invite && invite.identity

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
}

const WideField = props => <Field {...props} style={{width: '100%'}} />

export default InviteDetails
