import React from 'react'
import PropTypes from 'prop-types'
import Flex from '../../../../shared/components/flex'
import {Box, Fill} from '../../../../shared/components'
import theme from '../../../../shared/theme'
import {inappropriate, appropriate} from '../utils/answers'

const activeStyle = {
  border: `solid 2px ${theme.colors.primary}`,
}

function FlipThumbnails({currentIndex, flips, answers, onPick}) {
  return (
    <Flex justify="center" align="center" css={{minHeight: '80px'}}>
      {flips.map((flip, idx) => (
        <Box
          css={{
            ...(currentIndex === idx ? activeStyle : {}),
            borderRadius: '4px',
            padding: theme.spacings.xxsmall,
            position: 'relative',
          }}
          onClick={() => onPick(idx)}
        >
          {appropriate(answers[idx]) && <Fill bg={theme.colors.white05} />}
          {inappropriate(answers[idx]) && <Fill bg={theme.colors.danger} />}
          <img
            // eslint-disable-next-line react/no-array-index-key
            key={`flip-${idx}`}
            alt={`flip-${idx}`}
            width={50}
            src={URL.createObjectURL(new Blob([flip[0]], {type: 'image/jpeg'}))}
          />
        </Box>
      ))}
    </Flex>
  )
}

FlipThumbnails.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  flips: PropTypes.arrayOf(PropTypes.array).isRequired,
  answers: PropTypes.arrayOf(PropTypes.number).isRequired,
  onPick: PropTypes.func,
}

export default FlipThumbnails
