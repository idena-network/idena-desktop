import React, {useState, useEffect, useContext} from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'
import CreateFlipStep from './flip-step'
import {Box, SubHeading, Text, Absolute} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import theme from '../../../../../shared/theme'
import FlipPics from './flip-pics'
import FlipShuffle from './flip-shuffle'
import FlipHint from './flip-hint'
import {getRandomHint} from '../utils/hints'
import SubmitFlip from './submit-flip'
import {submitFlip} from '../../../../../shared/services/api'
import NetContext from '../../../../../shared/providers/net-provider'
import {NotificationContext} from '../../../../../shared/providers/notification-provider'
import useUnmount from 'react-use/lib/useUnmount'
import {flipToHex, hasDataUrl} from '../../../shared/utils/flip'

const defaultOrder = Array.from({length: 4}, (_, i) => i)

const defaultPics = [
  `https://placehold.it/480?text=1`,
  `https://placehold.it/480?text=2`,
  `https://placehold.it/480?text=3`,
  `https://placehold.it/480?text=4`,
]

function CreateFlipMaster({
  pics: initialPics,
  hint: initialHint,
  order: initialOrder,
  id,
}) {
  const {getDraft, addDraft, updateDraft, publishFlip} = global.flips

  const {validated, requiredFlips} = useContext(NetContext)
  const {onAddNotification} = useContext(NotificationContext)

  const [pics, setPics] = useState(initialPics || defaultPics)
  const [hint, setHint] = useState(initialHint || getRandomHint())
  const [order, setOrder] = useState(initialOrder || defaultOrder)
  const [submitFlipResult, setSubmitFlipResult] = useState()
  const [step, setStep] = useState(0)

  const flipStarted = pics.some(hasDataUrl)
  const flipCompleted = pics.every(hasDataUrl)
  const allowSubmit = true || (flipCompleted && validated && requiredFlips > 0)

  useEffect(() => {
    if (flipStarted) {
      const nextDraft = {id, hint, pics, order}
      const currDraft = getDraft(id)
      if (currDraft) {
        updateDraft({...currDraft, ...nextDraft, modifiedAt: Date.now()})
      } else {
        addDraft({...nextDraft, createdAt: Date.now()})
      }
    }
  }, [pics, hint, order, id])

  useUnmount(() => onAddNotification({title: 'Flip has been saved to drafts'}))

  const handleSubmitFlip = async () => {
    const encodedFlip = flipToHex(pics, order)
    const resp = await submitFlip(encodedFlip)

    if (resp.ok) {
      const {result, error} = await resp.json()
      if (error) {
        setSubmitFlipResult(error.message)
      } else {
        publishFlip({hash: result.hash, hint, order, createdAt: Date.now()})
        setSubmitFlipResult(result.hash)
        Router.replace('/flips')
      }
    } else {
      switch (resp.status) {
        case 413:
          setSubmitFlipResult('Maximum image size exceeded')
          break
        default:
          setSubmitFlipResult('Unexpected error occurred')
          break
      }
    }
  }
  const handleClose = () => {
    if (onAddNotification) {
      onAddNotification({
        title: 'Flip has been saved to drafts',
      })
    }
    Router.push('/flips')
  }

  const steps = [
    {
      title: 'Choose the hints',
      desc: 'Choose key words',
      children: (
        <FlipHint hint={hint} onChange={() => setHint(getRandomHint())} />
      ),
    },
    {
      title: 'Create a story',
      desc: `Select 4 images to create a story with words: ${hint.join(',')}`,
      children: (
        <FlipPics
          pics={pics}
          onUpdateFlip={nextPics => {
            setPics(nextPics)
          }}
        />
      ),
    },
    {
      title: 'Shuffle images',
      children: (
        <FlipShuffle order={order} pics={pics} onShuffleFlip={setOrder} />
      ),
    },
    {
      title: 'Submit story',
      children: (
        <SubmitFlip
          randomOrder={order}
          pics={pics}
          submitFlipResult={submitFlipResult}
        />
      ),
    },
  ]

  return (
    <Box>
      <Flex>
        {steps.map(({title}, idx) => (
          <Flex
            key={title}
            align="center"
            css={{
              borderBottom: `solid 2px ${
                idx <= step ? theme.colors.primary : theme.colors.gray3
              }`,
              padding: theme.spacings.normal,
              paddingLeft: idx === 0 ? 0 : '',
            }}
            onClick={() => setStep(idx)}
          >
            <Text
              color={theme.colors.white}
              fontWeight={600}
              css={{
                background: theme.colors.primary,
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                textAlign: 'center',
                verticalAlign: 'middle',
                marginRight: theme.spacings.small,
              }}
            >
              {idx + 1}
            </Text>
            <SubHeading>{title}</SubHeading>
          </Flex>
        ))}
      </Flex>
      {
        steps.map(({title, desc, children}) => (
          <CreateFlipStep
            key={title}
            desc={desc}
            onPrev={() => setStep(step - 1)}
            onNext={() => {
              setStep(step + 1)
            }}
            onClose={handleClose}
            onSubmit={handleSubmitFlip}
            last={step === steps.length - 1}
            allowSubmit={allowSubmit}
          >
            {children}
          </CreateFlipStep>
        ))[step]
      }
      <Absolute top="1em" right="2em">
        <Text fontSize="3em" css={{cursor: 'pointer'}} onClick={handleClose}>
          &times;
        </Text>
      </Absolute>
    </Box>
  )
}

CreateFlipMaster.propTypes = {
  id: PropTypes.string,
  hint: PropTypes.arrayOf(PropTypes.string),
  pics: PropTypes.arrayOf(PropTypes.string),
}

export default CreateFlipMaster
