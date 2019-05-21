/* eslint-disable no-undef */
import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {Box, Button} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import ImageEditor from './image-editor'
import theme from '../../../../../shared/theme'
import useScript from '../../../utils/useScript'
import {useDataUrl} from '../../../utils/useDataUrl'

const activeStyle = {
  border: `solid 2px ${theme.colors.primary}`,
}

function CreateFlipForm({pics, onUpdateFlip}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pickerLoaded, setPickerLoaded] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)

  // const onCompressEnd = (_ev, data) => {
  //   setPics([
  //     ...pics.slice(0, globIdx),
  //     URL.createObjectURL(new Blob([data], {type: 'image/jpeg'})),
  //     ...pics.slice(globIdx + 1),
  //   ])
  // }

  // useEffect(() => {
  //   global.ipcRenderer.on(compressChannel, onCompressEnd)

  //   return () => {
  //     global.ipcRenderer.removeListener(compressChannel, onCompressEnd)
  //   }
  // }, [])

  const handleUpload = e => {
    e.preventDefault()

    const file = e.target.files[0]

    if (!file || !file.type.startsWith('image')) {
      return
    }

    const reader = new FileReader()
    reader.addEventListener('loadend', re => {
      onUpdateFlip([
        ...pics.slice(0, selectedIndex),
        re.target.result,
        ...pics.slice(selectedIndex + 1),
      ])
      // global.ipcRenderer.send(
      //   compressChannel,
      //   new Uint8Array(readerEvent.target.result)
      // )
    })
    reader.readAsDataURL(file)
  }

  const handleEdit = img => {
    onUpdateFlip([
      ...pics.slice(0, selectedIndex),
      img,
      ...pics.slice(selectedIndex + 1),
    ])
  }

  const [gapiLoaded, gapiError] = useScript('https://apis.google.com/js/api.js')

  useEffect(() => {
    // gapi.load('auth2', onAuthApiLoad)
    if (gapiLoaded && !gapiError) {
      gapi.load('picker', () => setPickerLoaded(true))
    }
  }, [gapiLoaded, gapiError])

  const base64Url = useDataUrl(imageUrl)

  useEffect(() => {
    if (base64Url) {
      onUpdateFlip([
        ...pics.slice(0, selectedIndex),
        base64Url,
        ...pics.slice(selectedIndex + 1),
      ])
    }
  }, [base64Url, onUpdateFlip, pics, selectedIndex])

  // A simple callback implementation.
  function pickerCallback(data) {
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      const doc = data[google.picker.Response.DOCUMENTS][0]
      const [{url}] = doc[google.picker.Document.THUMBNAILS]
      setImageUrl(url)
    }
  }

  // Create and render a Picker object for picking user Photos.
  function createPicker() {
    const view = new google.picker.View(google.picker.ViewId.IMAGE_SEARCH)
    view.setMimeTypes('image/png,image/jpeg,image/jpg')

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      // .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .hideTitleBar()
      .setCallback(pickerCallback)
      .build()
    picker.setVisible(true)
  }

  return (
    <Flex>
      <Box p={theme.spacings.normal}>
        {pics.map((src, idx) => (
          <Box
            key={idx}
            onClick={() => {
              setSelectedIndex(idx)
            }}
            css={idx === selectedIndex ? activeStyle : {}}
          >
            <img src={src} alt={`flip-${idx}`} width={100} />
          </Box>
        ))}
      </Box>
      <Box p={theme.spacings.normal}>
        <ImageEditor src={pics[selectedIndex]} onEdit={handleEdit} />
        <Flex justify="space-around">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={false}
          />

          <Button
            disabled={!pickerLoaded}
            onClick={() => {
              createPicker()
            }}
          >
            {pickerLoaded ? 'Search on Google' : 'Waiting...'}
          </Button>
        </Flex>
      </Box>
    </Flex>
  )
}

CreateFlipForm.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  onUpdateFlip: PropTypes.func.isRequired,
}

export default CreateFlipForm
