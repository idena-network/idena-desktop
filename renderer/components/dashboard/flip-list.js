import React from 'react'
import {Row, Col, Box} from '../../shared/components'

const fromBlob = src =>
  URL.createObjectURL(new Blob([src], {type: 'image/jpeg'}))

// eslint-disable-next-line react/prop-types
function Flip({pics = []}) {
  return (
    <Row>
      {pics.map((src, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Col key={idx}>
          <img height={100} src={fromBlob(src)} alt={src} />
        </Col>
      ))}
    </Row>
  )
}

// eslint-disable-next-line react/prop-types
export function FlipList({flips}) {
  return (
    <Box m="1em 0">
      {flips.map((flip, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Flip key={idx} pics={flip} />
      ))}
    </Box>
  )
}

export default FlipList
