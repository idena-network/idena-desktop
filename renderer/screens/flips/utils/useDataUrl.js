/* eslint-disable import/prefer-default-export */

import {useState, useEffect} from 'react'

/**
 * Returns an image as `base64` string
 * @param {string} imageUrl Image url
 * @returns {string} Base64-encoded image
 */
export function useDataUrl(imageUrl) {
  const [dataUrl, setDataUrl] = useState()

  useEffect(() => {
    let img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl

    const handleLoad = () => {
      const canvas = document.createElement('canvas')
      ;[canvas.width, canvas.height] = [img.width, img.height]
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      setDataUrl(canvas.toDataURL())
    }

    img.addEventListener('load', handleLoad, false)

    return () => {
      img.removeEventListener('load', handleLoad)
      img = null
    }
  }, [imageUrl])

  return dataUrl
}

export function convertToBase64Url(url, callback, outputFormat) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    let canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    let dataURL = ''
    canvas.height = img.height
    canvas.width = img.width
    ctx.drawImage(img, 0, 0)
    dataURL = canvas.toDataURL(outputFormat)
    callback(dataURL)
    canvas = null
  }
  img.src = url
}
