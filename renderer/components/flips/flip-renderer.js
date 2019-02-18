import React, {Component} from 'react'
import styles from '../../styles/components/flips/flip-renderer'
import {useSafe} from '../../utils/fn'

export class FlipRenderer extends Component {
  canvasId = `canvas${this.props.idx}`

  componentDidMount() {
    useSafe(this.props.canvasRef)(document.getElementById(this.canvasId))
    this.renderCanvas()
  }

  componentDidUpdate() {
    this.renderCanvas()
  }

  render() {
    return (
      <>
        <canvas id={this.canvasId} />
        <style jsx>{styles}</style>
      </>
    )
  }

  renderCanvas = () => {
    const {src, crop} = this.props

    const canvas = document.getElementById(this.canvasId)
    const ctx = canvas.getContext('2d')

    const image = new Image()
    image.onload = () => {
      const {x, y, width, height} = crop
      ctx.restore()
      canvas.width = width
      canvas.height = height
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height)
      ctx.save()
    }
    image.src = src
  }
}
