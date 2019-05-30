import React, {memo} from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'
import theme from '../../../../shared/theme'
import FlipImage from './flip-image'
import {Box, Text, Button} from '../../../../shared/components'
import {composeHint} from '../utils/flip'

const fromBlob = src =>
  URL.createObjectURL(new Blob([src], {type: 'image/jpeg'}))

function Flip({id, hint, pics, createdAt, onUpdateFlips}) {
  const {deleteDraft} = global.flips
  const draft = !!id
  return (
    <Box m={`${theme.spacings.normal} 0`} w="25%">
      <Box m={`0 0 ${theme.spacings.small}`}>
        <FlipImage
          src={draft ? pics[0] : fromBlob(pics[0])}
          css={{borderRadius: '4px'}}
        />
      </Box>
      <Box m={`0 0 ${theme.spacings.small}`}>
        <Text>{composeHint(hint)}</Text>
      </Box>
      <Box m={`0 0 ${theme.spacings.small}`}>
        <Text color={theme.colors.muted}>
          {new Date(createdAt).toLocaleString()}
        </Text>
      </Box>
      <Box p={theme.spacings.small}>
        {draft && (
          <>
            <Button
              onClick={() => {
                Router.push(`/flips/edit?id=${id}`)
              }}
            >
              Edit
            </Button>
            <Button
              onClick={() => {
                const nextFlips = deleteDraft(id)
                onUpdateFlips(nextFlips)
              }}
            >
              Delete
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}

const flipImageType = PropTypes.oneOfType([PropTypes.object, PropTypes.string])

Flip.propTypes = {
  id: PropTypes.string,
  hint: PropTypes.arrayOf(PropTypes.string).isRequired,
  pics: PropTypes.arrayOf(flipImageType).isRequired,
  createdAt: PropTypes.number.isRequired,
  onUpdateFlips: PropTypes.func,
}

export default memo(Flip)
