import React from 'react'
import PropTypes from 'prop-types'
import {Draggable, DragDropContext, Droppable} from 'react-beautiful-dnd'
import {FiRefreshCw, FiMove} from 'react-icons/fi'
import {
  rem,
  margin,
  position,
  backgrounds,
  padding,
  borderRadius,
} from 'polished'
import Flex from '../../../shared/components/flex'
import {Box, Absolute} from '../../../shared/components'
import {shuffle} from '../../../shared/utils/arr'
import theme from '../../../shared/theme'
import {IconButton} from '../../../shared/components/button'

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

function FlipShuffle({pics, order, onShuffleFlip}) {
  function onDragEnd(result) {
    if (!result.destination) {
      return
    }

    if (result.destination.index === result.source.index) {
      return
    }

    const nextOrder = reorder(
      order,
      result.source.index,
      result.destination.index
    )

    onShuffleFlip(nextOrder)
  }

  return (
    <Flex justify="center">
      <Box
        css={{
          ...margin(0, rem(theme.spacings.medium24), 0, 0),
          ...borderRadius('top', rem(6)),
          ...borderRadius('bottom', rem(6)),
        }}
      >
        {pics.map(src => (
          <Image key={src} src={src} style={{opacity: 0.3}} />
        ))}
        <ShuffleButton
          onClick={() => {
            const nextOrder = [...shuffle(order)]
            onShuffleFlip(nextOrder)
          }}
        />
      </Box>
      <Box>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="flip">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {order.map((idx, k) => (
                  <Draggable key={idx} draggableId={`pic${idx}`} index={k}>
                    {/* eslint-disable-next-line no-shadow */}
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Image
                          key={idx}
                          src={pics[idx]}
                          style={position('relative')}
                        >
                          <Movable />
                        </Image>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </Flex>
  )
}

FlipShuffle.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  order: PropTypes.arrayOf(PropTypes.number),
  onShuffleFlip: PropTypes.func.isRequired,
}

// eslint-disable-next-line react/prop-types
function Image({src, style, children}) {
  return (
    <Box style={style}>
      <img alt="flip" width={120} src={src} />
      {children}
    </Box>
  )
}

function ShuffleButton(props) {
  return (
    <IconButton
      style={margin(rem(theme.spacings.medium16), 0, 0)}
      icon={<FiRefreshCw />}
      {...props}
    >
      Shuffle
    </IconButton>
  )
}

function Movable(props) {
  return (
    <Absolute
      top={rem(4)}
      right={rem(4)}
      css={{
        ...backgrounds(theme.colors.primary2),
        ...padding(rem(theme.spacings.small8)),
        ...borderRadius('top', rem(6)),
        ...borderRadius('bottom', rem(6)),
        opacity: 0.8,
      }}
      {...props}
    >
      <FiMove color={theme.colors.white} />
    </Absolute>
  )
}

export default FlipShuffle
