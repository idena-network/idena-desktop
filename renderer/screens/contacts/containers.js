/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  FormControl,
  Stack,
  useToast,
  Drawer,
  Text,
  Flex,
  Button,
  useClipboard,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {mapToFriendlyStatus} from '../../shared/providers/identity-context'
import {toLocaleDna} from '../../shared/utils/utils'
import {
  FormLabel,
  Input,
  Toast,
  VDivider,
} from '../../shared/components/components'
import {useInvite} from '../../shared/providers/invite-context'
import {IconButton2} from '../../shared/components/button'
import {ContactAvatar, ContactStat} from './components'

export function ContactDetail({dbkey, onClose, onSelect, ...props}) {
  const {
    t,
    i18n: {language},
  } = useTranslation()

  const toast = useToast()

  const [showRenameForm, setShowRenameForm] = React.useState(false)

  const [showKillInviteForm, setShowKillInviteForm] = React.useState(false)

  const [{invites}, {updateInvite, deleteInvite, recoverInvite}] = useInvite()

  const invite = invites && invites.find(({id}) => id === dbkey)

  const {onCopy} = useClipboard(invite?.key)

  const identity = invite && invite.identity
  const stake = identity && identity.stake

  const onDeleteUndo = React.useCallback(() => {
    recoverInvite(dbkey)
    onSelect(invite)
  }, [dbkey, invite, onSelect, recoverInvite])

  if (!invite) {
    return null
  }

  const {
    key,
    receiver,
    address = receiver,
    firstName,
    lastName,
    canKill,
    mining,
    terminating,
    activated,
  } = invite

  const isInviteExpired =
    identity &&
    identity.state === 'Undefined' &&
    !canKill &&
    !mining &&
    !activated

  const state = isInviteExpired
    ? t('Expired invitation')
    : identity && identity.state === 'Invite'
    ? t('Invitation')
    : mining
    ? t('Mining...')
    : terminating
    ? t('Terminating...')
    : mapToFriendlyStatus(identity?.state) ?? 'Unknown'

  const toDna = toLocaleDna(language)

  return (
    <>
      <Stack spacing={6} w="full">
        <Stack spacing={4}>
          <Stack isInline spacing={6} align="center" py={2}>
            <ContactAvatar address={address} h={80} w={80} borderRadius={20} />
            <Stack spacing="3/2" fontWeight={500}>
              <Text fontSize="lg">{`${firstName} ${lastName}`}</Text>
              <Text color="muted" fontSize="mdx" wordBreak="break-all">
                {address}
              </Text>
            </Stack>
          </Stack>

          <Stack isInline align="center" spacing={1}>
            <IconButton2 icon="edit" onClick={() => setShowRenameForm(true)}>
              {t('Edit')}
            </IconButton2>
            <VDivider />
            <IconButton2
              icon="flip-editor-delete"
              onClick={() => {
                const id = dbkey
                deleteInvite(id)
                onClose()
                toast({
                  // eslint-disable-next-line react/display-name
                  render: () => (
                    <Toast
                      title={t(`Invitation deleted`)}
                      action={onDeleteUndo}
                      actionContent={t('Undo')}
                    />
                  ),
                })
              }}
            >
              {t('Delete')}
            </IconButton2>
            {canKill && (
              <>
                <VDivider />
                <IconButton2
                  icon="delete"
                  onClick={() => {
                    setShowKillInviteForm(true)
                  }}
                >
                  {t('Kill')}
                </IconButton2>
              </>
            )}
          </Stack>
        </Stack>

        <Stack spacing={5} bg="gray.50" px={10} py={8} borderRadius="md">
          <Stack spacing={0}>
            <ContactStat label={t('Status')} value={state} pt={2} pb={3} />

            {identity &&
              identity.state !== 'Invite' &&
              !isInviteExpired &&
              !mining && <ContactStat label={t('Address')} value={receiver} />}

            {stake > 0 && <ContactStat label="Stake" value={toDna(stake)} />}
          </Stack>

          {!isInviteExpired && !activated && (
            <FormControl>
              <Stack spacing={3}>
                <Flex align="center" justify="space-between">
                  <FormLabel pb={0}>{t('Invitation code')}</FormLabel>
                  {!activated && (
                    <Button
                      variant="link"
                      variantColor="blue"
                      fontWeight={500}
                      _hover={null}
                      _active={null}
                      onClick={onCopy}
                    >
                      {t('Copy')}
                    </Button>
                  )}
                </Flex>
                <Input label={t('Invitation code')} value={key} isDisabled />
              </Stack>
            </FormControl>
          )}
        </Stack>
      </Stack>

      <Drawer show={showRenameForm} onHide={() => setShowRenameForm(false)}>
        {/* <RenameInvite
          {...invite}
          onSave={async (firstName, lastName) => {
            setShowRenameForm(false)
            const id = dbkey
            await updateInvite(id, firstName, lastName)
          }}
        /> */}
      </Drawer>

      <Drawer
        show={showKillInviteForm}
        onHide={() => {
          setShowKillInviteForm(false)
        }}
      >
        {/* <KillInvite
          {...invite}
          state={state}
          stake={stake}
          onSuccess={async () => {
            setShowKillInviteForm(false)
          }}
          onFail={async () => {
            setShowKillInviteForm(false)
          }}
        /> */}
      </Drawer>
    </>
  )
}
