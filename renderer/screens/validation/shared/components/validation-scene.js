/* eslint-disable react/no-array-index-key */
import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import {Col, Box, Fill} from '../../../../shared/components'
import Flex from '../../../../shared/components/flex'
import Arrow from './arrow'
import {reorderList} from '../../../../shared/utils/arr'
import Spinner from './spinner'
import theme from '../../../../shared/theme'

const selectedStyle = {
  border: `solid 2px ${theme.colors.primary}`,
  boxShadow: '0 0 4px 4px rgba(87, 143, 255, 0.25)',
}

function ValidationScene({
  flip = [],
  orders = [[], []],
  onPrev,
  onNext,
  onAnswer,
  selectedOption,
  loaded,
  last,
}) {
  const style = {borderRadius: rem(8), position: 'relative', height: '100%'}
  return (
    <Flex justify="space-between" flex="1">
      <Col onClick={onPrev} w={4}>
        <Arrow dir="prev" />
      </Col>
      <Flex align="center" width="33%">
        <Flex
          direction="column"
          justify="center"
          align="center"
          css={selectedOption === 0 ? {...selectedStyle, ...style} : style}
          width="100%"
          onClick={() => onAnswer(0)}
        >
          {loaded ? (
            reorderList(flip, orders[0]).map((src, idx) => (
              <Box key={orders[0][idx]}>
                <img
                  // eslint-disable-next-line react/no-array-index-key
                  alt="currentFlip"
                  width={140}
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
        <Box w="2em">&nbsp;</Box>
        <Flex
          direction="column"
          justify="center"
          align="center"
          css={selectedOption === 1 ? {...selectedStyle, ...style} : style}
          width="100%"
          onClick={() => onAnswer(1)}
        >
          {loaded ? (
            reorderList(flip, orders[1]).map((src, idx) => (
              <Box key={orders[1][idx]}>
                <img
                  // eslint-disable-next-line react/no-array-index-key
                  alt="currentFlip"
                  width={140}
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
      <Col onClick={last ? null : onNext} w={4}>
        {!last && <Arrow dir="next" />}
      </Col>
    </Flex>
  )
}

ValidationScene.propTypes = {
  flip: PropTypes.arrayOf(PropTypes.object),
  orders: PropTypes.arrayOf(PropTypes.array),
  onPrev: PropTypes.func,
  onNext: PropTypes.func,
  onAnswer: PropTypes.func,
  selectedOption: PropTypes.number,
  loaded: PropTypes.bool,
  last: PropTypes.bool,
}

export default ValidationScene
