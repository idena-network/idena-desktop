import React from 'react'
import {useRouter} from 'next/router'
import {
  Box,
  Code,
  Flex,
  Stack,
  useDisclosure,
  CloseButton,
  useToast,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {Page, PageTitle} from '../../screens/app/components'
import {
  FlipMaster,
  FlipStepBody,
  FlipKeywordPanel,
  FlipKeywordTranslationSwitch,
  FlipKeyword,
  FlipKeywordName,
  FlipImageList,
  FlipImageListItem,
  FlipMasterFooter,
  FlipCardMenuItem,
  FlipCardMenuItemIcon,
  FlipCardMenu,
  DeleteFlipDrawer,
} from '../../screens/flips/components'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {createViewFlipMachine} from '../../screens/flips/machines'
import {rem} from '../../shared/theme'
import {useIdentityState} from '../../shared/providers/identity-context'
import {Toast} from '../../shared/components/components'
import {FlipType} from '../../shared/types'

export default function ViewFlipPage() {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const {id} = router.query

  const {
    isOpen: isOpenDeleteForm,
    onOpen: openDeleteForm,
    onClose: onCloseDeleteForm,
  } = useDisclosure()

  const toast = useToast()

  const {syncing} = useChainState()
  const {flips: knownFlips} = useIdentityState()

  const viewMachine = React.useMemo(() => createViewFlipMachine(id), [id])

  const [current, send] = useMachine(viewMachine, {
    actions: {
      onDeleted: () => router.push('/flips/list'),
      onDeleteFailed: ({error}) =>
        toast({
          // eslint-disable-next-line react/display-name
          render: () => <Toast title={error} status="error" />,
        }),
    },
  })

  const {
    hash,
    keywords,
    images,
    originalOrder,
    order,
    showTranslation,
    type,
  } = current.context

  if (!id) return null

  return (
    <Layout syncing={syncing}>
      <Page p={0}>
        <Flex
          direction="column"
          flex={1}
          alignSelf="stretch"
          px={20}
          overflowY="auto"
        >
          <Flex
            align="center"
            alignSelf="stretch"
            justify="space-between"
            my={6}
            mb={0}
          >
            <PageTitle mb={0} pb={0}>
              {t('View flip')}
            </PageTitle>
            <CloseButton onClick={() => router.push('/flips/list')} />
          </Flex>
          {current.matches('loaded') && (
            <FlipMaster>
              <FlipStepBody minH="180px" my="auto">
                <Stack isInline spacing={10}>
                  <FlipKeywordPanel w={rem(320)}>
                    {keywords.words.length ? (
                      <FlipKeywordTranslationSwitch
                        keywords={keywords}
                        showTranslation={showTranslation}
                        locale={i18n.language}
                        isInline={false}
                      />
                    ) : (
                      <FlipKeyword>
                        <FlipKeywordName>
                          {t('Missing keywords')}
                        </FlipKeywordName>
                      </FlipKeyword>
                    )}
                  </FlipKeywordPanel>
                  <Stack isInline spacing={10} justify="center">
                    <FlipImageList>
                      {originalOrder.map((num, idx) => (
                        <FlipImageListItem
                          key={num}
                          src={images[num]}
                          isFirst={idx === 0}
                          isLast={idx === images.length - 1}
                          width={130}
                        />
                      ))}
                    </FlipImageList>
                    <FlipImageList>
                      {order.map((num, idx) => (
                        <FlipImageListItem
                          key={num}
                          src={images[num]}
                          isFirst={idx === 0}
                          isLast={idx === images.length - 1}
                          width={130}
                        />
                      ))}
                    </FlipImageList>
                  </Stack>
                </Stack>
              </FlipStepBody>
            </FlipMaster>
          )}
        </Flex>
        {type !== FlipType.Archived && (
          <FlipMasterFooter>
            <FlipCardMenu>
              <FlipCardMenuItem
                onClick={() => {
                  if ((knownFlips || []).includes(hash)) openDeleteForm()
                  else send('ARCHIVE')
                }}
              >
                <FlipCardMenuItemIcon
                  name="delete"
                  size={5}
                  mr={2}
                  color="red.500"
                />
                {t('Delete flip')}
              </FlipCardMenuItem>
            </FlipCardMenu>
          </FlipMasterFooter>
        )}

        <DeleteFlipDrawer
          isOpen={isOpenDeleteForm}
          onClose={onCloseDeleteForm}
          onDelete={() => {
            send('DELETE')
            onCloseDeleteForm()
          }}
        />
      </Page>
      {global.isDev && (
        <Box position="absolute" left={6} bottom={6} zIndex="popover">
          <Code>{JSON.stringify(current.context.order)}</Code>
        </Box>
      )}
    </Layout>
  )
}
