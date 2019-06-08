import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../../../shared/theme'
import FlipImage from './flip-image'
import {Box, Text, Button, Link} from '../../../../shared/components'
import {composeHint} from '../utils/flip'
import FlipType from '../types/flip-type'
import Flex from '../../../../shared/components/flex'

function FlipCover({id, hint, pics, type, createdAt, onDelete}) {
  const isDraft = type === FlipType.Draft
  return (
    <Box my={theme.spacings.normal} w="25%">
      <Box my={theme.spacings.small}>
        <FlipImage src={pics[0]} />
      </Box>
      <Box my={theme.spacings.small}>
        <Text>{composeHint(hint)}</Text>
      </Box>
      <Box my={theme.spacings.small}>
        <Text color={theme.colors.muted}>
          {new Date(createdAt).toLocaleString()}
        </Text>
      </Box>
      <Box p={theme.spacings.normal}>
        <Flex justify="flex-start">
          {isDraft && <Link href={`/flips/edit?id=${id}`}>Edit</Link>}
          {isDraft && <Button onClick={onDelete}>Delete</Button>}
        </Flex>
      </Box>
    </Box>
  )
}

FlipCover.propTypes = {
  id: PropTypes.string.isRequired,
  hint: PropTypes.arrayOf(PropTypes.string).isRequired,
  pics: PropTypes.arrayOf(PropTypes.string).isRequired,
  type: PropTypes.shape(FlipType),
  createdAt: PropTypes.number.isRequired,
  onDelete: PropTypes.func,
}

export default FlipCover
