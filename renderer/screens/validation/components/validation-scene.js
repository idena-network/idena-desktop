import React from 'react'
import PropTypes from 'prop-types'
import {rem, margin} from 'polished'
import {Col, Box, Fill} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import Arrow from './arrow'
import {reorderList} from '../../../shared/utils/arr'
import Spinner from './spinner'
import theme from '../../../shared/theme'
import {AnswerType} from '../../../shared/providers/validation-context'

const style = {
  borderRadius: rem(8),
  ...margin(0, rem(theme.spacings.medium24), 0),
  position: 'relative',
  height: '100%',
}

const selectedStyle = {
  border: `solid 2px ${theme.colors.primary}`,
  boxShadow: '0 0 4px 4px rgba(87, 143, 255, 0.25)',
}

function ValidationScene({
  flip,
  onPrev,
  onNext,
  onAnswer,
  isFirst,
  isLast,
  type,
}) {
  const {pics, answer, ready, orders} = flip
  return (
    <Flex
      justify="space-between"
      flex={1}
      css={margin(0, rem(theme.spacings.medium24), 0)}
    >
      {!isFirst && (
        <Col onClick={onPrev} w={4}>
          <Arrow dir="prev" type={type} />
        </Col>
      )}
      <Flex>
        <Flex
          direction="column"
          align="center"
          css={answer === 1 ? {...selectedStyle, ...style} : style}
          width="100%"
        >
          {ready ? (
            reorderList(pics, orders[0]).map((src, idx) => (
              <Box
                key={orders[0][idx]}
                onClick={() => onAnswer(AnswerType.Left)}
              >
                <img
                  alt="currentFlip"
                  height={110}
                  width={147}
                  style={{
                    background: theme.colors.white,
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                  src={URL.createObjectURL(
                    new Blob([src], {type: 'image/jpeg'})
                  )}
                />
              </Box>
            ))
          ) : (
            <Fill>
              <Spinner />
            </Fill>
          )}
        </Flex>
        <Flex
          direction="column"
          justify="center"
          align="center"
          css={answer === 2 ? {...selectedStyle, ...style} : style}
          width="100%"
        >
          {ready ? (
            reorderList(pics, orders[1]).map((src, idx) => (
              <Box
                key={orders[1][idx]}
                onClick={() => onAnswer(AnswerType.Right)}
              >
                <img
                  alt="currentFlip"
                  height={110}
                  width={147}
                  style={{
                    background: theme.colors.white,
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                  src={URL.createObjectURL(
                    new Blob([src], {type: 'image/jpeg'})
                  )}
                />
              </Box>
            ))
          ) : (
            <Fill>
              <Spinner />
            </Fill>
          )}
        </Flex>
      </Flex>
      {!isLast && (
        <Col onClick={onNext} w={4}>
          <Arrow dir="next" type={type} />
        </Col>
      )}
    </Flex>
  )
}

ValidationScene.propTypes = {
  flip: PropTypes.shape({
    pics: PropTypes.arrayOf(PropTypes.string).isRequired,
    ready: PropTypes.bool.isRequired,
    orders: PropTypes.arrayOf(PropTypes.array).isRequired,
    answer: PropTypes.number,
  }),
  onPrev: PropTypes.func,
  onNext: PropTypes.func,
  onAnswer: PropTypes.func,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  type: PropTypes.string.isRequired,
}

export default ValidationScene
