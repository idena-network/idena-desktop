import React from 'react'
import {useRouter} from 'next/router'
import NextHead from 'next/head'
import {Box, Code, Skeleton, CloseButton, Flex} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import nanoid from 'nanoid'
import {Page, PageTitle} from '../../screens/app/components'
import {
  FlipMaster,
  FlipMasterNavbar,
  FlipMasterNavbarItem,
  FlipStoryStep,
  FlipMasterFooter,
  FlipStepBody,
  FlipKeywordPair,
  FlipKeyword,
  FlipStoryAside,
  FlipKeywordPanel,
  FlipKeywordName,
  FlipKeywordDescription,
  FlipPageTitle,
} from '../../screens/flips/components'
import {Step} from '../../screens/flips/types'
import {
  SecondaryButton,
  PrimaryButton,
  IconButton2,
} from '../../shared/components/button'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {
  useNotificationDispatch,
  NotificationType,
} from '../../shared/providers/notification-context'
import {useIdentityState} from '../../shared/providers/identity-context'
import {useEpochState} from '../../shared/providers/epoch-context'
import useFlips from '../../shared/hooks/use-flips'
import {FlipType, IdentityStatus, EpochPeriod} from '../../shared/types'
import {hasDataUrl, getNextKeyWordsHint} from '../../screens/flips/utils/flip'

export default function NewFlipPage() {
  const {t} = useTranslation()

  const {syncing} = useChainState()

  const router = useRouter()
  const {addNotification} = useNotificationDispatch()

  const [id] = React.useState(nanoid())

  const handleClose = () => {
    addNotification({
      title: t('Flip has been saved to drafts'),
    })
    router.push('/flips')
  }

  const not = () => false // Math.random() > 0.5
  const is = () => true // Math.random() > 0.5

  const {
    canSubmitFlip,
    flipKeyWordPairs,
    state: identityState,
  } = useIdentityState()

  const epoch = useEpochState()

  const {flips, getDraft, saveDraft, submitFlip} = useFlips()

  const publishingFlips = flips.filter(({type}) => type === FlipType.Publishing)

  const [flip, setFlip] = React.useState({
    pics: [null, null, null, null],
    compressedPics: [null, null, null, null],
    editorIndexes: [0, 1, 2, 3],
    nonSensePic: `https://placehold.it/480?text=5`,
    nonSenseOrder: -1,
    order: Array.from({length: 4}, (_, i) => i),
    hint: getNextKeyWordsHint(flipKeyWordPairs, publishingFlips),
  })

  const [step, setStep] = React.useState(0)
  const [submitResult, setSubmitResult] = React.useState()

  const [isFlipsLoaded, setIsFlipsLoaded] = React.useState(false)
  const [isChanging, setIsChanging] = React.useState(false)

  React.useEffect(() => {
    // init hint on the first page when [flips] updated
    if (step === 0 && !isFlipsLoaded) {
      setFlip({
        ...flip,
        hint: getNextKeyWordsHint(flipKeyWordPairs, publishingFlips),
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flips])

  React.useEffect(() => {
    const draft = getDraft(id)
    if (draft) {
      setIsFlipsLoaded(true)
      setFlip({
        compressedPics: [null, null, null, null],
        ...draft,

        editorIndexes: [0, 1, 2, 3],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  React.useEffect(() => {
    if (flip.pics.some(hasDataUrl)) {
      saveDraft({id, ...flip})
    }
  }, [flip, id, saveDraft])

  const handleSubmitFlip = async () => {
    try {
      const {result, error} = await submitFlip({
        id,
        ...flip,
      })

      let message = ''
      if (error) {
        if (
          [
            IdentityStatus.None,
            IdentityStatus.Candidate,
            IdentityStatus.Suspended,
            IdentityStatus.Zombie,
          ].includes(identityState)
        ) {
          message = t(
            `error:It's not allowed to submit flips with your identity status`
          )
        } else if (epoch && epoch.currentPeriod !== EpochPeriod.None) {
          message = t(`error:Can not submit flip during the validation session`)
        } else {
          // eslint-disable-next-line prefer-destructuring
          message = error.message
        }
      }

      addNotification({
        title: error
          ? t('error:Error while uploading flip')
          : t('translation:Flip saved!'),
        body: error ? message : `Hash ${result.hash}`,
        type: error ? NotificationType.Error : NotificationType.Info,
      })
      router.push('/flips')
    } catch ({response: {status}}) {
      setSubmitResult(
        status === 413
          ? t('error:Maximum image size exceeded')
          : t('error:Something went wrong')
      )
    }
  }

  const canPublish =
    flip.pics.every(hasDataUrl) &&
    canSubmitFlip &&
    (flip.nonSenseOrder < 0 ||
      (flip.nonSenseOrder >= 0 && hasDataUrl(flip.nonSensePic)))

  const keywords = flip.hint.words.map(({name, desc}) => ({name, desc}))

  return (
    <Layout syncing={syncing}>
      <NextHead></NextHead>
      <Page p={0} maxH="100vh" overflowY="hidden">
        <Flex direction="column" px={20} overflowY="auto">
          <FlipPageTitle onClose={handleClose}>New flip</FlipPageTitle>
          <FlipMaster>
            <FlipMasterNavbar>
              <FlipMasterNavbarItem
                step={true ? Step.Active : Step.Completed}
                onClick={() => {}}
              >
                Think up a story
              </FlipMasterNavbarItem>
              <FlipMasterNavbarItem
                step={
                  // eslint-disable-next-line no-nested-ternary
                  Math.random() > 0.5
                    ? Step.Active
                    : Math.random() > 0.5
                    ? Step.Next
                    : Step.Completed
                }
                onClick={() => {}}
              >
                Select images
              </FlipMasterNavbarItem>
              <FlipMasterNavbarItem
                step={
                  // eslint-disable-next-line no-nested-ternary
                  Math.random() > 0.5
                    ? Step.Active
                    : Math.random() > 0.5
                    ? Step.Next
                    : Step.Completed
                }
                onClick={() => {}}
              >
                Shuffle images
              </FlipMasterNavbarItem>
              <FlipMasterNavbarItem
                step={Math.random() > 0.5 ? Step.Active : Step.Next}
                onClick={() => {}}
              >
                Submit flip
              </FlipMasterNavbarItem>
            </FlipMasterNavbar>
            {true && (
              <FlipStoryStep>
                <FlipStepBody minH="180px">
                  <FlipKeywordPanel>
                    <FlipKeywordPair>
                      {Math.random() > 0.5 &&
                        // eslint-disable-next-line no-shadow
                        keywords.map(({id, name, desc}) => (
                          <FlipKeyword key={id}>
                            <FlipKeywordName>{name}</FlipKeywordName>
                            <FlipKeywordDescription>
                              {desc}
                            </FlipKeywordDescription>
                          </FlipKeyword>
                        ))}
                      {false &&
                        Math.random() > 0.5 &&
                        [...'0x'].map(() => (
                          <FlipKeyword>
                            <Skeleton h={5} w={20} />
                            <Skeleton h={5} w={40} />
                            <Skeleton h={5} w={40} />
                          </FlipKeyword>
                        ))}
                    </FlipKeywordPair>
                  </FlipKeywordPanel>
                  <FlipStoryAside>
                    <IconButton2 icon="refresh" onClick={() => {}}>
                      Change words
                    </IconButton2>
                    <IconButton2 icon="gtranslate">
                      Google Translate
                    </IconButton2>
                  </FlipStoryAside>
                </FlipStepBody>
              </FlipStoryStep>
            )}
            {/* {current.matches({editing: 'editor'}) && (
          <FlipEditorStep
            keywords={keywords}
            images={images}
            onChangeImage={(image, currentIndex) =>
              send('CHANGE.IMAGES', {image, currentIndex})
            }
          />
        )}
        {current.matches({editing: 'shuffle'}) && (
          <FlipShuffleStep images={images} />
        )}
        {current.matches({editing: 'submit'}) && (
          <FlipSubmitStep images={images} />
        )} */}
          </FlipMaster>
          <Box position="absolute" left={6} bottom={6}>
            <Code>{JSON.stringify({})}</Code>
          </Box>
        </Flex>
        <FlipMasterFooter>
          {not('keywords') && (
            <SecondaryButton onClick={() => {}}>Prev step</SecondaryButton>
          )}
          {not('submit') && (
            <PrimaryButton onClick={() => {}}>Next step</PrimaryButton>
          )}
          {is('submit') && (
            <PrimaryButton onClick={() => {}}>Submit</PrimaryButton>
          )}
        </FlipMasterFooter>
      </Page>
    </Layout>
  )
}
