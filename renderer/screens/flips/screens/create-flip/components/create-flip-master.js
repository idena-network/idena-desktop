import React, {useState, useEffect, useContext, useCallback} from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'
import {encode} from 'rlp'
import CreateFlipStep from './create-flip-step'
import {Box, SubHeading, Text, Absolute} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import {FLIPS_STORAGE_KEY, appendToLocalStorage} from '../../../utils/storage'
import theme from '../../../../../shared/theme'
import CreateFlipForm from './create-flip-form'
import FlipShuffle from './flip-shuffle'
import FlipHint from './flip-hint'
import {getRandomHint} from '../utils/hints'
import SubmitFlip from './submit-flip'
import {submitFlip} from '../../../../../shared/services/api'
import {toHex} from '../../../../../shared/utils/req'
import {set as setToCache} from '../utils/cache'
import {randomFlipOrder} from '../utils/order'
import NetContext from '../../../../../shared/providers/net-provider'

const initialPics = [
  `https://placehold.it/480?text=1`,
  `https://placehold.it/480?text=2`,
  `https://placehold.it/480?text=3`,
  `https://placehold.it/480?text=4`,
]

function CreateFlipMaster({pics: savedPics, caption, id, onAddNotification}) {
  const {validated} = useContext(NetContext)

  const [pics, setPics] = useState(savedPics || initialPics)
  const [hint, setHint] = useState(
    (caption && caption.split('/')) || getRandomHint()
  )
  const [randomOrder, setRandomOrder] = useState([0, 1, 2, 3])
  const [submitFlipResult, setSubmitFlipResult] = useState()
  const [step, setStep] = useState(0)

  useEffect(() => {
    setToCache({
      id,
      caption: hint.join('/'),
      createdAt: Date.now(),
      pics,
    })
  }, [step, pics, hint, id])

  useEffect(() => {
    return () => {
      onAddNotification({title: 'Flip has been saved to drafts'})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmitFlip = async () => {
    const arrayBuffers = pics.map(src => {
      const byteString = src.split(',')[1]
      return Uint8Array.from(atob(byteString), c => c.charCodeAt(0))
    })

    const hexBuff = encode([
      arrayBuffers.map(ab => new Uint8Array(ab)),
      randomFlipOrder(pics, randomOrder),
    ])

    try {
      const response = await submitFlip(toHex(hexBuff))
      if (response.ok) {
        const {result, error} = await response.json()
        if (error) {
          setSubmitFlipResult(error.message)
        } else {
          appendToLocalStorage(FLIPS_STORAGE_KEY, {
            hash: result.hash,
            caption: hint.join('/'),
            createdAt: Date.now(),
          })
          setSubmitFlipResult(result.hash)
          Router.replace('/flips')
        }
      } else {
        setSubmitFlipResult(
          response.status === 413
            ? 'Maximum image size exceeded'
            : 'Unexpected error occurred'
        )
      }
    } catch (err) {
      setSubmitFlipResult(err)
    }
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
        <CreateFlipForm
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
        <FlipShuffle
          randomOrder={randomOrder}
          pics={pics}
          onShuffleFlip={setRandomOrder}
        />
      ),
    },
    {
      title: 'Submit story',
      children: (
        <SubmitFlip
          randomOrder={randomOrder}
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
        steps.map(({title, desc, children}) => {
          const last = step === steps.length - 1
          return (
            <CreateFlipStep
              key={title}
              desc={desc}
              onPrev={() => setStep(step - 1)}
              onNext={
                last
                  ? handleSubmitFlip
                  : () => {
                      setStep(step + 1)
                    }
              }
              last={last}
              allowSubmit={pics.every(
                src => src && src.startsWith('data') && validated
              )}
            >
              {children}
            </CreateFlipStep>
          )
        })[step]
      }
      <Absolute top="1em" right="2em">
        <Text
          fontSize="3em"
          css={{cursor: 'pointer'}}
          onClick={() => {
            if (onAddNotification) {
              onAddNotification({title: 'Flip has been saved to drafts'})
            }
            Router.push('/flips')
          }}
        >
          &times;
        </Text>
      </Absolute>
    </Box>
  )
}

CreateFlipMaster.propTypes = {
  id: PropTypes.string,
  caption: PropTypes.string,
  pics: PropTypes.arrayOf(PropTypes.string),
  onAddNotification: PropTypes.func,
}

export default CreateFlipMaster
