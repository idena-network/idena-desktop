import * as tf from '@tensorflow/tfjs'

export async function initTfModel() {
  // TODO: Download model

  // Init tf
  const tfModel = await tf.loadLayersModel('/static/mobilenet/model.json')

  // TODO: Test GPU

  return tfModel
}

export async function getFlipSecurityScore(tfModel, images) {
  if (!tfModel) {
    console.error('Tensor flow model is not loaded')
  } else {
    const scores = await Promise.all(
      images.map(image => getImageSecurityScore(tfModel, image))
    )
    console.log('scores=', scores)
    const flipScore = scores.reduce((s1, s2) => s1 + s2)
    return Math.min(4, flipScore + 1)
  }
}

export function getImageSecurityScore(tfModel, imageDataUrl) {
  return new Promise((resolve, reject) => {
    if (!tfModel) {
      console.error('Tensor flow model is not loaded')
      reject()
    }

    if (!imageDataUrl) resolve(0)

    const img = new Image()
    img.src = imageDataUrl

    img.onload = async () => {
      const tensorImg = tf.browser.fromPixels(img)
      const offset = tf.scalar(127.5)
      const tensor = tensorImg
        .sub(offset)
        .div(offset)
        .resizeBilinear([224, 224])
        .expandDims()

      //tf.setBackend('webgl')
      //const gpuPredictions = await tfModel.predict(tensor).data()
      //console.log('GPU', gpuPredictions)

      tf.setBackend('cpu')
      const cpuPredictions = await tfModel.predict(tensor).data()
      console.log('CPU', cpuPredictions)

      const predictions = cpuPredictions

      const maxPrediction = predictions.reduce((m, n) => Math.max(m, n))

      const maxIdx = predictions.indexOf(maxPrediction)

      resolve(maxIdx === 0 ? 1 : 0)
    }
  })
}
