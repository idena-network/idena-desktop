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
  FlipEditorStep,
  FlipShuffleStep,
  FlipSubmitStep,
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
  const {syncing} = useChainState()

  const {
    canSubmitFlip,
    flipKeyWordPairs,
    state: identityStatus,
  } = useIdentityState()

  const epoch = useEpochState()

  const {flips, getDraft, saveDraft, submitFlip} = useFlips()

  const publishingFlips = flips.filter(({type}) => type === FlipType.Publishing)

  const [flip, setFlip] = React.useState({
    pics: [null, null, null, null],
    compressedPics: [null, null, null, null],
    editorIndexes: [0, 1, 2, 3],
    order: Array.from({length: 4}, (_, i) => i),
    hint: getNextKeyWordsHint(flipKeyWordPairs, publishingFlips),
  })

  const [id] = React.useState(() => nanoid())

  const [step, setStep] = React.useState(0)

  const [isFlipsLoaded, setIsFlipsLoaded] = React.useState(false)

  // TODO: handle image onChange
  // const [isChanging, setIsChanging] = React.useState(false)

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

  const router = useRouter()

  const {addNotification, addError} = useNotificationDispatch()

  const {t} = useTranslation(['translation', 'error'])

  React.useEffect(() => {
    if (flip.pics.some(hasDataUrl)) {
      saveDraft({id, ...flip})
    }
  }, [flip, id, saveDraft])

  const handleClose = () => {
    addNotification({
      title: t('Flip has been saved to drafts'),
    })
    router.push('/flips')
  }

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
          ].includes(identityStatus)
        ) {
          message = t(
            `It's not allowed to submit flips with your identity status`
          )
        } else if (epoch && epoch.currentPeriod !== EpochPeriod.None) {
          message = t(`Can not submit flip during the validation session`)
        } else {
          // eslint-disable-next-line prefer-destructuring
          message = error.message
        }
      }

      if (error) {
        addError({
          title: t('Error while uploading flip'),
          body: message,
        })
      } else {
        addNotification({
          title: t('Flip saved!'),
          body: `Hash ${result.hash}`,
          type: NotificationType.Info,
        })
      }
      router.push('/flips')
    } catch (error) {
      global.logger.error(
        error.response && error.response.status === 413
          ? 'Maximum image size exceeded'
          : 'Something went wrong'
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
      <Page p={0} maxH="100vh" overflowY="hidden">
        <Flex
          direction="column"
          flex={1}
          alignSelf="stretch"
          px={20}
          overflowY="auto"
        >
          <FlipPageTitle onClose={handleClose}>New flip</FlipPageTitle>
          <FlipMaster>
            <FlipMasterNavbar>
              <FlipMasterNavbarItem
                step={step === 0 ? Step.Active : Step.Completed}
                onClick={() => setStep(0)}
              >
                Think up a story
              </FlipMasterNavbarItem>
              <FlipMasterNavbarItem
                step={
                  // eslint-disable-next-line no-nested-ternary
                  step === 1
                    ? Step.Active
                    : step < 1
                    ? Step.Next
                    : Step.Completed
                }
                onClick={() => setStep(1)}
              >
                Select images
              </FlipMasterNavbarItem>
              <FlipMasterNavbarItem
                step={
                  // eslint-disable-next-line no-nested-ternary
                  step === 2
                    ? Step.Active
                    : step < 2
                    ? Step.Next
                    : Step.Completed
                }
                onClick={() => setStep(2)}
              >
                Shuffle images
              </FlipMasterNavbarItem>
              <FlipMasterNavbarItem
                step={step === 3 ? Step.Active : Step.Next}
                onClick={() => setStep(3)}
              >
                Submit flip
              </FlipMasterNavbarItem>
            </FlipMasterNavbar>
            {step === 0 && (
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
            {step === 1 && (
              <FlipEditorStep
                keywords={keywords}
                images={flip.pics}
                onChangeImage={(image, currentIndex) => {
                  // send('CHANGE.IMAGES', {image, currentIndex})
                }}
              />
            )}
            {step === 2 && <FlipShuffleStep images={flip.pics} />}
            {step === 3 && <FlipSubmitStep images={flip.pics} />}
          </FlipMaster>
          <Box position="absolute" left={6} bottom={6}>
            <Code>{JSON.stringify({})}</Code>
          </Box>
        </Flex>
        <FlipMasterFooter>
          {step !== 0 && (
            <SecondaryButton onClick={() => setStep(step - 1)}>
              Prev step
            </SecondaryButton>
          )}
          {step !== 3 && (
            <PrimaryButton onClick={() => setStep(step - 1)}>
              Next step
            </PrimaryButton>
          )}
          {step === 3 && (
            <PrimaryButton onClick={handleSubmitFlip}>Submit</PrimaryButton>
          )}
        </FlipMasterFooter>
      </Page>
    </Layout>
  )
}
