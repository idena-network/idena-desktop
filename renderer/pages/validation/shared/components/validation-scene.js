/* eslint-disable react/no-array-index-key */
import React from 'react'
import PropTypes from 'prop-types'
import {Col, Box} from '../../../../shared/components'
import Flex from '../../../../shared/components/flex'

const reorderList = (list, nextOrder) => {
  const nextList = []
  nextOrder.forEach(ord => {
    nextList.push(list[ord])
  })
  return nextList
}

const selectedStyle = {
  border: 'solid 2px red',
}

function ValidationScene({
  flip = [],
  orders = [[], []],
  onPrev,
  onNext,
  onAnswer,
  selectedOption,
}) {
  return (
    <Flex justify="space-between" align="center" flex="1">
      <Col onClick={onPrev} p="0 1em" w={4} css={{lineHeight: 10}}>
        {`<`}
      </Col>
      <Flex align="center">
        <Flex
          direction="column"
          justify="center"
          align="center"
          css={selectedOption === 0 ? selectedStyle : null}
        >
          {reorderList(flip, orders[0]).map(src => (
            <Box onClick={() => onAnswer(0)}>
              <img
                // eslint-disable-next-line react/no-array-index-key
                alt="currentFlip"
                width={100}
                src={URL.createObjectURL(new Blob([src], {type: 'image/jpeg'}))}
              />
            </Box>
          ))}
        </Flex>
        <Box w="2em">&nbsp;</Box>
        <Flex
          direction="column"
          justify="center"
          align="center"
          css={selectedOption === 1 ? selectedStyle : null}
        >
          {reorderList(flip, orders[1]).map(src => (
            <Box onClick={() => onAnswer(1)}>
              <img
                // eslint-disable-next-line react/no-array-index-key
                alt="currentFlip"
                width={100}
                src={URL.createObjectURL(new Blob([src], {type: 'image/jpeg'}))}
              />
            </Box>
          ))}
        </Flex>
      </Flex>
      <Col
        onClick={onNext}
        p="0 1em"
        w={4}
        css={{lineHeight: 10, textAlign: 'right'}}
      >
        {'>'}
      </Col>
    </Flex>
  )
}

ValidationScene.propTypes = {
  flip: PropTypes.arrayOf(PropTypes.array),
  orders: PropTypes.arrayOf(PropTypes.array),
  onPrev: PropTypes.func,
  onNext: PropTypes.func,
  onAnswer: PropTypes.func,
  selectedOption: PropTypes.number,
}

export default ValidationScene
