import {Row, Col} from '../atoms'

const fromBlob = src =>
  URL.createObjectURL(new Blob([src], {type: 'image/jpeg'}))

const Flip = ({pics = []}) => (
  <Row>
    {pics.map((src, idx) => (
      <Col key={idx}>
        <img height={100} src={fromBlob(src)} />
      </Col>
    ))}
  </Row>
)

export const FlipList = ({flips}) => (
  <div>
    {flips.map((flip, idx) => (
      <Flip key={idx} pics={flip} />
    ))}
    <style jsx>{`
      div {
        margin: 1em 0;
      }
    `}</style>
  </div>
)
