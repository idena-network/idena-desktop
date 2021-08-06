import {Flex, useDisclosure} from '@chakra-ui/core'
import {useRouter} from 'next/router'
import * as React from 'react'
import {useTranslation} from 'react-i18next'
import {
  ContactListSidebar,
  ContactCard,
  IssueInviteDrawer,
  EditContactDrawer,
  KillInviteDrawer,
} from '../screens/contacts/containers'
import {Page} from '../screens/app/components'
import Layout from '../shared/components/layout'
import {useChainState} from '../shared/providers/chain-context'
import {NoContactDataPlaceholder} from '../screens/contacts/components'
import {InviteProvider} from '../shared/providers/invite-context'
import {useFailToast, useSuccessToast} from '../shared/hooks/use-toast'

export default function ContactsPage() {
  const {t} = useTranslation()

  const {query} = useRouter()

  const {syncing, offline, loading} = useChainState()

  const [selectedContact, setSelectedContact] = React.useState(null)

  const {
    isOpen: isOpenSendInviteDrawer,
    onOpen: onOpenSendInviteDrawer,
    onClose: onCloseNewContactDrawer,
  } = useDisclosure()

  const {
    isOpen: isOpenEditContactDrawer,
    onOpen: onOpenEditContactDrawer,
    onClose: onCloseEditContactDrawer,
  } = useDisclosure()

  const {
    isOpen: isOpenKillContactDrawer,
    onOpen: onOpenKillContactDrawer,
    onClose: onCloseKillContactDrawer,
  } = useDisclosure()

  React.useEffect(() => {
    if (query.new !== undefined) onOpenSendInviteDrawer()
  }, [onOpenSendInviteDrawer, query.new])

  const successToast = useSuccessToast()
  const failToast = useFailToast()

  return (
    <InviteProvider>
      <Layout syncing={syncing} offline={offline} loading={loading}>
        <Page p={0}>
          <Flex w="full">
            <ContactListSidebar
              selectedContactId={selectedContact?.id}
              onSelectContact={setSelectedContact}
              onNewContact={onOpenSendInviteDrawer}
            />
            <Flex flex={1} py={6} px={20}>
              {selectedContact ? (
                <ContactCard
                  contact={selectedContact}
                  onEditContact={onOpenEditContactDrawer}
                  onRemoveContact={() => {
                    setSelectedContact(null)
                  }}
                  onRecoverContact={contact => {
                    setSelectedContact(contact)
                  }}
                  onKillContact={onOpenKillContactDrawer}
                />
              ) : (
                <NoContactDataPlaceholder>
                  {t('You haven’t selected contacts yet.')}
                </NoContactDataPlaceholder>
              )}
            </Flex>
          </Flex>

          <IssueInviteDrawer
            isOpen={isOpenSendInviteDrawer}
            onClose={onCloseNewContactDrawer}
            onIssue={invite => {
              successToast({
                title: t('Invitation code created'),
                description: invite.hash,
              })
              setSelectedContact(invite)
              onCloseNewContactDrawer()
            }}
            onIssueFail={error => {
              failToast(error ?? t('Something went wrong'))
            }}
          />

          <EditContactDrawer
            contact={selectedContact ?? {}}
            isOpen={isOpenEditContactDrawer}
            onRename={({firstName, lastName}) => {
              setSelectedContact(contact => ({
                ...contact,
                firstName,
                lastName,
              }))
              successToast(t('Changes have been saved'))
              onCloseEditContactDrawer()
            }}
            onClose={onCloseEditContactDrawer}
          />

          <KillInviteDrawer
            invite={selectedContact ?? {}}
            isOpen={isOpenKillContactDrawer}
            onClose={onCloseKillContactDrawer}
            onKill={() => {
              successToast('Invite terminated')
              onCloseKillContactDrawer()
            }}
            onFail={error => {
              failToast({
                title: 'Failed to terminate invite',
                description: error,
              })
            }}
          />
        </Page>
      </Layout>
    </InviteProvider>
  )
}
