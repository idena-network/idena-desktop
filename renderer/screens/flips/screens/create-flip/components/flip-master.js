import React, {useState, useEffect, useContext} from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'
import {FiX, FiCheckCircle, FiCircle} from 'react-icons/fi'
import {rem, margin} from 'polished'
import FlipStep from './flip-step'
import {Box, Text, Absolute} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import theme from '../../../../../shared/theme'
import FlipPics from './flip-pics'
import FlipShuffle from './flip-shuffle'
import FlipHint from './flip-hint'
import {getRandomHint} from '../utils/hints'
import SubmitFlip from './submit-flip'
import {
  NotificationContext,
  NotificationType,
} from '../../../../../shared/providers/notification-provider'
import {hasDataUrl, composeHint} from '../../../shared/utils/flip'
import useFlips from '../../../../../shared/utils/useFlips'
import useIdentity from '../../../../../shared/utils/useIdentity'
import useCoinbaseAddress from '../../../../../shared/utils/useCoinbaseAddress'

function FlipMaster({id}) {
  const address = useCoinbaseAddress()
  const {canSubmitFlip} = useIdentity(address)
  const {getDraft, saveDraft, submitFlip} = useFlips()

  const {addNotification} = useContext(NotificationContext)

  const [flip, setFlip] = useState({
    pics: [
      `https://placehold.it/480?text=1`,
      `https://placehold.it/480?text=2`,
      `https://placehold.it/480?text=3`,
      `https://placehold.it/480?text=4`,
    ],
    order: Array.from({length: 4}, (_, i) => i),
    hint: getRandomHint(),
  })

  const [step, setStep] = useState(0)
  const [submitResult, setSubmitResult] = useState()

  useEffect(() => {
    const draft = getDraft(id)
    if (draft) {
      setFlip(draft)
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
      const {result, error} = await submitFlip(flip)
      addNotification({
        title: error ? 'Error while uploading flip' : 'Flip saved!',
        body: error ? error.message : `Hash ${result.hash}`,
        type: error ? NotificationType.Error : NotificationType.Info,
      })
      Router.push('/flips')
    } catch ({response: {status}}) {
      setSubmitResult(
        status === 413
          ? 'Maximum image size exceeded'
          : 'Unexpected error occurred'
      )
    }
  }

  const canPublish = true || (flip.pics.every(hasDataUrl) && canSubmitFlip)

  const steps = [
    {
      caption: 'Think up a story',
      title: 'Think up a story',
      desc:
        'Think up a short story about someone/something related to the two key words below according to the template',
      children: (
        <FlipHint
          {...flip}
          onChange={() => setFlip({...flip, hint: getRandomHint()})}
        />
      ),
    },
    {
      caption: 'Select images',
      title: 'Select 4 images to tell your story',
      desc: flip
        ? `Use key words for the story “${composeHint(
            flip.hint
          )}” and template TBD`
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
      caption: 'Shuffle images',
      title: 'Shuffle images',
      desc: 'Shuffle images in a way to make a nonsense sequence of images',
      children: (
        <FlipShuffle
          {...flip}
          onShuffleFlip={order => {
            setFlip({...flip, order})
          }}
        />
      ),
    },
    {
      caption: 'Submit flip',
      title: 'Submit flip',
      children: <SubmitFlip {...flip} submitFlipResult={submitResult} />,
    },
  ]

  return (
    <>
      <Box bg={theme.colors.gray} py={rem(14)} mx={rem(-80)} my={rem(24)}>
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
            onNext={() => {
              setStep(step + 1)
            }}
            onSubmit={handleSubmitFlip}
            last={step === steps.length - 1}
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
}

export default FlipMaster
