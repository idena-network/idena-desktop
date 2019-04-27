import React, {Component} from 'react'

export class FlipDisplay extends Component {
  canvasRef = React.createRef()

  componentDidMount() {
    const {imageData} = this.props
    const ctx = this.canvasRef.current.getContext('2d')
    ctx.putImageData(imageData, 0, 0)
  }

  render() {
    const {width, height} = this.props.imageData
    return (
      <>
        <canvas ref={this.canvasRef} width={width} height={height} />
        <style jsx>{`
          canvas {
            display: block;
          }
        `}</style>
      </>
    )
  }
}
