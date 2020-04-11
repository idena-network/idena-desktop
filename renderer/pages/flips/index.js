import React from 'react'
import {margin} from 'polished'
import {useTranslation} from 'react-i18next'
import useLocalStorage from '../../shared/hooks/use-local-storage'
import Layout from '../../shared/components/layout'
import {Box, Drawer, PageTitle} from '../../shared/components'
import theme, {rem} from '../../shared/theme'
import FlipToolbar, {
  FlipToolbarItem,
} from '../../screens/flips/components/toolbar'
import useFlips, {FlipType} from '../../shared/utils/useFlips'
import Flex from '../../shared/components/flex'
import IconLink from '../../shared/components/icon-link'
import FlipCover, {
  RequiredFlip,
  OptionalFlip,
  MissingFlip,
} from '../../screens/flips/components/flip-cover'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import {useChainState} from '../../shared/providers/chain-context'
import DeleteFlipForm from '../../screens/flips/components/delete-flip-form'
import {useIdentityState} from '../../shared/providers/identity-context'
import {capitalize} from '../../shared/utils/string'

function Flips() {
  const {t} = useTranslation('error')
  const {flips, submitFlip, deleteFlip} = useFlips()
  const {addNotification, addError} = useNotificationDispatch()
  const {syncing, offline, loading} = useChainState()
  const [isDeleteFlipFormOpen, setIsDeleteFlipFormOpen] = React.useState(false)
  const handleCloseDeleteFlipForm = () => setIsDeleteFlipFormOpen(false)
  const [flipToDelete, setFlipToDelete] = React.useState(false)

  const [filter, setFilter] = useLocalStorage(
    'flips/filter',
    FlipType.Published
  )

  const filteredFlips = flips.filter(({type}) =>
    filter === FlipType.Published
      ? [FlipType.Publishing, FlipType.Deleting, filter].includes(type)
      : type === filter
  )

  const {
    availableFlips,
    requiredFlips,
    flips: nodeFlips,
    flipKeyWordPairs,
  } = useIdentityState()

  const knownFlips = nodeFlips || []
  const publishedFlips = knownFlips.concat(
    flips.filter(
      ({type, hash}) =>
        !knownFlips.includes(hash) &&
        [FlipType.Publishing, FlipType.Published, FlipType.Deleting].includes(
          type
        )
    )
  )
  const publishedFlipsNumber = publishedFlips.length
  const remainingRequiredFlipsNumber = requiredFlips - publishedFlipsNumber

  const missingFlipsNumber = knownFlips.filter(
    hash => !flips.find(f => f.hash === hash)
  ).length
  const usedWords = (flipKeyWordPairs || [])
    .filter(
      ({used, id}) =>
        used &&
        !flips.find(
          ({type, hint}) => type === FlipType.Published && hint.id === id
        )
    )
    .slice(0, missingFlipsNumber)
    .map(({id, words}) => ({id, words: words.map(global.loadKeyword)}))

  const optionalFlipsNumber =
    availableFlips - Math.max(requiredFlips, publishedFlipsNumber)

  const didPublishRequiredFlips = remainingRequiredFlipsNumber <= 0

  return (
    <Layout syncing={syncing} offline={offline} loading={loading}>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
        <PageTitle>{t('translation:My Flips')}</PageTitle>
        <FlipToolbar>
          <Flex>
            {Object.values(FlipType)
              // alias Publishing and Deleting to Published in userland
              .filter(
                type =>
                  type !== FlipType.Publishing && type !== FlipType.Deleting
              )
              .map(type => (
                <FlipToolbarItem
                  key={type}
                  onClick={() => setFilter(type)}
                  isCurrent={filter === type}
                >
                  {t(`translation:${capitalize(type)}`)}
                </FlipToolbarItem>
              ))}
          </Flex>
          <Flex>
            <IconLink
              href="/flips/new"
              icon={<i className="icon icon--add_btn" />}
            >
              {t('translation:New flip')}
            </IconLink>
          </Flex>
        </FlipToolbar>
      </Box>
      <Box my={rem(theme.spacings.medium32)} px={theme.spacings.xxxlarge}>
        <FlipList>
          {filteredFlips.map(flip => (
            <FlipCover
              key={flip.id}
              {...flip}
              width={rem(150)}
              onSubmit={async () => {
                try {
                  if (!flip.hint) {
                    addError({
                      title: t('error:Can not submit flip'),
                      body: t('error:Keywords are not specified'),
                    })
                    return
                  }
                  const {result, error} = await submitFlip(flip)
                  if (error) {
                    addError({
                      title: t('error:Error while uploading flip'),
                      body: error.message,
                    })
                  } else {
                    addNotification({
                      title: t('translation:Flip saved'),
                      body: result.hash,
                    })
                  }
                } catch (error) {
                  let message = t('error:Something went wrong')
                  if (error.response && error.response.status === 413) {
                    message = t('error:Maximum image size exceeded')
                  }
                  addError({
                    title: message,
                  })
                }
              }}
              onDelete={() => {
                if (flip.type === FlipType.Published) {
                  setFlipToDelete({hash: flip.hash, pic: flip.pics[0]})
                  setIsDeleteFlipFormOpen(true)
                  return
                }
                deleteFlip(flip)
              }}
            />
          ))}
          {filter === FlipType.Published && (
            <>
              {Array.from({length: missingFlipsNumber}).map((_, idx) => (
                <MissingFlip key={idx} hint={usedWords[idx]} idx={idx} />
              ))}
              {Array.from({length: remainingRequiredFlipsNumber}).map(
                (_, idx) => (
                  <RequiredFlip key={idx} idx={publishedFlipsNumber + idx} />
                )
              )}
              {Array.from({length: optionalFlipsNumber}).map((_, idx) => (
                <OptionalFlip
                  key={idx}
                  idx={requiredFlips + idx}
                  disabled={!didPublishRequiredFlips}
                />
              ))}
            </>
          )}
        </FlipList>
      </Box>
      <Drawer show={isDeleteFlipFormOpen} onHide={handleCloseDeleteFlipForm}>
        <DeleteFlipForm
          hash={flipToDelete.hash}
          pic={flipToDelete.pic}
          onDelete={async () => {
            try {
              const {id} = flips.filter(
                ({hash}) => hash === flipToDelete.hash
              )[0]
              const {result, error} = await deleteFlip({id})
              if (error) {
                addError({
                  title: t('error:Error while deleting flip'),
                  body: error.message,
                })
                return false
              }
              if (result) {
                addNotification({
                  title: t('translation:Flip deleted'),
                  body: result,
                })
                handleCloseDeleteFlipForm()
              }
              return true
            } catch (error) {
              addError({
                title: t('error:Something went wrong'),
              })
              return false
            }
          }}
        />
      </Drawer>
    </Layout>
  )
}

function FlipList(props) {
  return (
    <Flex
      css={{flexWrap: 'wrap', ...margin(`${theme.spacings.normal} 0`)}}
      {...props}
    />
  )
}

export default Flips
