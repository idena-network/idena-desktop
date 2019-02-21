import React, {Component} from 'react'
import styles from '../../styles/components/flips/flip-renderer'
import {useSafe} from '../../utils/fn'

export class FlipRenderer extends Component {
  componentDidMount() {
    useSafe(this.props.canvasRef)(document.getElementById(this.props.id))
    this.renderCanvas()
  }

  componentDidUpdate() {
    this.renderCanvas()
  }

  render() {
    return (
      <>
        <canvas id={this.props.id} />
        <style jsx>{styles}</style>
      </>
    )
  }

  renderCanvas = () => {
    const {id, src, crop} = this.props

    const canvas = document.getElementById(id)
    const ctx = canvas.getContext('2d')

    const image = new Image()
    image.onload = () => {
      const {x, y, width, height} = crop
      canvas.width = width
      canvas.height = height
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height)
    }
    image.src = src
  }
}
