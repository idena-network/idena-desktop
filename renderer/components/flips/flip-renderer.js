import React, {Component} from 'react'
import styles from '../../styles/components/flips/flip-renderer'

export class FlipRenderer extends Component {
  componentDidMount() {
    this.props.canvasRef(document.querySelector('canvas'))
    this.renderCanvas()
  }

  componentDidUpdate() {
    this.renderCanvas()
  }

  render() {
    return (
      <>
        <canvas width={1024} height={768} />
        <style jsx>{styles}</style>
      </>
    )
  }

  renderCanvas = () => {
    const {src, crop, imgIdx} = this.props

    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    const image = new Image()

    image.onload = function() {
      const {x, y, width, height} = crop
      ctx.restore()
      ctx.drawImage(
        image,
        x,
        y,
        width,
        height,
        width * imgIdx + (imgIdx > 0 ? 50 : 0),
        0,
        width,
        height
      )
      ctx.save()
    }
    image.src = src
  }
}
