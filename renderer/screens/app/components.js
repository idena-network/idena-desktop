/* eslint-disable react/prop-types */
import {Flex, Heading, Text, useColorMode} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogBody,
} from '../../shared/components/components'
import {Link} from '../../shared/components'
import {PrimaryButton} from '../../shared/components/button'
import {
  useAutoUpdateState,
  useAutoUpdateDispatch,
} from '../../shared/providers/update-context'
import theme from '../../shared/theme'

export function LayoutContainer(props) {
  const {colorMode} = useColorMode()
  return (
    <Flex
      align="stretch"
      flexWrap="wrap"
      bg={colorMode === 'light' ? '' : 'gray.900'}
      color={theme.colors[colorMode].text}
      fontSize="md"
      minH="100vh"
      {...props}
    />
  )
}

export function Page(props) {
  return (
    <Flex
      flexDirection="column"
      align="flex-start"
      flexBasis={0}
      flexGrow={999}
      maxH="100vh"
      minW="50%"
      px={20}
      py={6}
      overflowY="auto"
      {...props}
    />
  )
}

export function PageTitle(props) {
  return (
    <Heading as="h1" fontSize="xl" fontWeight={500} py={2} mb={4} {...props} />
  )
}

export function UpdateExternalNodeDialog() {
  const {showExternalUpdateModal} = useAutoUpdateState()
  const {hideExternalNodeUpdateModal} = useAutoUpdateDispatch()

  const {t} = useTranslation()

  return (
    <Dialog
      isOpen={showExternalUpdateModal}
      onClose={hideExternalNodeUpdateModal}
    >
      <DialogHeader>{t('Cannot update remote node')}</DialogHeader>
      <DialogBody>
        <Text>
          Please, run built-in at the{' '}
          <Link href="/settings/node" onClick={hideExternalNodeUpdateModal}>
            settings
          </Link>{' '}
          page to enjoy automatic updates.
        </Text>
        <Text>{t('Otherwise, please update your remote node manually.')}</Text>
      </DialogBody>
      <DialogFooter>
        <PrimaryButton onClick={hideExternalNodeUpdateModal}>
          {t('Okay, got it')}
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
}
