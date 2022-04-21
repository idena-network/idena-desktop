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
import Layout from '../shared/components/layout'
import {useChainState} from '../shared/providers/chain-context'
import {NoContactDataPlaceholder} from '../screens/contacts/components'
import {InviteProvider} from '../shared/providers/invite-context'
import {useFailToast, useSuccessToast} from '../shared/hooks/use-toast'
import {Page} from '../shared/components/components'

export default function ContactsPage() {
  const {t} = useTranslation()

  const {query} = useRouter()

  const {syncing, offline, loading} = useChainState()

  const [selectedContact, setSelectedContact] = React.useState(null)

  const sendInviteDisclosure = useDisclosure()

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

  const didOpenInviteDrawerRef = React.useRef()

  React.useEffect(() => {
    if (query.new !== undefined && !didOpenInviteDrawerRef.current) {
      sendInviteDisclosure.onOpen()
      didOpenInviteDrawerRef.current = true
    }
  }, [query.new, sendInviteDisclosure])

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
              onNewContact={sendInviteDisclosure.onOpen}
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
            inviteeAddress={query.address}
            {...sendInviteDisclosure}
            onIssue={invite => {
              successToast({
                title: t('Invitation code created'),
                description: invite.hash,
              })
              setSelectedContact(invite)
              sendInviteDisclosure.onClose()
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
