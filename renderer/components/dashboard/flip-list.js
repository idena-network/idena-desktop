import {Row, Col} from '../atoms'

const fromBlob = src =>
  URL.createObjectURL(new Blob([src], {type: 'image/jpeg'}))

const Flip = ({pics = []}) => (
  <Row>
    {pics.map(({id, url}) => (
      <Col key={id}>
        <img width={200} src={url} />
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
