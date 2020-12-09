const fs = require('fs-extra')
const tf = require('@tensorflow/tfjs')
const path = require('path')
const axios = require('axios')
const progress = require('progress-stream')
const appDataPath = require('./app-data-path')

module.exports = {
  initTfModel,
  getTfModelFiles,
//  getImageSecurityScore,
//  getFlipSecurityScore,
}

const getTensorFlowDir = () => path.join(appDataPath('userData'), 'tf')
const getTfModelDir = () => path.join(getTensorFlowDir(), 'hd')
const files = [
  'group1-shard1of3.bin',
  'group1-shard2of3.bin',
  'group1-shard3of3.bin',
  'model.json',
  'mobilenet_finetuning.ipynb',
]

function getTfModelFiles() {
  const fullFiles = files.map(file => path.join(getTfModelDir(), file))
  const f = {
    fileNames: files,
    fileFullNames: fullFiles,
  }
  return f
}

async function downloadTfModel() {
  if (!fs.existsSync(getTensorFlowDir())) {
    fs.mkdirSync(getTensorFlowDir())
  }
  if (!fs.existsSync(getTfModelDir())) {
    fs.mkdirSync(getTfModelDir())
  }

  await Promise.all(
    files.map(file =>
      downloadTfModelFile(
        `https://idena.io/tf/hd/mobilenet/${file}`,
        file,
        () => {}
      )
    )
  )
}

async function downloadTfModelFile(url, modelFile, onProgress) {
  const getTfModelFile = () => path.join(getTfModelDir(), modelFile)
  if (fs.existsSync(getTfModelFile())) return

  return new Promise(async (resolve, reject) => {
    try {
      const writer = fs.createWriteStream(getTfModelFile())
      writer.on('finish', () => writer.close(() => resolve()))
      writer.on('error', reject)

      const response = await axios.request({
        method: 'get',
        url,
        responseType: 'stream',
      })

      const str = progress({
        time: 1000,
        length: parseInt(response.headers['content-length'], 10),
      })
      str.on('progress', function(p) {
        onProgress({...p})
      })

      response.data.pipe(str).pipe(writer)
    } catch (error) {
      return reject(error)
    }
  })
}

async function initTfModel(expressPort) {
  await downloadTfModel()
  return

  const tfModel =
    global.tfModel || await tf.loadLayersModel(`http://localhost:${expressPort}/model.json`)

  if (!global.tfModel) {
    global.tfModel = tfModel


    // Test GPU for Tensorflow
    const testTfImg =
      'data:image/png;base64,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'

    const testScore = await getImageSecurityScore(testTfImg)

    if (testScore === 0) {
      global.tfEnableGPU = false
      await tf.setBackend('cpu')
    }
  }
  return tfModel
}

async function getFlipSecurityScore(images) {
  const scores = await Promise.all(
    images.map(image => getImageSecurityScore(image))
  )
  const flipScore = scores.reduce((s1, s2) => s1 + s2)
  return Math.min(4, flipScore + 1)
}

function getImageSecurityScore(imageDataUrl) {
  // eslint-disable-next-line prefer-destructuring
  const tfModel = global.tfModel

  return new Promise(resolve => {
    if (!tfModel) {
      console.error('Tensor flow model is not loaded')
      resolve(0)
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

      const predictions = await tfModel.predict(tensor).data()
      const maxPrediction = predictions.reduce((m, n) => Math.max(m, n))
      const maxIdx = predictions.indexOf(maxPrediction)
      resolve(maxIdx === 0 ? 1 : 0)
    }
  })
}
