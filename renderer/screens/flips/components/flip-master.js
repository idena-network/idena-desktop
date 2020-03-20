import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'
import {FiCheckCircle, FiCircle} from 'react-icons/fi'
import {rem, margin} from 'polished'
import {useTranslation} from 'react-i18next'
import FlipStep from './flip-step'
import {Box, Text} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'
import FlipPics from './flip-pics'
import FlipShuffle from './flip-shuffle'
import FlipHint from './flip-hint'
import SubmitFlip from './submit-flip'

import useFlips, {FlipType} from '../../../shared/utils/useFlips'
import {
  useIdentityState,
  IdentityStatus,
} from '../../../shared/providers/identity-context'

import {
  NotificationType,
  useNotificationDispatch,
} from '../../../shared/providers/notification-context'

import {composeHint, hasDataUrl, getNextKeyWordsHint} from '../utils/flip'

import {
  useEpochState,
  EpochPeriod,
} from '../../../shared/providers/epoch-context'
import {useChainState} from '../../../shared/providers/chain-context'

function FlipMaster({id, onClose}) {
  const {t} = useTranslation(['flips', 'error'])

  const {
    canSubmitFlip,
    flipKeyWordPairs,
    state: identityState,
  } = useIdentityState()
  const epoch = useEpochState()
  const {syncing} = useChainState()

  const {flips, getDraft, saveDraft, submitFlip} = useFlips()

  const publishingFlips = flips.filter(({type}) => type === FlipType.Publishing)

  const [flip, setFlip] = useState({
    pics: [
      null,
      null,
      null,
      null,
      /* `https://placehold.it/480?text=1`,
      `https://placehold.it/480?text=2`,
      `https://placehold.it/480?text=3`,
      `https://placehold.it/480?text=4`,
      */
    ],
    nonSensePic: `https://placehold.it/480?text=5`,
    nonSenseOrder: -1,
    order: Array.from({length: 4}, (_, i) => i),
    hint: getNextKeyWordsHint(flipKeyWordPairs, publishingFlips),
  })

  const {addNotification} = useNotificationDispatch()
  const [step, setStep] = useState(0)
  const [submitResult, setSubmitResult] = useState()

  const [isFlipsLoaded, setIsFlipsLoaded] = useState(false)

  useEffect(() => {
    // init hint on the first page when [flips] updated
    if (step === 0 && !isFlipsLoaded) {
      setFlip({
        ...flip,
        hint: getNextKeyWordsHint(flipKeyWordPairs, publishingFlips),
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flips])

  useEffect(() => {
    const draft = getDraft(id)
    if (draft) {
      setIsFlipsLoaded(true)
      setFlip({
        ...draft,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (flip.pics.some(hasDataUrl)) {
      saveDraft({id, ...flip})
    }
  }, [id, flip, saveDraft])

  const handleSubmitFlip = async () => {
    try {
      const {result, error} = await submitFlip({id, ...flip})

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
            `error:You can not submit flips having 'Candidate' status`
          )
        } else if (
          [
            IdentityStatus.Newbie,
            IdentityStatus.Verified,
            IdentityStatus.Human,
          ].includes(identityState)
        ) {
          message = t(
            'error:You cannot submit more flips until the next validation'
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
      Router.push('/flips')
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
    !syncing &&
    (flip.nonSenseOrder < 0 ||
      (flip.nonSenseOrder >= 0 && hasDataUrl(flip.nonSensePic)))

  const steps = [
    {
      caption: t('translation:Think up a story'),
      title: t('translation:Think up a story'),
      desc: `${t(
        'translation:Think up a short story about someone/something related to the two key words below according to the template'
      )}: ${t('translation:Before - Something happens - After')}
      `,
      children: (
        <FlipHint
          {...flip}
          onChange={() => {
            setIsFlipsLoaded(true)
            setFlip({
              ...flip,
              hint: getNextKeyWordsHint(
                flipKeyWordPairs,
                publishingFlips,
                flip.hint.id
              ),
            })
          }}
        />
      ),
    },
    {
      caption: t('translation:Select images'),
      title: `${t(
        'translation:Select 4 images to tell your story'
      )}: ${composeHint(flip.hint)}`,
      desc: flip
        ? t(`translation:Please no text on images to explain your story`)
        : '',
      children: (
        <FlipPics
          {...flip}
          onUpdateFlip={nextPics => {
            setFlip({...flip, pics: nextPics})
          }}
        />
      ),
    },
    {
      caption: t('translation:Shuffle images'),
      title: t('translation:Shuffle images'),
      desc: t(
        'translation:Shuffle images in order to make a nonsense sequence of images'
      ),
      children: (
        <FlipShuffle
          {...flip}
          onShuffleFlip={order => {
            setFlip({...flip, order})
          }}
          onUpdateNonSensePic={(nonSensePic, nonSenseOrder) => {
            setFlip({...flip, nonSensePic, nonSenseOrder})
          }}
        />
      ),
    },
    {
      caption: t('translation:Submit flip'),
      title: `${t('translation:Submit flip')} (${composeHint(flip.hint)})`,
      desc: t(
        `translation:Make sure it is not possible to read the shuffled images as a meaningful story`
      ),
      children: <SubmitFlip {...flip} submitFlipResult={submitResult} />,
    },
  ]

  return (
    <>
      <Box
        bg={theme.colors.gray}
        py={rem(14)}
        mx={rem(-80)}
        my={rem(theme.spacings.medium24)}
      >
        <Flex css={margin(0, 0, 0, rem(80))}>
          {steps.map(({caption}, idx) => (
            <Flex
              key={caption}
              align="center"
              onClick={() => setStep(idx)}
              css={{
                ...margin(0, theme.spacings.xlarge, 0, 0),
                cursor: 'pointer',
              }}
            >
              {idx <= step ? (
                <FiCheckCircle
                  fontSize={theme.fontSizes.large}
                  color={theme.colors.primary}
                />
              ) : (
                <FiCircle
                  fontSize={theme.fontSizes.large}
                  color={theme.colors.muted}
                />
              )}
              <Text
                color={idx <= step ? theme.colors.text : theme.colors.muted}
                fontWeight={theme.fontWeights.semi}
                css={{...margin(0, 0, 0, theme.spacings.small), lineHeight: 1}}
              >
                {caption}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>
      {
        steps.map(({title, desc, children}) => (
          <FlipStep
            key={title}
            title={title}
            desc={desc}
            onPrev={() => setStep(step - 1)}
            onNext={() => setStep(step + 1)}
            onClose={onClose}
            onSubmit={handleSubmitFlip}
            isFirst={step === 0}
            isLast={step === steps.length - 1}
            allowSubmit={canPublish}
          >
            {children}
          </FlipStep>
        ))[step]
      }
    </>
  )
}

FlipMaster.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
}

export default FlipMaster
