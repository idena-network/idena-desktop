import {Flex, useDisclosure} from '@chakra-ui/core'
import {useRouter} from 'next/router'
import * as React from 'react'
import {useTranslation} from 'react-i18next'
import {
  ContactListSidebar,
  ContactCard,
  SendInviteDrawer,
  EditContactDrawer,
  KillInviteDrawer,
} from '../screens/contacts/containers'
import {Page} from '../screens/app/components'
import Layout from '../shared/components/layout'
import {useChainState} from '../shared/providers/chain-context'
import {ContactProvider} from '../shared/providers/contact-context'
import {NoContactDataPlaceholder} from '../screens/contacts/components'
import {
  InviteProvider,
  useInviteDispatch,
} from '../shared/providers/invite-context'

export default function ContactsPage() {
  const {t} = useTranslation()

  const {query} = useRouter()

  const {syncing, offline, loading} = useChainState()

  const [selectedContact, setSelectedContact] = React.useState({})
  const [selectedInvite, setSelectedInvite] = React.useState({})
  const [showInvite, setShowInvite] = React.useState(false)
  const [showContact] = React.useState(false)

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
    if (query.new) onOpenSendInviteDrawer()
  }, [onOpenSendInviteDrawer, query.new])

  // const {recoverInvite} = useInviteDispatch()

  const onUndoRemoveContact = React.useCallback(() => {
    // recoverInvite(selectedInvite.dbkey)
    // onSelect(invite)
  }, [])

  return (
    <ContactProvider>
      <InviteProvider>
        <Layout syncing={syncing} offline={offline} loading={loading}>
          <Page p={0}>
            <Flex w="full">
              <ContactListSidebar
                onSelectContact={setSelectedContact}
                onSelectInvite={invite => {
                  setSelectedInvite(invite)
                  setShowInvite(true)
                }}
                onNewInvite={onOpenSendInviteDrawer}
              />
              <Flex flex={1} py={6} px={20}>
                {showInvite && (
                  <ContactCard
                    dbkey={selectedInvite.id}
                    code={selectedInvite && selectedInvite.key}
                    onEditContact={onOpenEditContactDrawer}
                    onKillContact={onOpenKillContactDrawer}
                    onSelect={invite => {
                      // setShowInvite(true)
                      setSelectedInvite(invite)
                    }}
                    onRemoveContact={() => {
                      // setShowInvite(false)
                      setSelectedInvite(null)

                      // toast({
                      //   // eslint-disable-next-line react/display-name
                      //   render: () => (
                      //     <Toast
                      //       title={t(`Invitation deleted`)}
                      //       action={onUndoRemoveContact}
                      //       actionContent={t('Undo')}
                      //     />
                      //   ),
                      // })
                    }}
                  />
                )}

                {/* {showContact && <ContactDetails {...selectedContact} />} */}

                {!showContact && !showInvite && !selectedInvite && (
                  <NoContactDataPlaceholder>
                    {t('You haven’t selected contacts yet.')}
                  </NoContactDataPlaceholder>
                )}
              </Flex>
            </Flex>

            <SendInviteDrawer
              isOpen={isOpenSendInviteDrawer}
              onClose={onCloseNewContactDrawer}
              onDone={invite => {
                onCloseNewContactDrawer()
                setSelectedInvite(invite)
                setShowInvite(true)
              }}
              onFail={() => {}}
            />

            <EditContactDrawer
              isOpen={isOpenEditContactDrawer}
              contact={selectedInvite}
              onClose={onCloseEditContactDrawer}
              onDone={() => {}}
            />

            <KillInviteDrawer
              isOpen={isOpenKillContactDrawer}
              invite={selectedInvite}
              onClose={onCloseKillContactDrawer}
              onDone={() => {}}
              onFail={() => {
                // toast
              }}
            />
          </Page>
        </Layout>
      </InviteProvider>
    </ContactProvider>
  )
}
