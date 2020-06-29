import React from 'react'
import PropTypes from 'prop-types'
import {FiUsers} from 'react-icons/fi'
import {useTranslation} from 'react-i18next'
import {useDisclosure, useToast} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import {Box, Placeholder} from '../../../shared/components'
import Layout from '../../../shared/components/layout'
import Flex from '../../../shared/components/flex'
import ContactDetails from './contact-details'
import {ContactProvider} from '../../../shared/providers/contact-context'
import Sidebar from './sidebar'
import InviteDetails from './invite-details'
import {useChainState} from '../../../shared/providers/chain-context'
import {IssueInviteDrawer, IssueInviteForm} from '../../app/components'
import {useEpochState} from '../../../shared/providers/epoch-context'
import {Toast} from '../../../shared/components/components'
import {invitesMachine} from '../../../shared/machines'

function ContactsPage() {
  const {t} = useTranslation()

  const {syncing, offline, loading} = useChainState()
  const epoch = useEpochState()

  const [selectedContact, setSelectedContact] = React.useState(null)
  const [selectedInvite, setSelectedInvite] = React.useState(null)
  const [showInvite, setShowInvite] = React.useState(false)
  const [showContact] = React.useState(false)

  const {
    isOpen: isOpenInviteForm,
    onOpen: onOpenInviteForm,
    onClose: onCloseInviteForm,
  } = useDisclosure()

  const toast = useToast()

  const [, send] = useMachine(invitesMachine, {
    context: {
      epoch: epoch?.epoch,
    },
    actions: {
      onInviteSubmitted: (_, {hash}) => {
        toast({
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast title={t('Invitation code created')} description={hash} />
          ),
        })
        onCloseInviteForm()
      },
      onSubmitInviteFailed: (_, {error}) =>
        toast({
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast
              title={error?.message ?? t('Something went wrong')}
              status="error"
            />
          ),
        }),
    },
  })

  return (
    <ContactProvider>
      <Layout syncing={syncing} offline={offline} loading={loading}>
        <Flex>
          <Sidebar
            onSelectContact={setSelectedContact}
            onSelectInvite={invite => {
              setSelectedInvite(invite)
              setShowInvite(true)
            }}
            onNewInvite={onOpenInviteForm}
          />
          <Box
            css={{
              flexBasis: 0,
              flexGrow: 1,
            }}
          >
            {showInvite && (
              <InviteDetails
                dbkey={selectedInvite.id}
                code={selectedInvite && selectedInvite.key}
                onClose={() => {
                  setShowInvite(false)
                  setSelectedInvite(null)
                }}
                onSelect={invite => {
                  setShowInvite(true)
                  setSelectedInvite(invite)
                }}
              />
            )}

            {showContact && <ContactDetails {...selectedContact} />}

            {!showContact && !showInvite && !selectedInvite && (
              <Placeholder
                icon={<FiUsers />}
                text={
                  <>
                    {t('You haven’t selected contacts yet.')} <br />
                  </>
                }
              />
            )}
          </Box>

          <IssueInviteDrawer
            isOpen={isOpenInviteForm}
            onClose={onCloseInviteForm}
          >
            <IssueInviteForm
              onIssueInvite={async invite => send('ISSUE_INVITE', {invite})}
            />
          </IssueInviteDrawer>
        </Flex>
      </Layout>
    </ContactProvider>
  )
}

ContactsPage.propTypes = {
  showNewInviteForm: PropTypes.bool,
}

export default ContactsPage
