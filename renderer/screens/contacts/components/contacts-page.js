import React from 'react'
import {FiUsers} from 'react-icons/fi'
import {useTranslation} from 'react-i18next'
import {Box, Flex, Icon, Stack, Text} from '@chakra-ui/core'
import ContactDetails from './contact-details'
import {ContactProvider} from '../../../shared/providers/contact-context'
import Sidebar from './sidebar'
import InviteDetails from './invite-details'
import {SendInviteDrawer, SendInviteForm} from './send-invite-form'
import {Page} from '../../app/components'
import Layout from '../../../shared/components/layout'
import {useChainState} from '../../../shared/providers/chain-context'

// eslint-disable-next-line react/prop-types
function ContactsPage({showNewInviteForm = false}) {
  const {t} = useTranslation()

  const {syncing, offline, loading} = useChainState()

  const [selectedContact, setSelectedContact] = React.useState(null)
  const [selectedInvite, setSelectedInvite] = React.useState(null)
  const [showInvite, setShowInvite] = React.useState(false)
  const [showContact] = React.useState(false)

  const [isSendInviteOpen, setIsSendInviteOpen] = React.useState(
    showNewInviteForm
  )
  const handleCloseSendInvite = () => {
    setIsSendInviteOpen(false)
  }

  return (
    <ContactProvider>
      <Layout syncing={syncing} offline={offline} loading={loading}>
        <Page p={0}>
          <Flex flex={1} w="full">
            <Sidebar
              onSelectContact={setSelectedContact}
              onSelectInvite={invite => {
                setSelectedInvite(invite)
                setShowInvite(true)
              }}
              onNewInvite={() => setIsSendInviteOpen(true)}
            />
            <Box flex={1}>
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
                <Flex align="center" justify="center" h="full">
                  <Stack spacing={4} align="center" color="muted" m="auto">
                    <Icon as={FiUsers} size={16} color="gray.300" />
                    <Text fontWeight={500} color="muted">
                      {t('You haven’t selected contacts yet.')}
                    </Text>
                  </Stack>
                </Flex>
              )}
            </Box>

            <SendInviteDrawer
              isOpen={isSendInviteOpen}
              onClose={handleCloseSendInvite}
            >
              <SendInviteForm
                onSuccess={invite => {
                  handleCloseSendInvite()
                  setSelectedInvite(invite)
                  setShowInvite(true)
                }}
                onFail={handleCloseSendInvite}
              />
            </SendInviteDrawer>
          </Flex>
        </Page>
      </Layout>
    </ContactProvider>
  )
}

export default ContactsPage
